from typing import Any, Dict, List, Literal, Optional, Tuple, TypedDict
import re
import json
import time
import os
import asyncio, sys
from datetime import datetime
from pathlib import Path
from collections import Counter

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import requests
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp.client.streamable_http import streamablehttp_client
from mcp.client.session import ClientSession  # newer import path
from langchain_community.tools.tavily_search.tool import TavilySearchResults
from langchain_community.graphs import Neo4jGraph
from langchain_community.chains.graph_qa.cypher import GraphCypherQAChain
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

# Add project root to path to import prompts
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from prompts.neo4j_prompts import CYPHER_PROMPT, QA_PROMPT
from prompts.reasoning_prompts import COT_PROMPT, TOT_EXPAND_TEMPLATE, TOT_VALUE_TEMPLATE, REACT_SYSTEM

from dotenv import load_dotenv
load_dotenv()

# ===================== Memory System =====================

class ConversationMemory:
    """
    Simple persistent memory system to track conversation history.
    Stores conversations in JSON format and provides analysis capabilities.
    """
    
    def __init__(self, memory_file: str = "conversation_memory.json"):
        self.memory_file = Path(memory_file)
        self.conversations: List[Dict[str, Any]] = []
        self._load_memory()
    
    def _load_memory(self):
        """Load existing memory from file"""
        if self.memory_file.exists():
            try:
                with open(self.memory_file, 'r', encoding='utf-8') as f:
                    self.conversations = json.load(f)
            except Exception as e:
                print(f"Warning: Could not load memory file: {e}")
                self.conversations = []
        else:
            self.conversations = []
    
    def _save_memory(self):
        """Save memory to file"""
        try:
            with open(self.memory_file, 'w', encoding='utf-8') as f:
                json.dump(self.conversations, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Warning: Could not save memory file: {e}")
    
    def add_conversation(
        self,
        question: str,
        answer: str,
        mode: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Add a new conversation to memory"""
        conversation = {
            "timestamp": datetime.now().isoformat(),
            "question": question,
            "answer": answer,
            "mode": mode,
            "metadata": metadata or {}
        }
        self.conversations.append(conversation)
        self._save_memory()
    
    def get_all_conversations(self) -> List[Dict[str, Any]]:
        """Get all stored conversations"""
        return self.conversations
    
    def get_recent_conversations(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most recent conversations"""
        return self.conversations[-limit:]
    
    def analyze_frequent_questions(self, top_n: int = 10) -> List[Tuple[str, int]]:
        """
        Analyze and return most frequently asked questions.
        Returns list of (question, count) tuples.
        """
        question_counter = Counter()
        
        for conv in self.conversations:
            question = conv.get("question", "").strip().lower()
            # Normalize question by removing extra whitespace
            question = re.sub(r'\s+', ' ', question)
            if question:
                question_counter[question] += 1
        
        return question_counter.most_common(top_n)
    
    def analyze_question_patterns(self) -> Dict[str, Any]:
        """
        Analyze patterns in questions asked.
        Returns statistics about question types, modes used, etc.
        """
        if not self.conversations:
            return {
                "total_conversations": 0,
                "mode_distribution": {},
                "frequent_keywords": [],
                "date_range": None
            }
        
        # Mode distribution
        mode_counter = Counter()
        all_keywords = []
        
        for conv in self.conversations:
            mode = conv.get("mode", "unknown")
            mode_counter[mode] += 1
            
            # Extract keywords from questions
            question = conv.get("question", "").lower()
            # Common question words to extract
            keywords = re.findall(r'\b(?:calculate|search|find|explain|what|how|why|when|where|who|chapter|unit|textbook|database|graph)\b', question)
            all_keywords.extend(keywords)
        
        keyword_counter = Counter(all_keywords)
        
        # Date range
        timestamps = [conv.get("timestamp") for conv in self.conversations if conv.get("timestamp")]
        date_range = None
        if timestamps:
            date_range = {
                "earliest": min(timestamps),
                "latest": max(timestamps)
            }
        
        return {
            "total_conversations": len(self.conversations),
            "mode_distribution": dict(mode_counter),
            "frequent_keywords": keyword_counter.most_common(10),
            "date_range": date_range
        }
    
    def search_conversations(self, keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search conversations by keyword in question or answer.
        Returns matching conversations.
        """
        keyword_lower = keyword.lower()
        matching = []
        
        for conv in self.conversations:
            question = conv.get("question", "").lower()
            answer = conv.get("answer", "").lower()
            
            if keyword_lower in question or keyword_lower in answer:
                matching.append(conv)
                if len(matching) >= limit:
                    break
        
        return matching
    
    def clear_memory(self):
        """Clear all stored conversations (use with caution!)"""
        self.conversations = []
        self._save_memory()
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive statistics about stored conversations"""
        stats = self.analyze_question_patterns()
        stats["frequent_questions"] = self.analyze_frequent_questions(top_n=5)
        return stats


# Global memory instance
_CONVERSATION_MEMORY = None

def get_conversation_memory(memory_file: str = "conversation_memory.json") -> ConversationMemory:
    """Get or create the global conversation memory instance"""
    global _CONVERSATION_MEMORY
    if _CONVERSATION_MEMORY is None:
        _CONVERSATION_MEMORY = ConversationMemory(memory_file)
    return _CONVERSATION_MEMORY


class GraphState(TypedDict):
    messages: List[Dict[str, Any]]
    mode: Literal["cot", "tot", "react"]
    scratch: Dict[str, Any]
    result: Dict[str, Any]

class LLM:
    def __init__(self, model: str = "gemini-2.5-flash", temperature: float = 0.2):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise RuntimeError("GEMINI_API_KEY not configured for Gemini access.")
        self.model = model
        self.temperature = temperature
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    @staticmethod
    def _text_parts(content: str) -> List[Dict[str, Any]]:
        return [{"text": str(content)}]

    @staticmethod
    def _tool_response_part(name: str, raw_content: Any) -> Dict[str, Any]:
        if isinstance(raw_content, str):
            try:
                parsed = json.loads(raw_content)
            except json.JSONDecodeError:
                parsed = {"output": raw_content}
        elif isinstance(raw_content, dict):
            parsed = raw_content
        else:
            parsed = {"output": raw_content}
        return {"functionResponse": {"name": name or "tool", "response": parsed}}

    @staticmethod
    def _convert_tools(tools: Optional[List[Dict[str, Any]]]) -> Optional[List[Dict[str, Any]]]:
        if not tools:
            return None
        declarations: List[Dict[str, Any]] = []
        for tool in tools:
            fn = tool.get("function") or {}
            name = fn.get("name")
            if not name:
                continue
            declarations.append(
                {
                    "name": name,
                    "description": fn.get("description", ""),
                    "parameters": fn.get("parameters", {"type": "object", "properties": {}}),
                }
            )
        if not declarations:
            return None
        return [{"function_declarations": declarations}]

    def _convert_messages(self, messages: List[Dict[str, Any]]) -> Tuple[Optional[Dict[str, Any]], List[Dict[str, Any]]]:
        system_instruction = None
        contents: List[Dict[str, Any]] = []

        for msg in messages:
            role = msg.get("role", "")
            content = msg.get("content", "")

            if role == "system":
                # Use the first system message as the Gemini system instruction
                if content and system_instruction is None:
                    system_instruction = {"parts": [{"text": str(content)}]}
                    continue
                # Any additional system prompts get treated as user context
                role = "user"

            if role == "assistant":
                contents.append({"role": "model", "parts": self._text_parts(content)})
            elif role == "tool":
                name = msg.get("name") or msg.get("tool_name") or msg.get("tool_call_id") or "tool"
                part = self._tool_response_part(name, content)
                contents.append({"role": "user", "parts": [part]})
            else:
                contents.append({"role": "user", "parts": self._text_parts(content)})

        return system_instruction, contents

    def chat(
        self,
        messages: List[Dict[str, Any]],
        *,
        tools: Optional[List[Dict[str, Any]]] = None,
        tool_choice: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: int = 1000,
        retry: int = 3,
        response_mime_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        last_err: Optional[Exception] = None
        for _ in range(retry):
            try:
                system_instruction, contents = self._convert_messages(messages)
                body: Dict[str, Any] = {
                    "contents": contents,
                    "generationConfig": {
                        "temperature": temperature if temperature is not None else self.temperature,
                        "maxOutputTokens": max_tokens,
                    },
                }

                if response_mime_type:
                    body.setdefault("generationConfig", {})["responseMimeType"] = response_mime_type

                tools_spec = self._convert_tools(tools)
                if tools_spec:
                    body["tools"] = tools_spec
                    if tool_choice == "auto":
                        body["toolConfig"] = {
                            "functionCallingConfig": {
                                "mode": "AUTO"
                            }
                        }

                if system_instruction:
                    body["systemInstruction"] = system_instruction

                resp = requests.post(
                    self.endpoint,
                    params={"key": self.api_key},
                    json=body,
                    timeout=60,
                )
                if resp.status_code != 200:
                    raise RuntimeError(f"Gemini API error: {resp.status_code} {resp.text}")

                data = resp.json()
                if "error" in data:
                    raise RuntimeError(f"Gemini API error: {data['error']}")

                candidates = data.get("candidates") or []
                if not candidates:
                    raise RuntimeError("Gemini API returned no candidates.")

                candidate = candidates[0]
                finish_reason = candidate.get("finishReason")
                if finish_reason and finish_reason not in {"STOP", "MAX_TOKENS"}:
                    raise RuntimeError(f"Generation halted by Gemini (reason={finish_reason}).")

                content_obj = candidate.get("content") or {}
                parts = content_obj.get("parts") or []
                text_chunks: List[str] = []
                tool_calls: List[Dict[str, Any]] = []

                for part in parts:
                    if "text" in part:
                        text_chunks.append(part["text"])
                    if "functionCall" in part:
                        fc = part["functionCall"] or {}
                        name = fc.get("name") or "tool"
                        args = fc.get("args") or {}
                        tool_calls.append(
                            {
                                "id": name,
                                "type": "function",
                                "function": {
                                    "name": name,
                                    "arguments": json.dumps(args),
                                },
                            }
                        )

                message: Dict[str, Any] = {"content": "\n".join(text_chunks).strip()}
                if tool_calls:
                    message["tool_calls"] = tool_calls

                return {"choices": [{"message": message}]}

            except Exception as exc:
                last_err = exc
                time.sleep(0.5)

        raise RuntimeError(f"Gemini call failed after retries: {last_err}")

# Prompts are now imported from prompts/reasoning_prompts.py

######tools
def _calculator_run(args: Dict[str, Any]) -> str:
    """
    Simple calculator tool that evaluates mathematical expressions.
    Supports basic arithmetic operations: +, -, *, /, **, %, and parentheses.
    """
    expression = args.get("expression", "").strip()
    if not expression:
        return "Calculator error: missing 'expression'."
    
    try:
        # Sanitize the expression - only allow numbers, operators, and parentheses
        allowed_chars = set("0123456789+-*/()%.** ")
        if not all(c in allowed_chars for c in expression):
            return f"Calculator error: Invalid characters in expression. Only numbers and operators (+, -, *, /, **, %, parentheses) are allowed."
        
        # Evaluate the expression safely
        result = eval(expression, {"__builtins__": {}}, {})
        return json.dumps({"expression": expression, "result": result})
    except ZeroDivisionError:
        return "Calculator error: Division by zero."
    except Exception as e:
        return f"Calculator error: {str(e)}"

def _calculator_schema() -> dict:
    return {
        "type": "function",
        "function": {
            "name": "calculator",
            "description": "Performs mathematical calculations. Supports basic arithmetic operations: addition (+), subtraction (-), multiplication (*), division (/), exponentiation (**), modulo (%), and parentheses for grouping.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "The mathematical expression to evaluate (e.g., '2 + 2', '10 * (5 + 3)', '2 ** 3')"
                    },
                },
                "required": ["expression"],
            },
        },
    }

def _deep_research_run(args: Dict[str, Any]) -> str:
    if TavilySearchResults is None:
        return "DeepResearch error: langchain_community or tavily-python not installed."
    query = args.get("query") or ""
    if not query:
        return "DeepResearch error: missing 'query'."
    tool = TavilySearchResults(
        max_results=int(args.get("max_results", 5)),
        include_answer=bool(args.get("include_answer", True)),
        include_raw_content=bool(args.get("include_raw_content", False)),
        search_depth=str(args.get("search_depth", "advanced")),
        tavily_api_key=os.getenv("TAVILY_API_KEY"), 
    )
    out = tool.invoke({"query": query})
    try:
        return json.dumps(out)
    except Exception:
        return str(out)

def _deep_research_schema() -> dict:
    return {
        "type": "function",
        "function": {
            "name": "deep_research",
            "description": "Web deep-research via Tavily; returns aggregated JSON with sources and (optional) short answer.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query to investigate deeply."},
                    "max_results": {"type": "integer", "default": 5},
                    "search_depth": {"type": "string", "enum": ["basic", "advanced"], "default": "advanced"},
                    "include_answer": {"type": "boolean", "default": True},
                    "include_raw_content": {"type": "boolean", "default": False},
                },
                "required": ["query"],
            },
        },
    }

