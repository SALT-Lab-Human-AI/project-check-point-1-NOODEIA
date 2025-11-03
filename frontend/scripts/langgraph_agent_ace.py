"""
ACE-Enhanced LangGraph Agent

Integrates Agentic Context Engineering into the LangGraph workflow:
- Uses ACE memory to enrich prompts before generation
- Applies ACE pipeline after execution to learn from traces
- Supports both offline and online adaptation
"""

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph_utile import *
from typing import Any, Dict, List, Optional
from pathlib import Path
import time
import os
import re

# Import ACE components
from ace_memory import ACEMemory
from ace_components import ACEPipeline, ExecutionTrace
from ace_memory_store import Neo4jMemoryStore


# Global ACE caches keyed by learner identifier
_ACE_CACHE: Dict[str, Dict[str, Any]] = {}


def _extract_retrieval_facets(message: str, scratch: Dict[str, Any]) -> Dict[str, Any]:
    facets: Dict[str, Any] = {}
    lowered = (message or "").lower()

    if any(token in lowered for token in ("visual", "diagram", "picture", "draw", "show me")):
        facets["needs_visual"] = True

    persona = scratch.get("persona_request") or scratch.get("voice")
    if persona:
        facets["persona_request"] = str(persona).lower()

    fractions = re.findall(r"\d+\s*/\s*\d+", message or "")
    if fractions:
        facets["fractions"] = [f.replace(" ", "") for f in fractions]

    if "next step" in lowered or ("step" in lowered and "what" in lowered):
        facets["next_step_flag"] = True

    if any(phrase in lowered for phrase in ("too big", "big denominator", "large denominator", "denominator so big", "lcd too big")):
        facets.setdefault("misconceptions", []).append("lcd_too_big")

    if "add numerator" in lowered and "denominator" in lowered:
        facets.setdefault("misconceptions", []).append("add_tops_bottoms")

    return facets


def _infer_topic(question: str) -> Optional[str]:
    lowered = (question or "").lower()
    if "fraction" in lowered or "/" in lowered:
        if "add" in lowered or "+" in lowered:
            return "fraction_addition"
        return "fractions"
    if "decimal" in lowered:
        return "decimals"
    if "percentage" in lowered or "%" in lowered:
        return "percentages"
    return None


def get_ace_system(learner_id: Optional[str] = None):
    """Get or create the ACE system for a specific learner."""
    key = learner_id or "global"
    entry = _ACE_CACHE.get(key)
    if entry is None:
        entry = {}
        _ACE_CACHE[key] = entry

    target_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    try:
        target_temperature = float(os.getenv("ACE_LLM_TEMPERATURE", "0.2"))
    except ValueError:
        target_temperature = 0.2

    memory = entry.get("memory")
    if memory is None:
        # Require Neo4j storage for all learners
        if not learner_id:
            raise ValueError("[ACE Memory] Error: learner_id is required for memory storage")

        try:
            storage = Neo4jMemoryStore(learner_id)
        except Exception as exc:
            raise RuntimeError(
                f"[ACE Memory] CRITICAL: Neo4j storage initialization failed for learner={learner_id}. "
                f"Error: {exc}. Please check Neo4j credentials and connection."
            )

        memory = ACEMemory(
            max_bullets=100,
            dedup_threshold=0.85,
            prune_threshold=0.3,
            storage=storage,
        )
        entry["memory"] = memory

    pipeline = entry.get("pipeline")
    if (
        pipeline is None
        or getattr(pipeline, "_llm_model", None) != target_model
        or getattr(pipeline, "_llm_temperature", None) != target_temperature
    ):
        from langgraph_utile import LLM

        llm = LLM(model=target_model, temperature=target_temperature)
        pipeline = ACEPipeline(llm, memory)
        pipeline._llm_model = target_model
        pipeline._llm_temperature = target_temperature
        entry["pipeline"] = pipeline

    return memory, pipeline


