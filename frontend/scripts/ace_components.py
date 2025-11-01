"""
ACE Components: Generator, Reflector, and Curator

Implements the three-role architecture from the ACE paper:
1. Generator: Produces reasoning trajectories with feedback on bullets
2. Reflector: Extracts lessons from trajectories 
3. Curator: Synthesizes lessons into delta updates
"""

from typing import Any, Dict, List, Optional
from dataclasses import dataclass
import json
import re
from ace_memory import Bullet, DeltaUpdate, ACEMemory


# ============== PROMPTS ==============

REFLECTOR_PROMPT = """You are the Reflector in an Agentic Context Engineering system.

Your role is to analyze the execution trace and extract concrete, actionable lessons that can help improve future performance.

## Execution Trace
{trace}

## Current Question
{question}

## Ground Truth Answer (if available)
{ground_truth}

## Model's Answer
{model_answer}

## Execution Success
{success}

## Instructions
Analyze the execution trace above and extract specific lessons:

1. **Successful Strategies**: What specific approaches, tools, or reasoning patterns worked well?
2. **Failure Modes**: What specific mistakes or pitfalls occurred? What should be avoided?
3. **Domain Insights**: What domain-specific knowledge or concepts were crucial?
4. **Tool Usage Patterns**: How should tools be used effectively?

For EACH lesson:
- Be SPECIFIC and CONCRETE (not vague generalizations)
- Include EXAMPLES or CONTEXT when possible
- Make it ACTIONABLE (something that can guide future attempts)
- Keep it FOCUSED on one insight

Output your response as a JSON object:
{{
  "lessons": [
    {{
      "content": "Specific lesson content here",
      "type": "success" or "failure" or "domain" or "tool",
      "tags": ["tag1", "tag2"]
    }},
    ...
  ],
  "reflection": "Brief overall reflection on what was learned"
}}

Output ONLY valid JSON, nothing else."""

CURATOR_PROMPT = """You are the Curator in an Agentic Context Engineering system.

Your role is to synthesize lessons from the Reflector into structured bullet updates for the evolving playbook.

## Reflector's Lessons
{lessons}

## Current Context Bullets (relevant ones)
{current_bullets}

## Instructions
Based on the Reflector's lessons, create a delta update:

1. **New Bullets**: Create NEW bullets for genuinely novel insights
   - Each bullet should be a self-contained, reusable strategy or lesson
   - Should be specific enough to be useful, general enough to be reusable
   - Include appropriate tags for categorization

2. **Update Existing**: If a lesson reinforces an existing bullet, mark it for update
   - Identify the bullet ID
   - Indicate whether it was helpful (+1) or harmful (-1)

3. **Remove**: If a lesson contradicts or invalidates an existing bullet, mark for removal

Output your response as a JSON object:
{{
  "new_bullets": [
    {{
      "content": "The bullet content",
      "tags": ["tag1", "tag2"]
    }},
    ...
  ],
  "update_bullets": {{
    "bullet_id": {{"helpful": 1, "harmful": 0}},
    ...
  }},
  "remove_bullets": ["bullet_id1", "bullet_id2"],
  "reasoning": "Brief explanation of curation decisions"
}}

Output ONLY valid JSON, nothing else."""


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
        
        # Call LLM
        messages = [{"role": "user", "content": prompt}]
        
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
    
    def curate(
        self,
        lessons: List[Dict[str, Any]],
        query: str,
    ) -> DeltaUpdate:
        """
        Curate lessons into a delta update.
        
        Args:
            lessons: Lessons from the Reflector
            query: The original query (for retrieving relevant bullets)
        
        Returns:
            DeltaUpdate to apply to memory
        """
        if not lessons:
            return DeltaUpdate()
        
        # Get relevant current bullets for context
        relevant_bullets = self.memory.retrieve_relevant_bullets(query, top_k=10)
        current_bullets_str = "\n".join(
            f"ID: {b.id}\n{b.format_for_prompt()}"
            for b in relevant_bullets
        ) if relevant_bullets else "No existing bullets"
        
        # Format the prompt
        prompt = CURATOR_PROMPT.format(
            lessons=json.dumps(lessons, indent=2),
            current_bullets=current_bullets_str,
        )
        
        # Call LLM
        messages = [{"role": "user", "content": prompt}]
        
        try:
            response = self.llm.chat(
                messages,
                temperature=0.2,
                max_tokens=2000,
            )
            
            content = response["choices"][0]["message"]["content"]
            
            # Parse JSON response
            delta_data = self._parse_json_response(content)
            
            if not delta_data:
                print("[Curator] Failed to parse delta update")
                return DeltaUpdate()
            
            # Convert to DeltaUpdate object
            delta = DeltaUpdate()
            
            # New bullets
            for bullet_data in delta_data.get("new_bullets", []):
                bullet = Bullet(
                    id="",  # Will be auto-generated
                    content=bullet_data["content"],
                    tags=bullet_data.get("tags", []),
                    helpful_count=1,  # Start with 1 since it came from a successful reflection
                )
                delta.new_bullets.append(bullet)
            
            # Update existing bullets
            delta.update_bullets = delta_data.get("update_bullets", {})
            
            # Remove bullets
            delta.remove_bullets = set(delta_data.get("remove_bullets", []))
            
            delta.metadata = {
                "reasoning": delta_data.get("reasoning", ""),
                "num_lessons": len(lessons),
            }
            
            return delta
            
        except Exception as e:
            print(f"[Curator] Error: {e}")
            return DeltaUpdate()
    
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
        
        # Step 2: Curator creates delta update
        print("[ACE Pipeline] Step 2: Curating delta update...")
        delta = self.curator.curate(lessons, trace.question)
        
        print(f"[ACE Pipeline] Created delta: {len(delta.new_bullets)} new, "
              f"{len(delta.update_bullets)} updates, {len(delta.remove_bullets)} removals")
        
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
    ) -> str:
        """
        Get an enriched prompt with relevant context from memory.
        
        This is what makes memory actually USEFUL - it retrieves and injects
        relevant bullets into the prompt.
        """
        context = self.memory.format_context(question, top_k=top_k)
        
        if context:
            return f"{base_prompt}\n\n{context}\n\nQuestion: {question}"
        else:
            return f"{base_prompt}\n\nQuestion: {question}"