# ---- Neo4j Retrieve+QA tool ----
_NEO4J_CHAIN = None  # lazy singleton

def _neo4j_retrieveqa_schema() -> dict:
    return {
        "type": "function",
        "function": {
            "name": "neo4j_retrieveqa",
            "description": "Query Neo4j with natural language. Step 1: generate Cypher and retrieve context. Step 2: answer from that context.",
            "parameters": {
                "type": "object",
                "properties": {
                    "question": {"type": "string", "description": "User's natural-language question about the Neo4j graph."},
                    "top_k": {"type": "integer", "default": 10, "description": "Limit for returned rows to keep answers concise."},
                    "include_context": {"type": "boolean", "default": True, "description": "Whether to include retrieved rows in the output."},
                },
                "required": ["question"],
            },
        },
    }

def _extract_cypher_query(text: str) -> str:
    """
    Extract and clean a Cypher query from LLM output.
    Handles cases where the LLM adds extra text or formatting.
    """
    if not text:
        return ""
    
    text = text.strip()
    
    # Remove markdown code blocks if present
    if text.startswith("```") and text.endswith("```"):
        lines = text.split("\n")
        # Remove first and last lines (the ``` markers)
        text = "\n".join(lines[1:-1]).strip()
        # Remove language identifier if present (e.g., ```cypher)
        if text.startswith("cypher") or text.startswith("Cypher"):
            text = text[6:].strip()
    
    # Remove "Cypher:" prefix if present
    if text.lower().startswith("cypher:"):
        text = text[7:].strip()
    
    # Check if the query starts with a valid Cypher keyword
    valid_starts = ["MATCH", "RETURN", "CREATE", "MERGE", "WITH", "UNWIND", "CALL", "OPTIONAL"]
    first_word = text.split()[0].upper() if text.split() else ""
    
    if first_word not in valid_starts:
        # Try to find a line that starts with a valid keyword
        for line in text.split("\n"):
            line = line.strip()
            if line and line.split()[0].upper() in valid_starts:
                # Found the start of the query
                idx = text.index(line)
                text = text[idx:]
                break
    
    return text.strip()

