from typing import Any, Dict, List, Literal, Optional, Tuple, TypedDict
import re
import json
import time

try:
    from openai import OpenAI
except Exception:
    OpenAI = None

class GraphState(TypedDict):
    messages: List[Dict[str, Any]]
    mode: Literal["cot", "tot", "react"]
    scratch: Dict[str, Any]
    result: Dict[str, Any]

class LLM:
    def __init__(self, model: str = "gpt-4o-mini", temperature: float = 0.2):
        if OpenAI is None:
            raise ImportError(
                "openai package not installed. `pip install openai` to use this."
            )
        self.client = OpenAI(api_key= "")
        self.model = model
        self.temperature = temperature

    def chat(
        self,
        messages: List[Dict[str, Any]],
        *,
        tools: Optional[List[Dict[str, Any]]] = None,
        tool_choice: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: int = 1000,
        retry: int = 3,
    ) -> Dict[str, Any]:
        last_err = None
        for _ in range(retry):
            try:
                resp = self.client.chat.completions.create(
                    model=self.model,
                    temperature=temperature if temperature is not None else self.temperature,
                    messages=messages,
                    tools=tools,
                    tool_choice=tool_choice,
                    max_tokens=max_tokens,
                )
                return resp.model_dump()
            except Exception as e:
                last_err = e
                time.sleep(0.5)
        raise RuntimeError(f"OpenAI call failed after retries: {last_err}")

COT_PROMPT = (
    "You are a careful reasoner. Solve the user's problem. "
    "Think step by step in a <scratchpad>...</scratchpad> block, then output only the final answer "
    "in <final>ANSWER</final> tags. If choices exist, return the letter only inside <final>."
)

TOT_EXPAND_TEMPLATE = (
    "You are exploring solution paths as short thoughts.\n"
    "Given the question and the current partial reasoning, propose up to {k} distinct next thoughts.\n"
    "Thoughts should be short (1-2 sentences), logically incremental, and avoid repetition.\n"
    "Return them as a JSON list under key 'thoughts'.\n"
)

TOT_VALUE_TEMPLATE = (
    "Rate how promising this partial reasoning is for solving the question from 1 (poor) to 10 (excellent).\n"
    "Respond with a single integer only."
)

REACT_SYSTEM = (
    "You are a ReAct-style agent. Alternate Thought → Action with tools.\n"
    "Use tools only when they help. After you believe you have the answer,\n"
    "output it in <final>ANSWER</final>. Keep Thoughts concise."
)

class Calculator:
    name = "calculator"
    description = "Evaluate a basic arithmetic expression. Supports + - * / ** ( ) and decimals."

    @staticmethod
    def json_schema() -> Dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": Calculator.name,
                "description": Calculator.description,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "expression": {
                            "type": "string",
                            "description": "Arithmetic expression to evaluate",
                        }
                    },
                    "required": ["expression"],
                },
            },
        }

    @staticmethod
    def run(expression: str) -> str:
        import ast
        import operator as op
        ops = {
            ast.Add: op.add,
            ast.Sub: op.sub,
            ast.Mult: op.mul,
            ast.Div: op.truediv,
            ast.Pow: op.pow,
            ast.USub: op.neg,
        }
        def eval_(node):
            if isinstance(node, ast.Num):
                return node.n
            if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
                return ops[ast.USub](eval_(node.operand))
            if isinstance(node, ast.BinOp) and type(node.op) in ops:
                return ops[type(node.op)](eval_(node.left), eval_(node.right))
            if isinstance(node, ast.Expression):
                return eval_(node.body)
            raise ValueError("Unsupported expression")
        tree = ast.parse(expression, mode="eval")
        val = eval_(tree)
        return str(val)

TOOLS = [Calculator]

def _extract_final(text: str) -> Optional[str]:
    m = re.search(r"<final>(.*?)</final>", text, flags=re.DOTALL | re.IGNORECASE)
    return m.group(1).strip() if m else None

def solve_cot(state: GraphState) -> Dict[str, Any]:
    params = state["scratch"]
    k = int(params.get("k", 1))
    temp = float(params.get("temperature", 0.2 if k == 1 else 0.7))
    llm = LLM(temperature=temp)
    base_msgs = [{"role": "system", "content": COT_PROMPT}] + state["messages"]
    if k == 1:
        resp = llm.chat(base_msgs)
        text = resp["choices"][0]["message"]["content"]
        return {"answer": _extract_final(text) or text, "raw": text}
    answers: List[str] = []
    raws: List[str] = []
    for _ in range(k):
        resp = llm.chat(base_msgs, temperature=temp)
        text = resp["choices"][0]["message"]["content"]
        raws.append(text)
        answers.append(_extract_final(text) or text.strip())
    from collections import Counter
    def norm(s: str) -> str:
        return re.sub(r"\s+", " ", s.strip().lower())
    tally = Counter(norm(a) for a in answers)
    best_norm, _ = tally.most_common(1)[0]
    chosen = next(a for a in answers if norm(a) == best_norm)
    return {"answer": chosen, "raw_samples": raws}