def router_node(state: GraphState) -> GraphState:
    """Router with ACE memory retrieval"""
    if state.get("mode"):
        return state

    scratch = state.setdefault("scratch", {})
    user_messages = [m.get("content", "") for m in state.get("messages", []) if m.get("role") == "user"]
    user_text = user_messages[-1] if user_messages else ""
    full_user_text = " ".join(user_messages)
    normalized_text = full_user_text.lower()
    learner_id = scratch.get("learner_id")
    topic = scratch.get("topic") or _infer_topic(user_text)
    if topic:
        scratch["topic"] = topic
        state["scratch"] = scratch

    # Get ACE memory for context-aware routing
    memory, _ = get_ace_system(learner_id)
    if not scratch.get("_ace_memory_loaded"):
        if not memory.consume_fresh_init_flag():
            memory.reload_from_storage()
        scratch["_ace_memory_loaded"] = True
        state["scratch"] = scratch

    # Retrieve relevant bullets to inform routing decision
    retrieval_facets = _extract_retrieval_facets(user_text, scratch)
    scratch["ace_retrieval_facets"] = retrieval_facets
    state["scratch"] = scratch

    relevant_bullets = memory.retrieve_relevant_bullets(
        user_text,
        top_k=5,
        learner_id=learner_id,
        topic=topic,
        facets=retrieval_facets,
    )

    # Store bullets in scratch for use by other nodes
    state.setdefault("scratch", {})["ace_bullets"] = [b.to_dict() for b in relevant_bullets]

    # Check for Neo4j/database queries
    if any(w in normalized_text for w in ["chapter", "unit", "textbook", "quiz", "user", "session", "group", "message", "database", "graph"]):
        state["mode"] = "react"
    # Check for calculator needs
    elif any(w in normalized_text for w in ["calculate", "sum", "difference", "product", "ratio", "percent", "%", "number", "verify", "double check", "make sure", "confirm", "check if"]):
        state["mode"] = "react"
    # Check for web search needs
    elif any(w in normalized_text for w in ["search", "web", "internet", "current", "latest", "trending", "news", "online", "look up", "find out", "recent", "today"]):
        state["mode"] = "react"
    # Check for tree-of-thought needs
    elif any(w in normalized_text for w in ["plan", "options", "steps", "strategy", "search space"]):
        state["mode"] = "tot"
    else:
        state["mode"] = "cot"

    return state


def planner_node(state: GraphState) -> GraphState:
    """Planner with ACE-enriched parameters"""
    mode = state["mode"]
    scratch = dict(state.get("scratch", {}))
    
    if mode == "tot":
        scratch.setdefault("breadth", 3)
        scratch.setdefault("depth", 2)
        scratch.setdefault("temperature", 0.2)
    elif mode == "react":
        scratch.setdefault("max_turns", 8)
        tool_schemas = [_calculator_schema(), _deep_research_schema(), _neo4j_retrieveqa_schema()]
        scratch["tool_names"] = [t["function"]["name"] for t in tool_schemas]
        scratch.setdefault("temperature", 0.2)
    elif mode == "cot":
        scratch.setdefault("k", 1)
        scratch.setdefault("temperature", 0.2 if scratch["k"] == 1 else 0.7)
    
    # Add ACE context flag
    scratch["use_ace_context"] = True
    
    state["scratch"] = scratch
    return state