def _build_neo4j_chain(top_k: int = 10):
    """
    Build Neo4j GraphCypherQAChain with two-step pipeline:
    Step 1: Generate Cypher query using CYPHER_PROMPT
    Step 2: Answer question using QA_PROMPT based on retrieved context
    """
    global _NEO4J_CHAIN
    if _NEO4J_CHAIN is not None:
        return _NEO4J_CHAIN

    # Support both NEXT_PUBLIC_ (for Next.js) and regular env vars (for Python backend)
    # Try regular vars first, then fall back to NEXT_PUBLIC_ vars
    uri = (os.getenv("NEO4J_URI") or 
           os.getenv("NEXT_PUBLIC_NEO4J_URI") or 
           "bolt://localhost:7687")
    user = (os.getenv("NEO4J_USERNAME") or 
            os.getenv("NEXT_PUBLIC_NEO4J_USERNAME") or 
            "neo4j")
    pwd = (os.getenv("NEO4J_PASSWORD") or 
           os.getenv("NEXT_PUBLIC_NEO4J_PASSWORD") or 
           "password")
    # NEO4J_DATABASE: Optional database name for Neo4j 4.0+. None = default database
    db = os.getenv("NEO4J_DATABASE", None)

    graph = Neo4jGraph(url=uri, username=user, password=pwd, database=db)

    # Create PromptTemplate objects from the prompt strings
    # CYPHER_PROMPT expects {schema} and {question} variables
    cypher_prompt_template = PromptTemplate(
        input_variables=["schema", "question"],
        template=CYPHER_PROMPT
    )
    
    # QA_PROMPT expects {context} and {question} variables
    qa_prompt_template = PromptTemplate(
        input_variables=["context", "question"],
        template=QA_PROMPT
    )

    gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY not configured for Neo4j tool usage.")

    # Use Gemini for both Cypher generation and QA, mirroring the primary agent
    cypher_llm = ChatGoogleGenerativeAI(
        model=gemini_model,
        google_api_key=gemini_api_key,
        temperature=0.0,
    )

    qa_llm = ChatGoogleGenerativeAI(
        model=gemini_model,
        google_api_key=gemini_api_key,
        temperature=0.2,
    )

    # Build the two-step pipeline chain
    _NEO4J_CHAIN = GraphCypherQAChain.from_llm(
        llm=cypher_llm,
        qa_llm=qa_llm,
        graph=graph,
        cypher_prompt=cypher_prompt_template,
        qa_prompt=qa_prompt_template,
        return_intermediate_steps=True,
        top_k=top_k,
        verbose=True,  # Enable verbose to debug Cypher generation
        allow_dangerous_requests=True,  # Acknowledge that LLM can generate Cypher queries
        validate_cypher=True,  # Validate Cypher syntax before execution
    )
    return _NEO4J_CHAIN