def solve_tot(state: GraphState) -> Dict[str, Any]:
    params = state["scratch"]
    breadth = int(params.get("breadth", 3))
    depth = int(params.get("depth", 2))
    temp = float(params.get("temperature", 0.2))
    llm = LLM(temperature=temp)
    user = next((m["content"] for m in state["messages"] if m["role"] == "user"), "")
    beam: List[Tuple[str, float]] = [("", 0.0)]
    for d in range(depth):
        candidates: List[Tuple[str, float]] = []
        for scratchpad, _ in beam:
            sys = (
                "You are exploring solution trees. Expand concise next-steps. "
                "Do not jump to the final answer yet."
            )
            expand_prompt = TOT_EXPAND_TEMPLATE.format(k=breadth)
            msgs = [
                {"role": "system", "content": sys},
                {"role": "user", "content": user},
                {
                    "role": "assistant",
                    "content": f"<partial>{scratchpad}</partial>\n{expand_prompt}",
                },
            ]
            exp = llm.chat(msgs, temperature=max(0.7, temp))
            text = exp["choices"][0]["message"]["content"] or ""
            next_thoughts: List[str] = []
            try:
                j = json.loads(text)
                if isinstance(j, dict) and isinstance(j.get("thoughts"), list):
                    next_thoughts = [str(t) for t in j["thoughts"]][:breadth]
            except Exception:
                pass
            if not next_thoughts:
                next_thoughts = [
                    ln.strip(" -•\t")
                    for ln in text.splitlines()
                    if ln.strip().startswith(("-", "1.", "2.", "3.", "•"))
                ][:breadth]
                if not next_thoughts:
                    next_thoughts = [text.strip().split("\n")[0]]
            for thought in next_thoughts:
                new_pad = (scratchpad + "\n" if scratchpad else "") + f"Thought: {thought}"
                val_msgs = [
                    {"role": "system", "content": "You are a strict evaluator."},
                    {"role": "user", "content": user},
                    {"role": "assistant", "content": f"<partial>{new_pad}</partial>\n{TOT_VALUE_TEMPLATE}"},
                ]
                val = llm.chat(val_msgs, temperature=0.0)
                score_text = val["choices"][0]["message"]["content"] or "5"
                try:
                    score = float(re.findall(r"-?\d+(?:\.\d+)?", score_text)[0])
                except Exception:
                    score = 5.0
                candidates.append((new_pad, score))
        candidates.sort(key=lambda x: x[1], reverse=True)
        beam = candidates[:breadth] if candidates else beam
    best_pad = beam[0][0]
    final_msgs = [
        {"role": "system", "content": COT_PROMPT},
        {"role": "user", "content": user},
        {"role": "assistant", "content": f"<scratchpad>{best_pad}</scratchpad>\nNow conclude."},
    ]
    fin = llm.chat(final_msgs, temperature=0.0)
    text = fin["choices"][0]["message"]["content"]
    return {"answer": _extract_final(text) or text, "scratchpad": best_pad}

def solve_react(state: GraphState) -> Dict[str, Any]:
    params = state["scratch"]
    max_turns = int(params.get("max_turns", 6))
    temp = float(params.get("temperature", 0.2))
    tool_schemas = [cls.json_schema() for cls in TOOLS]
    llm = LLM(temperature=temp)
    messages = [{"role": "system", "content": REACT_SYSTEM}] + state["messages"]
    for _ in range(max_turns):
        resp = llm.chat(messages, tools=tool_schemas, tool_choice="auto", max_tokens=800)
        choice = resp["choices"][0]["message"]
        content = choice.get("content") or ""
        tool_calls = choice.get("tool_calls") or []
        if content:
            messages.append({"role": "assistant", "content": content})
            final = _extract_final(content)
            if final:
                return {"answer": final, "trace": messages}
        for tc in tool_calls:
            name = tc["function"]["name"]
            args = tc["function"].get("arguments")
            try:
                parsed = json.loads(args) if isinstance(args, str) else (args or {})
            except Exception:
                parsed = {}
            if name == Calculator.name:
                try:
                    out = Calculator.run(parsed.get("expression", ""))
                except Exception as e:
                    out = f"Calculator error: {e}"
            else:
                out = f"Unknown tool: {name}"
            messages.append(
                {
                    "role": "tool",
                    "content": out,
                    "tool_call_id": tc.get("id", ""),
                }
            )
    return {"answer": content.strip() if content else "(no final)", "trace": messages}
