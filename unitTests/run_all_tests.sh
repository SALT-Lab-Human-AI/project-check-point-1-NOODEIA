#!/bin/bash

# Master Test Runner - Executes All Unit Tests
# Based on test suites documented in docs/minimalTest/useCase.md

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                 NOODEIA - COMPREHENSIVE TEST SUITE                   ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Source: docs/minimalTest/useCase.md"
echo "Running all automated unit tests..."
echo ""

# Navigate to unitTests directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

TOTAL_PASSED=0
TOTAL_FAILED=0
SUITES_RUN=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run a test and track results
run_test() {
    local test_name=$1
    local test_command=$2
    local test_dir=$3

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Running: $test_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    if [ ! -z "$test_dir" ]; then
        cd "$SCRIPT_DIR/$test_dir"
    fi

    eval "$test_command"
    local exit_code=$?

    cd "$SCRIPT_DIR"

    SUITES_RUN=$((SUITES_RUN + 1))

    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ $test_name: PASSED${NC}"
        TOTAL_PASSED=$((TOTAL_PASSED + 1))
    else
        echo -e "${RED}❌ $test_name: FAILED${NC}"
        TOTAL_FAILED=$((TOTAL_FAILED + 1))
    fi

    return $exit_code
}

# Test Suite 1: System Prompts (CRITICAL)
run_test "Suite 8: System Prompts Verification" "./verify_all.sh" "prompts"

# Test Suite 2: Authentication (CRITICAL)
run_test "Suite 1: Authentication Flows" "node test_authentication_flows.js" "auth"

# Test Suite 3: Quiz System (CRITICAL)
run_test "Suite 3: Quiz Node Assignment" "node test_quiz_node_assignment.js" "quiz"

# Test Suite 4: Gamification (CRITICAL)
run_test "Suite 5: XP & Leveling" "node test_xp_leveling.js" "gamification"

# Test Suite 5: AI Chat (CRITICAL - May be slow)
echo ""
echo "⏱️  Note: AI Chat tests may take 30-60 seconds (includes Python subprocess)"
run_test "Suite 2: AI Chat API" "node test_ai_chat_api.js" "ai_chat"

# Test Suite 6: Group Chat
run_test "Suite 4: Group Chat @ai Mentions" "node test_ai_mentions.js" "group_chat"

# Test Suite 7: Data Persistence
run_test "Suite 7: Data Persistence" "node test_neo4j_persistence.js" "data_persistence"

# Test Suite 8: ACE Memory (Optional - can be slow)
echo ""
echo "ℹ️  Skipping ACE Memory comparison (run manually if needed)"
echo "   Command: cd ace_memory && python3 test_memory_comparison.py"

# Final Summary
echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                         COMPREHENSIVE SUMMARY                        ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Test Suites Run:    $SUITES_RUN"
echo -e "Suites Passed:      ${GREEN}$TOTAL_PASSED${NC}"
echo -e "Suites Failed:      ${RED}$TOTAL_FAILED${NC}"
echo ""

if [ $TOTAL_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    🎉 ALL TESTS PASSED! 🎉                           ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "✅ System is PRODUCTION READY"
    echo "✅ All critical paths verified"
    echo "✅ Safe to deploy"
    echo ""
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                  ⚠️  SOME TESTS FAILED ⚠️                            ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "❌ System has issues - DO NOT DEPLOY"
    echo "📋 Review failed tests above"
    echo "🔧 Fix issues before proceeding"
    echo ""
    exit 1
fi