def _neo4j_retrieveqa_run(args: Dict[str, Any]) -> str:
    """
    Run Neo4j retrieve-and-QA with two-step pipeline:
    1. Generate Cypher query from natural language question
    2. Execute query and answer based on retrieved context
    
    Returns JSON with answer, generated_cypher, and optionally context.
    """
    question = (args or {}).get("question", "").strip()
    if not question:
        return "Neo4jRetrieveQA error: missing 'question'."
    top_k = int((args or {}).get("top_k", 10))
    include_context = bool((args or {}).get("include_context", True))

    try:
        # Build and invoke the two-step chain
        chain = _build_neo4j_chain(top_k=top_k)
        res = chain.invoke({"query": question})
        
        # Extract results
        answer = res.get("result", "")
        interm = res.get("intermediate_steps", []) or []
        
        # GraphCypherQAChain intermediate_steps is a list containing:
        # - dict with "query": the generated Cypher statement
        # - "context": the raw data retrieved from Neo4j
        # The structure can vary, so we handle both dict and list formats
        cypher = ""
        context = []
        
        if isinstance(interm, list) and len(interm) > 0:
            # intermediate_steps is typically a list of dicts or a dict
            if isinstance(interm[0], dict):
                cypher = interm[0].get("query", "")
                context = interm[0].get("context", [])
            else:
                # Sometimes it's a flat list: [query_string, context_list]
                cypher = str(interm[0]) if len(interm) > 0 else ""
                context = interm[1] if len(interm) > 1 else []
        elif isinstance(interm, dict):
            cypher = interm.get("query", "")
            context = interm.get("context", [])

        payload = {
            "answer": answer,
            "generated_cypher": cypher,
            "top_k": top_k,
        }
        if include_context:
            payload["context"] = context
        
        try:
            return json.dumps(payload)
        except Exception:
            return str(payload)
            
    except Exception as e:
        error_msg = f"Neo4jRetrieveQA error: {str(e)}"
        # Try to extract the generated Cypher from intermediate steps if available
        try:
            interm = res.get("intermediate_steps", []) if 'res' in locals() else []
            if interm:
                if isinstance(interm, list) and len(interm) > 0:
                    if isinstance(interm[0], dict):
                        bad_cypher = interm[0].get("query", "")
                    else:
                        bad_cypher = str(interm[0])
                    error_msg += f" | Generated Cypher: {bad_cypher}"
        except Exception:
            pass
        return json.dumps({"error": error_msg, "question": question})

