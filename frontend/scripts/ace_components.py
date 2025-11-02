"""
ACE Components: Generator, Reflector, and Curator

Implements the three-role architecture from the ACE paper:
1. Generator: Produces reasoning trajectories with feedback on bullets
2. Reflector: Extracts lessons from trajectories 
3. Curator: Synthesizes lessons into delta updates
"""

from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass
import json
import os
import re
import sys

# Add project root to path to import prompts
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from ace_memory import Bullet, DeltaUpdate, ACEMemory
from prompts.ace_memory_prompts import REFLECTOR_PROMPT, CURATOR_PROMPT


# ============== COMPONENTS ==============

@dataclass
class ExecutionTrace:
    """Represents the execution trace of a single query"""
    question: str
    model_answer: str
    ground_truth: Optional[str] = None
    success: bool = False
    trace_messages: List[Dict[str, Any]] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.trace_messages is None:
            self.trace_messages = []
        if self.metadata is None:
            self.metadata = {}
    
    def format_trace(self, max_length: int = 5000) -> str:
        """Format trace for prompt inclusion"""
        parts = []
        
        for msg in self.trace_messages[-10:]:  # Last 10 messages
            role = msg.get("role", "unknown")
            content = str(msg.get("content", ""))[:500]  # Truncate long messages
            
            if role == "tool":
                tool_name = msg.get("name", "unknown_tool")
                parts.append(f"[TOOL: {tool_name}] {content}")
            else:
                parts.append(f"[{role.upper()}] {content}")
        
        trace_str = "\n".join(parts)
        
        if len(trace_str) > max_length:
            trace_str = trace_str[:max_length] + "... (truncated)"
        
        return trace_str


class Reflector:
    """
    Reflector: Analyzes execution traces and extracts concrete lessons.
    """
    
    def __init__(self, llm):
        self.llm = llm
    
    def reflect(
        self,
        trace: ExecutionTrace,
        max_refinement_rounds: int = 3,
    ) -> List[Dict[str, Any]]:
        """
        Reflect on an execution trace and extract lessons.
        
        Args:
            trace: The execution trace to analyze
            max_refinement_rounds: Number of refinement iterations
        
        Returns:
            List of lessons extracted
        """
        # Format the prompt
        prompt = REFLECTOR_PROMPT.format(
            trace=trace.format_trace(),
            question=trace.question,
            ground_truth=trace.ground_truth or "Not available",
            model_answer=trace.model_answer,
            success="✓ Success" if trace.success else "✗ Failed",
        )
        
        # Call LLM with strict JSON-only instructions
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a curation assistant. Output ONLY valid JSON that matches the provided schema. "
                    "Never include explanations, markdown fences, or additional text."
                ),
            },
            {"role": "user", "content": prompt},
        ]
        
        for round_num in range(max_refinement_rounds):
            try:
                response = self.llm.chat(
                    messages,
                    temperature=0.3,
                    max_tokens=2000,
                )
                
                content = response["choices"][0]["message"]["content"]
                
                # Parse JSON response
                lessons_data = self._parse_json_response(content)
                
                if lessons_data and "lessons" in lessons_data:
                    return lessons_data["lessons"]
                
                # If parsing failed, try refinement
                if round_num < max_refinement_rounds - 1:
                    messages.append({"role": "assistant", "content": content})
                    messages.append({
                        "role": "user",
                        "content": "Your response was not valid JSON. Please output ONLY valid JSON with the required structure."
                    })
                
            except Exception as e:
                print(f"[Reflector] Error in round {round_num + 1}: {e}")
                if round_num == max_refinement_rounds - 1:
                    return []
        
        return []
    
    def _parse_json_response(self, content: str) -> Optional[Dict[str, Any]]:
        """Parse JSON from LLM response, handling markdown code blocks"""
        try:
            # Remove markdown code blocks if present
            content = content.strip()
            if content.startswith("```"):
                # Find the actual JSON content
                lines = content.split("\n")
                content = "\n".join(lines[1:-1]) if len(lines) > 2 else content
            
            return json.loads(content)
        except json.JSONDecodeError:
            # Try to extract JSON from text
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    pass
            return None


