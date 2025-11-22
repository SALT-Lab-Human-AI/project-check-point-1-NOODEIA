#!/bin/bash

# Prompts Migration - Complete Verification Script
# Run this anytime to verify the prompts migration is working correctly

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║         PROMPTS MIGRATION - COMPLETE VERIFICATION                  ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"
cd "$SCRIPT_DIR"

TESTS_PASSED=0
TESTS_FAILED=0

echo "Working directory: $SCRIPT_DIR"
echo "Project root: $PROJECT_ROOT"
echo ""

# Test 1: Integration Test
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Running Integration Tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
python3 test_prompts_integration.py
if [ $? -eq 0 ]; then
    echo "✅ Integration Tests: PASSED"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "❌ Integration Tests: FAILED"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 2: API Simulation Test
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Running API Simulation..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
python3 test_api_simulation.py
if [ $? -eq 0 ]; then
    echo "✅ API Simulation: PASSED"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "❌ API Simulation: FAILED"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 3: Verify Prompt Files Exist
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Verifying Prompt Files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

FILES_OK=true
PROMPTS_DIR="$PROJECT_ROOT/prompts"
for file in "ace_memory_prompts.py" "reasoning_prompts.py" "neo4j_prompts.py"; do
    if [ -f "$PROMPTS_DIR/$file" ]; then
        echo "  ✅ Found: $file"
    else
        echo "  ❌ Missing: $file"
        FILES_OK=false
    fi
done

if [ "$FILES_OK" = true ]; then
    echo "✅ All Prompt Files: PRESENT"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "❌ Some Prompt Files: MISSING"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 4: Python Compilation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Verifying Python Compilation..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd "$PROMPTS_DIR"
python3 -m py_compile ace_memory_prompts.py reasoning_prompts.py neo4j_prompts.py 2>&1
cd "$SCRIPT_DIR"
if [ $? -eq 0 ]; then
    echo "✅ Python Compilation: PASSED"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo "❌ Python Compilation: FAILED"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Final Summary
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                      VERIFICATION SUMMARY                          ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Tests Passed: $TESTS_PASSED / $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED!"
    echo ""
    echo "✅ The prompts migration is working correctly."
    echo "✅ The AI agent is ready for use."
    echo "✅ No issues detected."
    echo ""
    exit 0
else
    echo "⚠️  SOME TESTS FAILED"
    echo ""
    echo "Please review the errors above and check:"
    echo "  1. All prompt files are present"
    echo "  2. Python dependencies are installed"
    echo "  3. Import paths are correct"
    echo ""
    exit 1
fi