############
def _extract_final(text: str) -> Optional[str]:
    m = re.search(r"<final>(.*?)</final>", text, flags=re.DOTALL | re.IGNORECASE)
    return m.group(1).strip() if m else None


def _finalize_answer(text: str) -> str:
    final = _extract_final(text)
    if final:
        return final.strip()
    cleaned = re.sub(r"<scratchpad>.*?</scratchpad>", "", text, flags=re.DOTALL)
    stripped = cleaned.strip()
    if not stripped:
        return ""
    lines = [ln.strip() for ln in stripped.splitlines() if ln.strip()]
    return lines[-1] if lines else stripped

def solve_cot(state: GraphState) -> Dict[str, Any]:
    params = state["scratch"]
    k = int(params.get("k", 1))
    temp = float(params.get("temperature", 0.2 if k == 1 else 0.7))
    llm = LLM(temperature=temp)
    base_msgs = [{"role": "system", "content": COT_PROMPT}] + state["messages"]
    if k == 1:
        resp = llm.chat(base_msgs)
        text = resp["choices"][0]["message"]["content"]
        for thought in re.findall(r"<scratchpad>(.*?)</scratchpad>", text, flags=re.DOTALL):
            print("[ACE Thought][CoT]", thought.strip(), flush=True)
        cleaned = re.sub(r"<scratchpad>.*?</scratchpad>", "", text, flags=re.DOTALL)
        return {"answer": _finalize_answer(cleaned), "raw": text}
    answers: List[str] = []
    raws: List[str] = []
    for _ in range(k):
        resp = llm.chat(base_msgs, temperature=temp)
        text = resp["choices"][0]["message"]["content"]
        for thought in re.findall(r"<scratchpad>(.*?)</scratchpad>", text, flags=re.DOTALL):
            print("[ACE Thought][CoT]", thought.strip(), flush=True)
        cleaned = re.sub(r"<scratchpad>.*?</scratchpad>", "", text, flags=re.DOTALL)
        raws.append(text)
        answers.append(_finalize_answer(cleaned))
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
                print("[ACE Thought][ToT Expand]", new_pad.strip(), flush=True)
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
                print(f"[ACE Thought][ToT Score] {score_text.strip()} -> {score}", flush=True)
                candidates.append((new_pad, score))
        candidates.sort(key=lambda x: x[1], reverse=True)
        beam = candidates[:breadth] if candidates else beam
    best_pad = beam[0][0]
    print("[ACE Thought][ToT Selected]", best_pad.strip(), flush=True)
    final_msgs = [
        {"role": "system", "content": COT_PROMPT},
        {"role": "user", "content": user},
        {"role": "assistant", "content": f"<scratchpad>{best_pad}</scratchpad>\nNow conclude."},
    ]
    fin = llm.chat(final_msgs, temperature=0.0)
    text = fin["choices"][0]["message"]["content"]
    for thought in re.findall(r"<scratchpad>(.*?)</scratchpad>", text, flags=re.DOTALL):
        print("[ACE Thought][ToT Final]", thought.strip(), flush=True)
    text = re.sub(r"<scratchpad>.*?</scratchpad>", "", text, flags=re.DOTALL)
    return {"answer": _finalize_answer(text), "scratchpad": best_pad}


