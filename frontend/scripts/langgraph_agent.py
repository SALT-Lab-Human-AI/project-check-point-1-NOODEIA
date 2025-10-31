from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph_utile import *
from langgraph_utile import _deep_research_schema, _calculator_schema, _neo4j_retrieveqa_schema, get_conversation_memory

def router_node(state: GraphState) -> GraphState:
    if state.get("mode"):
        return state
    user_text = " ".join([m.get("content", "") for m in state.get("messages", []) if m.get("role") == "user"]).lower()
    
    # Check for Neo4j/database queries
    if any(w in user_text for w in ["chapter", "unit", "textbook", "quiz", "user", "session", "group", "message", "database", "graph"]):
        state["mode"] = "react"
    # Check for calculator needs
    elif any(w in user_text for w in ["calculate", "sum", "difference", "product", "ratio", "percent", "%", "number"]):
        state["mode"] = "react"
    # Check for web search needs
    elif any(w in user_text for w in ["search", "web", "internet", "current", "latest", "trending", "news"]):
        state["mode"] = "react"
    # Check for tree-of-thought needs
    elif any(w in user_text for w in ["plan", "options", "steps", "strategy", "search space"]):
        state["mode"] = "tot"
    else:
        state["mode"] = "cot"
    return state

def planner_node(state: GraphState) -> GraphState:
    mode = state["mode"]
    scratch = dict(state.get("scratch", {}))
    if mode == "tot":
        scratch.setdefault("breadth", 3)
        scratch.setdefault("depth", 2)
        scratch.setdefault("temperature", 0.2)
    elif mode == "react":
        scratch.setdefault("max_turns", 8)  # Increased from 6 to 8
        ######
        tool_schemas = [_calculator_schema(), _deep_research_schema(), _neo4j_retrieveqa_schema()]
        scratch["tool_names"] = [t["function"]["name"] for t in tool_schemas]
        scratch.setdefault("temperature", 0.2)
    elif mode == "cot":
        scratch.setdefault("k", 1)
        scratch.setdefault("temperature", 0.2 if scratch["k"] == 1 else 0.7)
    state["scratch"] = scratch
    return state

def solver_node(state: GraphState) -> GraphState:
    mode = state["mode"]
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

def memory_saver_node(state: GraphState) -> GraphState:
    """Save the conversation to persistent memory for analysis"""
    try:
        # Extract the user question
        messages = state.get("messages", [])
        user_messages = [m.get("content", "") for m in messages if m.get("role") == "user"]
        question = " ".join(user_messages).strip()
        
        # Extract the answer
        answer = state.get("result", {}).get("answer", "")
        
        # Get mode
        mode = state.get("mode", "unknown")
        
        # Collect metadata
        metadata = {
            "scratch": state.get("scratch", {}),
            "message_count": len(state.get("messages", [])),
        }
        
        # Add trace information if available (for react mode)
        if "trace" in state.get("result", {}):
            metadata["trace_length"] = len(state.get("result", {}).get("trace", []))
        
        # Save to memory
        if question and answer:
            memory = get_conversation_memory()
            memory.add_conversation(
                question=question,
                answer=answer,
                mode=mode,
                metadata=metadata
            )
    except Exception as e:
        print(f"Warning: Failed to save conversation to memory: {e}")
    
    return state

def build_graph() -> any:
    graph = StateGraph(GraphState)
    graph.add_node("router", router_node)
    graph.add_node("planner", planner_node)
    graph.add_node("solver", solver_node)
    graph.add_node("critic", critic_node)
    graph.add_node("memory_saver", memory_saver_node)
    graph.add_edge(START, "router")
    graph.add_edge("router", "planner")
    graph.add_edge("planner", "solver")
    graph.add_edge("solver", "critic")
    graph.add_edge("critic", "memory_saver")
    graph.add_edge("memory_saver", END)
    checkpointer = MemorySaver()
    app = graph.compile(checkpointer=checkpointer)
    return app

if __name__ == "__main__":
    app = build_graph()
    
    print("=== LangGraph Agent with Memory System ===\n")
    
    # Test a simple question
    test_question = "What is 25 multiplied by 4?"
    
    print(f"Question: {test_question}")
    cfg = {"configurable": {"thread_id": f"demo-{int(time.time()*1000)}"}}
    out = app.invoke({
        "messages": [{"role": "user", "content": test_question}],
        "mode": "",  # Let router decide
        "scratch": {},
        "result": {},
    }, config=cfg)
    print(f"Answer: {out['result']['answer']}")
    print(f"Mode used: {out['mode']}")
    
    print("\n" + "="*80)
    print("💾 Conversation saved to memory!")
    print("="*80)
    
    # Show memory statistics
    memory = get_conversation_memory()
    stats = memory.get_statistics()
    
    print(f"\n📊 Memory Statistics:")
    print(f"   Total conversations: {stats['total_conversations']}")
    if stats['mode_distribution']:
        print(f"   Mode distribution: {stats['mode_distribution']}")
    
    print("\n💡 To analyze memory, run:")
    print("   python analyze_memory.py")
    print("\n💡 To test memory system thoroughly, run:")
    print("   python test_memory_system.py")