class Curator:
    """
    Curator: Synthesizes lessons into structured delta updates.
    """
    
    def __init__(self, llm, memory: ACEMemory):
        self.llm = llm
        self.memory = memory

    @staticmethod
    def _infer_memory_attributes(content: str, tags: List[str]) -> Tuple[str, Optional[str]]:
        lower = content.lower()
        if any(keyword in lower for keyword in ["step", "goal", "convert", "next", "state", "progress", "now do"]):
            memory_type = "procedural"
        elif any(keyword in lower for keyword in ["user", "student", "prefers", "request", "frustration", "asked", "likes", "history"]):
            memory_type = "episodic"
        elif any(keyword in lower for keyword in ["misconception", "error", "mistake", "struggle", "issue", "confused"]):
            memory_type = "episodic"
        elif any(tag.lower() == "state" for tag in tags):
            memory_type = "procedural"
        else:
            memory_type = "semantic"

        concept = None
        if "denominator" in lower or "lcm" in lower:
            concept = "common_denominator"
        elif "equivalent" in lower:
            concept = "equivalent_fractions"
        elif "numerator" in lower:
            concept = "numerator"
        return memory_type, concept

    def _lessons_to_delta(
        self,
        lessons: List[Dict[str, Any]],
        learner_id: Optional[str] = None,
        topic: Optional[str] = None,
    ) -> DeltaUpdate:
        delta = DeltaUpdate()
        for idx, lesson in enumerate(lessons, 1):
            content = (lesson.get("content") or "").strip()
            if not content:
                continue
            existing_bullet = self.memory.find_similar_bullet(
                content,
                learner_id=learner_id,
                topic=topic,
                threshold=0.9,
            )
            if existing_bullet:
                entry = delta.update_bullets.setdefault(existing_bullet.id, {"helpful": 0, "harmful": 0})
                entry["helpful"] += 1
                print(
                    f"[Curator][Heuristic Reinforce] id={existing_bullet.id} content={content}",
                    flush=True,
                )
                continue
            tags = lesson.get("tags") or []
            ltype = lesson.get("type")
            if ltype:
                tags = list(dict.fromkeys(tags + [ltype]))
            if not tags:
                tags = ["lesson"]
            memory_type, concept = self._infer_memory_attributes(content, tags)

            normalized_tags = []
            for tag in tags:
                lowered = tag.lower()
                if lowered in {"semantic", "episodic", "procedural"}:
                    continue
                normalized_tags.append(tag)

            helpful = 1
            semantic_strength = helpful if memory_type == "semantic" else 0.0
            episodic_strength = helpful if memory_type == "episodic" else 0.0
            procedural_strength = helpful if memory_type == "procedural" else 0.0

            bullet = Bullet(
                id="",
                content=content,
                tags=normalized_tags,
                helpful_count=helpful,
                learner_id=learner_id,
                topic=topic,
                concept=concept,
                memory_type=memory_type,
                semantic_strength=float(semantic_strength),
                episodic_strength=float(episodic_strength),
                procedural_strength=float(procedural_strength),
            )
            delta.new_bullets.append(bullet)
            print(
                f"[Curator][Heuristic New {idx}] type={memory_type} tags={normalized_tags} content={content}",
                flush=True,
            )
        delta.metadata = {
            "reasoning": "heuristic_lessons_to_bullets",
            "num_lessons": len(lessons),
        }
        if learner_id:
            delta.metadata["learner_id"] = learner_id
        if topic:
            delta.metadata["topic"] = topic
        return delta

    def curate(
        self,
        lessons: List[Dict[str, Any]],
        query: str,
        learner_id: Optional[str] = None,
        topic: Optional[str] = None,
        **_: Any,
    ) -> DeltaUpdate:
        """
        Curate lessons into a delta update.
        
        Args:
            lessons: Lessons from the Reflector
            query: The original query (for retrieving relevant bullets)
            learner_id: Optional learner identifier for personalised bullets
            topic: Optional inferred topic for improved tagging
        
        Returns:
            DeltaUpdate to apply to memory
        """
        if not lessons:
            return DeltaUpdate()

        use_llm = os.getenv("ACE_CURATOR_USE_LLM", "false").lower() in {"1", "true", "yes"}

        # Get relevant current bullets for context
        relevant_bullets = self.memory.retrieve_relevant_bullets(
            query,
            top_k=10,
            learner_id=learner_id,
            topic=topic,
        )
        current_bullets_str = "\n".join(
            f"ID: {b.id}\n{b.format_for_prompt()}\nType: {b.memory_type} | Learner: {b.learner_id} | Topic: {b.topic}"
            for b in relevant_bullets
        ) if relevant_bullets else "No existing bullets"
        
        # Format the prompt
        prompt = CURATOR_PROMPT.format(
            lessons=json.dumps(lessons, indent=2),
            current_bullets=current_bullets_str,
        )
        
        if not use_llm:
            print("[Curator] Using heuristic delta generation (LLM disabled).", flush=True)
            delta = self._lessons_to_delta(lessons, learner_id=learner_id, topic=topic)
            delta.metadata.update({
                "reasoning": "heuristic_lessons_to_bullets",
                "prompt": prompt,
                "learner_id": learner_id,
                "topic": topic,
            })
            return delta

        # Call LLM
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a curation assistant. Output ONLY valid JSON that matches the provided schema. "
                    "Never include explanations, markdown fences, or additional text."
                ),
            },
            {"role": "user", "content": prompt},
        ]
        max_rounds = 3
        delta_data = None
        content = ""

        for round_idx in range(max_rounds):
            response = self.llm.chat(
                messages,
                temperature=0.2,
                max_tokens=2000,
                response_mime_type="application/json",
            )
            content = response["choices"][0]["message"]["content"]
            delta_data = self._parse_json_response(content)
            if delta_data:
                break

            snippet = content.strip().replace("\n", " ")
            if len(snippet) > 500:
                snippet = snippet[:500] + "..."
            print(f"[Curator] Failed to parse delta update (round {round_idx + 1})", flush=True)
            print(f"[Curator] Raw response: {snippet}", flush=True)

            if round_idx < max_rounds - 1:
                messages.append({"role": "assistant", "content": content})
                messages.append({
                    "role": "user",
                    "content": (
                        "Your previous response was not valid JSON. Please respond with ONLY the JSON object matching the required schema."
                    ),
                })

        if not delta_data:
            print("[Curator] Falling back to deterministic delta generation", flush=True)
            fallback = self._lessons_to_delta(lessons, learner_id=learner_id, topic=topic)
            fallback.metadata.update({
                "reasoning": "fallback_from_unparsed_curator",
                "num_lessons": len(lessons),
                "json_rounds": round_idx + 1,
                "raw_response": content.strip(),
                "learner_id": learner_id,
                "topic": topic,
            })
            return fallback

        # Convert to DeltaUpdate object
        delta = DeltaUpdate()

        # New bullets
        for bullet_data in delta_data.get("new_bullets", []):
            helpful = bullet_data.get("helpful")
            harmful = bullet_data.get("harmful")
            tags = bullet_data.get("tags", [])
            bullet = Bullet(
                id="",  # Will be auto-generated
                content=bullet_data["content"],
                tags=tags,
                helpful_count=int(helpful) if helpful is not None else 1,
                harmful_count=int(harmful) if harmful is not None else 0,
                learner_id=bullet_data.get("learner_id") or learner_id,
                topic=bullet_data.get("topic") or topic,
                concept=bullet_data.get("concept"),
                memory_type=bullet_data.get("memory_type"),
            )
            if bullet.memory_type not in {"semantic", "episodic", "procedural"}:
                inferred_type, inferred_concept = self._infer_memory_attributes(bullet.content, tags)
                bullet.memory_type = inferred_type
                if not bullet.concept and inferred_concept:
                    bullet.concept = inferred_concept
            delta.new_bullets.append(bullet)

        # Update existing bullets
        delta.update_bullets = delta_data.get("update_bullets", {})

        # Remove bullets
        delta.remove_bullets = set(delta_data.get("remove_bullets", []))

        delta.metadata = {
            "reasoning": delta_data.get("reasoning", ""),
            "num_lessons": len(lessons),
            "json_rounds": round_idx + 1,
            "raw_response": content.strip(),
            "learner_id": learner_id,
            "topic": topic,
        }

        return delta
    
    def _parse_json_response(self, content: str) -> Optional[Dict[str, Any]]:
        """Parse JSON from LLM response"""
        try:
            content = content.strip()
            if content.startswith("```"):
                lines = content.split("\n")
                content = "\n".join(lines[1:-1]) if len(lines) > 2 else content
            
            return json.loads(content)
        except json.JSONDecodeError:
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    pass
            return None