def solver_node_with_ace(state: GraphState) -> GraphState:
    """
    Solver that uses ACE memory to enrich prompts.
    
    This is the KEY innovation: Before solving, we inject relevant
    strategies and lessons from memory into the context.
    """
    mode = state["mode"]
    scratch = state.get("scratch", {})

    # Get the user question
    user_messages = [m.get("content", "") for m in state.get("messages", []) if m.get("role") == "user"]
    question = user_messages[-1] if user_messages else ""
    full_question = " ".join(user_messages)

    learner_id = scratch.get("learner_id")
    topic = scratch.get("topic") or _infer_topic(question)
    if topic and scratch.get("topic") != topic:
        scratch["topic"] = topic
        state["scratch"] = scratch

    # Get ACE system
    memory, pipeline = get_ace_system(learner_id)

    facets = scratch.get("ace_retrieval_facets") or _extract_retrieval_facets(question, scratch)
    scratch["ace_retrieval_facets"] = facets
    scratch["ace_full_question"] = full_question
    scratch["ace_latest_question"] = question
    state["scratch"] = scratch

    # Enrich messages with ACE context if enabled
    if scratch.get("use_ace_context", True):
        retrieved_bullets = memory.retrieve_relevant_bullets(
            question,
            top_k=10,
            learner_id=learner_id,
            topic=topic,
            facets=facets,
        )
        if retrieved_bullets:
            print(
                f"[ACE Memory][Inject] Retrieved {len(retrieved_bullets)} bullets for question: {question.strip()}",
                flush=True,
            )
            for idx, bullet in enumerate(retrieved_bullets, 1):
                score = memory._compute_score(bullet)  # type: ignore
                print(
                    f"[ACE Memory][Bullet {idx}] id={bullet.id} score={score:.3f}"
                    f" helpful={bullet.helpful_count} harmful={bullet.harmful_count}"
                    f" type={bullet.memory_type} learner={bullet.learner_id} topic={bullet.topic}"
                    f" tags={bullet.tags}"
                    f" content={bullet.content}",
                    flush=True,
                )

            context_parts = ["=== Relevant Strategies and Lessons ==="]
            for idx, bullet in enumerate(retrieved_bullets, 1):
                suffix = []
                if bullet.memory_type:
                    suffix.append(f"type={bullet.memory_type}")
                if bullet.topic:
                    suffix.append(f"topic={bullet.topic}")
                if bullet.learner_id:
                    suffix.append(f"learner={bullet.learner_id}")
                annotation = f" ({', '.join(suffix)})" if suffix else ""
                context_parts.append(f"{idx}. {bullet.format_for_prompt()}{annotation}")
            context_parts.append("=" * 50)
            context = "\n".join(context_parts)

            messages = state.get("messages", [])
            context_injected = False
            for i, msg in enumerate(messages):
                if msg.get("role") == "system":
                    messages[i]["content"] = f"{context}\n\n{msg['content']}"
                    context_injected = True
                    break

            if not context_injected and messages:
                if messages[0].get("role") == "user":
                    messages[0]["content"] = f"{context}\n\n{messages[0]['content']}"

            state["messages"] = messages
    
    # Call the original solver
    from langgraph_utile import solve_cot, solve_tot, solve_react
    
    if mode == "cot":
        result = solve_cot(state)
    elif mode == "tot":
        result = solve_tot(state)
    elif mode == "react":
        result = solve_react(state)
    else:
        raise ValueError(f"Unknown mode: {mode}")
    
    state["result"] = result
    return state


def critic_node(state: GraphState) -> GraphState:
    """Critic node (unchanged from original)"""
    res = dict(state.get("result", {}))
    ans = str(res.get("answer", "")).strip()
    import re
    m = re.search(r"Answer\s*[:\-]\s*(.*)$", ans, flags=re.IGNORECASE)
    if m:
        ans = m.group(1).strip()
    from langgraph_utile import _extract_final
    inner = _extract_final(ans)
    if inner:
        ans = inner
    res["answer"] = ans
    state["result"] = res
    return state


def ace_learning_node(state: GraphState) -> GraphState:
    """
    ACE Learning Node: Applies the ACE pipeline to learn from execution.
    
    This is where the magic happens:
    1. Reflector analyzes the execution trace
    2. Curator creates delta updates
    3. Memory is updated with new insights
    """
    try:
        # Extract execution information
        messages = state.get("messages", [])
        result = state.get("result", {})
        mode = state.get("mode", "unknown")
        scratch = state.get("scratch", {})
        learner_id = scratch.get("learner_id")
        
        user_messages = [m.get("content", "") for m in messages if m.get("role") == "user"]
        question = scratch.get("ace_full_question") or " ".join(user_messages).strip()
        
        model_answer = result.get("answer", "")
        
        # Determine success (in real usage, compare with ground truth if available)
        # For now, we assume success if we got an answer
        success = bool(model_answer and model_answer != "(no final)")
        
        # Get ground truth from scratch if available (for supervised learning)
        ground_truth = scratch.get("ground_truth")
        
        # Create execution trace
        trace = ExecutionTrace(
            question=question,
            model_answer=model_answer,
            ground_truth=ground_truth,
            success=success,
            trace_messages=result.get("trace", messages),  # ReAct mode has trace
            metadata={
                "mode": mode,
                "scratch": scratch,
            }
        )
        
        # Get ACE pipeline
        _, pipeline = get_ace_system(learner_id)
        
        # Process execution through ACE pipeline
        # Only apply if we want online learning (can be controlled via config)
        apply_update = scratch.get("ace_online_learning", True)
        
        delta = pipeline.process_execution(trace, apply_update=apply_update)
        
        if delta:
            state.setdefault("scratch", {})["ace_delta"] = {
                "num_new_bullets": len(delta.new_bullets),
                "num_updates": len(delta.update_bullets),
                "num_removals": len(delta.remove_bullets),
            }
        
    except Exception as e:
        print(f"[ACE Learning] Error: {e}")
        import traceback
        traceback.print_exc()
    
    return state


