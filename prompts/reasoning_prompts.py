"""
LangGraph Reasoning System Prompts

This module contains prompts used by the LangGraph agent for different
reasoning strategies: Chain of Thought (COT), Tree of Thought (TOT), and ReAct.
"""

COT_PROMPT = (
    "You are a careful reasoner. Solve the user's problem. "
    "Think step by step in a <scratchpad>...</scratchpad> block, then output only the final answer "
    "wrap it in <final></final> tags like: <final>your actual answer</final>.\n"
    "Keep Thoughts concise.")

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
    "Use tools when they help answer the question. After receiving tool results,\n"
    "analyze them and provide your final answer wrapped in <final></final> tags.\n"
    "Format: <final>your actual answer here</final>\n"
    "Be concise and direct. Extract key information from tool results to answer the user's question.")