class ACEPipeline:
    """
    Complete ACE pipeline: coordinates Generator, Reflector, and Curator.
    """
    
    def __init__(self, llm, memory: ACEMemory):
        self.llm = llm
        self.memory = memory
        self.reflector = Reflector(llm)
        self.curator = Curator(llm, memory)
    
    def process_execution(
        self,
        trace: ExecutionTrace,
        apply_update: bool = True,
    ) -> Optional[DeltaUpdate]:
        """
        Process a single execution trace through the ACE pipeline.
        
        Args:
            trace: The execution trace
            apply_update: Whether to apply the delta to memory
        
        Returns:
            The delta update (or None if reflection failed)
        """
        print(f"[ACE Pipeline] Processing execution...")

        # Step 1: Reflector extracts lessons
        print("[ACE Pipeline] Step 1: Reflecting on execution...")
        lessons = self.reflector.reflect(trace)
        
        if not lessons:
            print("[ACE Pipeline] No lessons extracted")
            return None
        
        print(f"[ACE Pipeline] Extracted {len(lessons)} lessons")
        for idx, lesson in enumerate(lessons, 1):
            content = lesson.get("content", "").strip()
            ltype = lesson.get("type", "unknown")
            tags = lesson.get("tags", [])
            print(
                f"[ACE Pipeline][Lesson {idx}] type={ltype} tags={tags} content={content}",
                flush=True,
            )

        metadata = trace.metadata or {}
        scratch_state = metadata.get("scratch") if isinstance(metadata, dict) else {}
        if not isinstance(scratch_state, dict):
            scratch_state = {}
        learner_id = metadata.get("learner_id") or scratch_state.get("learner_id")
        topic = scratch_state.get("topic") or _infer_topic_from_text(trace.question)

        # Step 2: Curator creates delta update
        print("[ACE Pipeline] Step 2: Curating delta update...")
        delta = self.curator.curate(lessons, trace.question, learner_id=learner_id, topic=topic)

        print(f"[ACE Pipeline] Created delta: {len(delta.new_bullets)} new, "
              f"{len(delta.update_bullets)} updates, {len(delta.remove_bullets)} removals")
        if not delta.new_bullets and not delta.update_bullets and not delta.remove_bullets:
            print("[ACE Pipeline][Delta] No changes to apply (likely curator parse failure or neutral lessons)", flush=True)
        if delta.new_bullets:
            for idx, bullet in enumerate(delta.new_bullets, 1):
                print(
                    f"[ACE Pipeline][Delta New {idx}] content={bullet.content} "
                    f"tags={bullet.tags} helpful={bullet.helpful_count}",
                    flush=True,
                )
        if delta.update_bullets:
            for bid, updates in delta.update_bullets.items():
                print(
                    f"[ACE Pipeline][Delta Update] id={bid} changes={updates}",
                    flush=True,
                )
        if delta.remove_bullets:
            for bid in delta.remove_bullets:
                print(f"[ACE Pipeline][Delta Remove] id={bid}", flush=True)
        if delta.metadata:
            print(f"[ACE Pipeline][Delta Metadata] {delta.metadata}", flush=True)
        if topic and "topic" not in delta.metadata:
            delta.metadata["topic"] = topic
        if learner_id and "learner_id" not in delta.metadata:
            delta.metadata["learner_id"] = learner_id
        
        # Step 3: Apply delta to memory
        if apply_update:
            print("[ACE Pipeline] Step 3: Applying delta to memory...")
            self.memory.apply_delta(delta)
            print("[ACE Pipeline] Memory updated successfully")
        
        return delta
    
    def get_enriched_prompt(
        self,
        question: str,
        base_prompt: str,
        top_k: int = 10,
        learner_id: Optional[str] = None,
        topic: Optional[str] = None,
    ) -> str:
        """
        Get an enriched prompt with relevant context from memory.
        
        This is what makes memory actually USEFUL - it retrieves and injects
        relevant bullets into the prompt.
        """
        context = self.memory.format_context(
            question,
            top_k=top_k,
            learner_id=learner_id,
            topic=topic,
        )
        
        if context:
            return f"{base_prompt}\n\n{context}\n\nQuestion: {question}"
        else:
            return f"{base_prompt}\n\nQuestion: {question}"
def _infer_topic_from_text(text: str) -> Optional[str]:
    lowered = (text or "").lower()
    if "fraction" in lowered or "/" in lowered:
        if "add" in lowered or "+" in lowered:
            return "fraction_addition"
        return "fractions"
    if "decimal" in lowered:
        return "decimals"
    if "percentage" in lowered or "%" in lowered:
        return "percentages"
    return None
