from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph_utile import *

def router_node(state: GraphState) -> GraphState:
    if state.get("mode"):
        return state
    user_text = " ".join([m.get("content", "") for m in state.get("messages", []) if m.get("role") == "user"]).lower()
    if any(w in user_text for w in ["calculate", "sum", "difference", "product", "ratio", "percent", "%", "number"]):
        state["mode"] = "react"
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
        scratch.setdefault("max_turns", 6)
        from langgraph_utile import TOOLS
        scratch["tool_names"] = [tool.name for tool in TOOLS]
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

def build_graph() -> any:
    graph = StateGraph(GraphState)
    graph.add_node("router", router_node)
    graph.add_node("planner", planner_node)
    graph.add_node("solver", solver_node)
    graph.add_node("critic", critic_node)
    graph.add_edge(START, "router")
    graph.add_edge("router", "planner")
    graph.add_edge("planner", "solver")
    graph.add_edge("solver", "critic")
    graph.add_edge("critic", END)
    checkpointer = MemorySaver()
    app = graph.compile(checkpointer=checkpointer)
    return app

if __name__ == "__main__":
    app = build_graph()
    demo_question = (
        "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball.\n"
        "How much does the ball cost?"
    )
    for mode in ("cot", "tot", "react"):
        print("=== MODE:", mode, "===")
        cfg = {"configurable": {"thread_id": f"demo-{mode}-{int(time.time()*1000)}"}}
        out = app.invoke({
            "messages": [{"role": "user", "content": demo_question}],
            "mode": mode,
            "scratch": {},
            "result": {},
        }, config=cfg)
        print("Answer:", out["result"]["answer"])
