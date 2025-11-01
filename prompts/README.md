# Prompts Directory

This directory contains all system prompts used throughout the Noodeia project, organized by their specific use cases.

## File Organization

### `ace_memory_prompts.py`
Contains prompts used by the ACE (Agentic Context Engineering) memory system:

- **REFLECTOR_PROMPT**: Used by the Reflector component to analyze execution traces and extract concrete, actionable lessons
- **CURATOR_PROMPT**: Used by the Curator component to synthesize lessons into structured bullet updates

**Usage**: These prompts are used in the memory learning pipeline to improve the AI agent's performance over time.

### `reasoning_prompts.py`
Contains prompts for different reasoning strategies used by the LangGraph agent:

- **COT_PROMPT**: Chain of Thought reasoning - step-by-step problem solving
- **TOT_EXPAND_TEMPLATE**: Tree of Thought expansion - exploring multiple solution paths
- **TOT_VALUE_TEMPLATE**: Tree of Thought evaluation - rating the quality of reasoning paths
- **REACT_SYSTEM**: ReAct (Reasoning + Acting) system - alternating between thinking and tool usage

**Usage**: These prompts guide the AI agent's reasoning process and are selected automatically based on the query complexity.

### `neo4j_prompts.py`
Contains prompts for Neo4j graph database interactions:

- **CYPHER_PROMPT**: Generates valid Cypher queries from natural language questions
- **QA_PROMPT**: Answers questions based on retrieved Neo4j context

**Usage**: These prompts enable the AI agent to query the Neo4j database and provide answers based on structured data.

## Import Instructions

To use these prompts in your code:

```python
# Add project root to Python path
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Import specific prompts
from prompts.ace_memory_prompts import REFLECTOR_PROMPT, CURATOR_PROMPT
from prompts.reasoning_prompts import COT_PROMPT, TOT_EXPAND_TEMPLATE, TOT_VALUE_TEMPLATE, REACT_SYSTEM
from prompts.neo4j_prompts import CYPHER_PROMPT, QA_PROMPT
```

## Design Principles

1. **Separation of Concerns**: Each file contains prompts for a specific domain
2. **Version Control**: All prompts are tracked in Git for version history
3. **Reusability**: Prompts can be imported and reused across multiple modules
4. **Maintainability**: Centralized location makes updates easier and reduces duplication

## Original Locations

These prompts were extracted from:
- `frontend/scripts/ace_components.py` → `ace_memory_prompts.py`
- `frontend/scripts/langgraph_utile.py` → `reasoning_prompts.py`
- `frontend/scripts/neotj_tool_prompt.py` → `neo4j_prompts.py`