def build_ace_graph() -> any:
    """Build LangGraph with ACE integration"""
    graph = StateGraph(GraphState)
    
    # Add nodes
    graph.add_node("router", router_node)
    graph.add_node("planner", planner_node)
    graph.add_node("solver", solver_node_with_ace)  # ACE-enhanced solver
    graph.add_node("critic", critic_node)
    graph.add_node("ace_learning", ace_learning_node)  # New ACE learning node
    
    # Add edges
    graph.add_edge(START, "router")
    graph.add_edge("router", "planner")
    graph.add_edge("planner", "solver")
    graph.add_edge("solver", "critic")
    graph.add_edge("critic", "ace_learning")  # Learn after getting result
    graph.add_edge("ace_learning", END)
    
    checkpointer = MemorySaver()
    app = graph.compile(checkpointer=checkpointer)
    return app


if __name__ == "__main__":
    import sys
    
    app = build_ace_graph()
    
    print("=" * 80)
    print("🚀 ACE-Enhanced LangGraph Agent")
    print("=" * 80)
    print()
    print("Features:")
    print("  ✓ Memory-enriched prompts (retrieves relevant strategies)")
    print("  ✓ Incremental delta updates (no context collapse)")
    print("  ✓ Grow-and-refine (prevents brevity bias)")
    print("  ✓ Online learning (learns from execution feedback)")
    print()
    print("=" * 80)
    
    # Get ACE memory stats
    memory, _ = get_ace_system()
    stats = memory.get_statistics()
    
    print(f"\n📊 Current Memory State:")
    print(f"   Total bullets: {stats['total_bullets']}")
    if stats['total_bullets'] > 0:
        print(f"   Average score: {stats['avg_score']:.2f}")
        print(f"   Categories: {stats.get('categories', {})}")
    print()
    
    # Test questions
    test_questions = [
        "What is 25 multiplied by 4?",
        "Calculate the sum of 100 + 200 + 300",
        "Find 2 to the power of 10",
    ]
    
    if len(sys.argv) > 1:
        # Use command line argument
        test_questions = [" ".join(sys.argv[1:])]
    
    for i, test_question in enumerate(test_questions, 1):
        print(f"\n{'=' * 80}")
        print(f"Question {i}: {test_question}")
        print('=' * 80)
        
        cfg = {"configurable": {"thread_id": f"ace-demo-{int(time.time()*1000)}"}}
        
        out = app.invoke({
            "messages": [{"role": "user", "content": test_question}],
            "mode": "",
            "scratch": {
                "ace_online_learning": True,  # Enable online learning
            },
            "result": {},
        }, config=cfg)
        
        print(f"\n✓ Answer: {out['result']['answer']}")
        print(f"✓ Mode: {out['mode']}")
        
        # Show ACE delta if available
        if "ace_delta" in out.get("scratch", {}):
            delta = out["scratch"]["ace_delta"]
            print(f"\n💡 ACE Learning:")
            print(f"   New bullets: {delta['num_new_bullets']}")
            print(f"   Updated: {delta['num_updates']}")
            print(f"   Removed: {delta['num_removals']}")
    
    print("\n" + "=" * 80)
    print("🎓 Learning Complete!")
    print("=" * 80)
    
    # Show updated memory stats
    stats = memory.get_statistics()
    print(f"\n📊 Updated Memory State:")
    print(f"   Total bullets: {stats['total_bullets']}")
    if stats['total_bullets'] > 0:
        print(f"   Average score: {stats['avg_score']:.2f}")
        print(f"   Average helpful: {stats.get('avg_helpful', 0):.1f}")
        print(f"   Average harmful: {stats.get('avg_harmful', 0):.1f}")
    
    print("\n💡 Next Steps:")
    print("   1. Run more queries to build up memory")
    print("   2. Examine ace_memory.json to see learned bullets")
    print("   3. Try: python analyze_ace_memory.py")