def solve_react(state: GraphState) -> Dict[str, Any]:
    params = state["scratch"]
    max_turns = int(params.get("max_turns", 8))  # Increased from 6 to 8
    temp = float(params.get("temperature", 0.2))
    # Build tool schemas dynamically: calculator + deep-research + neo4j
    tool_schemas = [_calculator_schema(), _deep_research_schema(), _neo4j_retrieveqa_schema()]
    llm = LLM(temperature=temp)
    messages = [{"role": "system", "content": REACT_SYSTEM}] + state["messages"]

    for turn in range(max_turns):
        # Increase max_tokens for later turns to allow for comprehensive answers
        max_tokens = 1200 if turn > 0 else 800
        resp = llm.chat(messages, tools=tool_schemas, tool_choice="auto", max_tokens=max_tokens)
        choice = resp["choices"][0]["message"]
        content = choice.get("content") or ""
        tool_calls = choice.get("tool_calls") or []

        if content:
            print(f"[ACE Thought][ReAct turn {turn+1}] {content.strip()}", flush=True)

        # Check for final answer before appending message
        if content:
            final = _extract_final(content)
            if final:
                messages.append({"role": "assistant", "content": content})
                return {"answer": final, "trace": messages}

        # Always append the assistant message (with or without tool_calls)
        # This mirrors function-calling APIs that expect the assistant turn prior to tool output
        assistant_msg = {"role": "assistant", "content": content}
        if tool_calls:
            assistant_msg["tool_calls"] = tool_calls
        messages.append(assistant_msg)

        # Process tool calls if any
        if tool_calls:
            for tc in tool_calls:
                name = tc["function"]["name"]
                args = tc["function"].get("arguments")
                try:
                    parsed = json.loads(args) if isinstance(args, str) else (args or {})
                except Exception:
                    parsed = {}

                ##### Route to appropriate tool
                if name == "calculator":
                    out = _calculator_run(parsed)
                elif name == "deep_research":
                    out = _deep_research_run(parsed)
                elif name == "neo4j_retrieveqa":
                    out = _neo4j_retrieveqa_run(parsed)
                else:
                    out = f"Unknown tool: {name}"

                messages.append(
                    {
                        "role": "tool",
                        "name": name,
                        "content": out if isinstance(out, str) else json.dumps(out),
                        "tool_call_id": tc.get("id", ""),
                    }
                )
                log_payload = out if isinstance(out, str) else json.dumps(out)
                print(f"[ACE Thought][Tool {name}] {log_payload}", flush=True)
            
            # After tool results, if approaching max turns, prompt for final answer
            if turn >= max_turns - 2:
                messages.append({
                    "role": "user",
                    "content": "Based on the tool results above, please provide your final answer wrapped in <final></final> tags."
                })

    # If we exhausted all turns, try to extract an answer from the last content
    return {"answer": _finalize_answer(content) if content else "(no final)", "trace": messages}



if __name__ == "__main__":
    tool = TavilySearchResults(max_results=3)
    print(tool.invoke({"query": "current prime minister of Canada"}))
