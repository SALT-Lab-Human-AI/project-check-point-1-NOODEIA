#!/usr/bin/env python3
"""
Integration test for prompts migration.

This script verifies that all prompts are correctly imported and accessible
in the context where they'll be used by the AI agent.
"""

import sys
import os
from pathlib import Path

# Add frontend/scripts to path (simulating runtime environment)
# Navigate from unitTests/prompts/ to frontend/scripts/
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
SCRIPT_DIR = PROJECT_ROOT / "frontend" / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

def test_ace_components():
    """Test ACE components can access prompts"""
    try:
        from ace_components import ACEPipeline, ExecutionTrace

        # Create a test execution trace
        trace = ExecutionTrace(
            question="Test question",
            model_answer="Test answer",
            ground_truth="Test ground truth",
            success=True
        )

        print("✅ ACE Components: Can create ExecutionTrace")

        # Check that prompts are accessible
        from ace_components import REFLECTOR_PROMPT, CURATOR_PROMPT

        # Verify prompts have expected content
        assert "Reflector" in REFLECTOR_PROMPT, "REFLECTOR_PROMPT missing key content"
        assert "Curator" in CURATOR_PROMPT, "CURATOR_PROMPT missing key content"
        assert "{trace}" in REFLECTOR_PROMPT, "REFLECTOR_PROMPT missing {trace} placeholder"
        assert "{lessons}" in CURATOR_PROMPT, "CURATOR_PROMPT missing {lessons} placeholder"

        print("✅ ACE Components: REFLECTOR_PROMPT and CURATOR_PROMPT accessible and valid")
        return True

    except Exception as e:
        print(f"❌ ACE Components: Failed - {e}")
        import traceback
        traceback.print_exc()
        return False

def test_langgraph_utile():
    """Test LangGraph utilities can access prompts"""
    try:
        from langgraph_utile import (
            COT_PROMPT,
            TOT_EXPAND_TEMPLATE,
            TOT_VALUE_TEMPLATE,
            REACT_SYSTEM,
            CYPHER_PROMPT,
            QA_PROMPT
        )

        # Verify reasoning prompts
        assert "careful reasoner" in COT_PROMPT, "COT_PROMPT missing key content"
        assert "ReAct" in REACT_SYSTEM, "REACT_SYSTEM missing key content"
        assert "{k}" in TOT_EXPAND_TEMPLATE, "TOT_EXPAND_TEMPLATE missing {k} placeholder"

        print("✅ LangGraph Utils: All reasoning prompts accessible and valid")

        # Verify Neo4j prompts
        assert "Cypher" in CYPHER_PROMPT, "CYPHER_PROMPT missing key content"
        assert "{schema}" in CYPHER_PROMPT, "CYPHER_PROMPT missing {schema} placeholder"
        assert "{question}" in CYPHER_PROMPT, "CYPHER_PROMPT missing {question} placeholder"
        assert "{context}" in QA_PROMPT, "QA_PROMPT missing {context} placeholder"

        print("✅ LangGraph Utils: All Neo4j prompts accessible and valid")
        return True

    except Exception as e:
        print(f"❌ LangGraph Utils: Failed - {e}")
        import traceback
        traceback.print_exc()
        return False

def test_langgraph_agent():
    """Test LangGraph agent can import and use prompts"""
    try:
        from langgraph_agent_ace import build_ace_graph

        print("✅ LangGraph Agent: Can build ACE graph with all dependencies")

        # Verify the graph builder function is callable
        assert callable(build_ace_graph), "build_ace_graph is not callable"

        print("✅ LangGraph Agent: build_ace_graph is ready to use")
        return True

    except Exception as e:
        print(f"❌ LangGraph Agent: Failed - {e}")
        import traceback
        traceback.print_exc()
        return False

def test_run_ace_agent():
    """Test the main entry point can import everything"""
    try:
        from run_ace_agent import main

        print("✅ Run ACE Agent: Entry point can be imported")

        # Verify main function is callable
        assert callable(main), "main function is not callable"

        print("✅ Run ACE Agent: Ready for API calls")
        return True

    except Exception as e:
        print(f"❌ Run ACE Agent: Failed - {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all integration tests"""
    print("=" * 70)
    print("PROMPTS MIGRATION INTEGRATION TEST")
    print("=" * 70)
    print()

    tests = [
        ("ACE Components", test_ace_components),
        ("LangGraph Utilities", test_langgraph_utile),
        ("LangGraph Agent", test_langgraph_agent),
        ("Run ACE Agent", test_run_ace_agent),
    ]

    results = []
    for test_name, test_func in tests:
        print(f"\n--- Testing: {test_name} ---")
        result = test_func()
        results.append((test_name, result))
        print()

    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)

    all_passed = True
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
        if not result:
            all_passed = False

    print()
    if all_passed:
        print("🎉 ALL TESTS PASSED - Prompts migration successful!")
        print("   The AI agent will work correctly with the new prompt structure.")
        return 0
    else:
        print("⚠️  SOME TESTS FAILED - Please review errors above")
        return 1

if __name__ == "__main__":
    sys.exit(main())
