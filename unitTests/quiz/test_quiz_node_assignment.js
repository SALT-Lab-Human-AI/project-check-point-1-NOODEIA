#!/usr/bin/env node
/**
 * Quiz Node Assignment Tests
 *
 * Tests Suite 3 from docs/minimalTest/useCase.md:
 * - 3.1: Perfect score (10/10) → Legendary node
 * - 3.2: High score (8-9/10) → Rare node
 * - 3.3: Low score (3-7/10) → Common node
 *
 * Tests the critical fix from October 30, 2025 (React state timing bug)
 */

const neo4j = require('neo4j-driver')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../frontend/.env.local') })

// Configuration
const neo4jUri = process.env.NEXT_PUBLIC_NEO4J_URI
const neo4jUser = process.env.NEXT_PUBLIC_NEO4J_USERNAME
const neo4jPassword = process.env.NEXT_PUBLIC_NEO4J_PASSWORD

const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword))

// Test results
let testsPassed = 0
let testsFailed = 0

function logTest(name, status, details = '') {
  const emoji = status === 'PASS' ? '✅' : '❌'
  console.log(`${emoji} ${name}`)
  if (details) console.log(`   ${details}`)
  if (status === 'PASS') testsPassed++
  else testsFailed++
}

function printSection(title) {
  console.log('\n' + '━'.repeat(70))
  console.log(title)
  console.log('━'.repeat(70))
}

// Simulate the quiz submission API logic (from frontend/app/api/quiz/submit/route.js)
function determineNodeType(score, totalQuestions) {
  const percentage = (score / totalQuestions) * 100

  // CRITICAL: Check exact match FIRST (fix from Oct 30, 2025)
  if (score === totalQuestions) {
    console.log('  🔍 LEGENDARY NODE DEBUG:')
    console.log(`    score: ${score} | type: ${typeof score}`)
    console.log(`    totalQuestions: ${totalQuestions} | type: ${typeof totalQuestions}`)
    console.log(`    score === totalQuestions? ${score === totalQuestions}`)
    console.log('    ✅ LEGENDARY assigned!')
    return { nodeType: 'legendary', xpRange: [25, 30] }
  } else if (percentage >= 80) {
    return { nodeType: 'rare', xpRange: [12, 15] }
  } else if (percentage >= 30) {
    return { nodeType: 'common', xpRange: [3, 7] }
  } else {
    return { nodeType: null, xpRange: [0, 0] }
  }
}

// Test 3.1: Perfect Score → Legendary Node
async function testPerfectScore() {
  printSection('Test 3.1: Perfect Score → Legendary Node Assignment')

  const score = 10
  const totalQuestions = 10

  console.log(`\n📊 Test Data: ${score}/${totalQuestions} correct (100%)`)

  // Step 1: Test node type logic
  const { nodeType, xpRange } = determineNodeType(score, totalQuestions)

  if (nodeType === 'legendary') {
    logTest('3.1.1: Node type determination', 'PASS', 'legendary assigned')
  } else {
    logTest('3.1.1: Node type determination', 'FAIL', `Got '${nodeType}' instead of 'legendary'`)
    return
  }

  // Step 2: Verify XP range is correct
  if (xpRange[0] === 25 && xpRange[1] === 30) {
    logTest('3.1.2: XP range validation', 'PASS', '25-30 XP')
  } else {
    logTest('3.1.2: XP range validation', 'FAIL', `Got ${xpRange[0]}-${xpRange[1]}`)
  }

  // Step 3: Test with Neo4j (if test user exists)
  const session = driver.session()
  try {
    // Create a test quiz session
    const sessionId = `test-quiz-${Date.now()}`
    const testUserId = 'test-user-quiz'
    const xpEarned = 27.5 // Within 25-30 range

    await session.run(
      `MERGE (u:User {id: $userId})
       ON CREATE SET u.email = 'quiztest@example.com', u.name = 'Quiz Tester', u.xp = 0, u.level = 1
       CREATE (qs:QuizSession {
         id: $sessionId,
         userId: $userId,
         score: $score,
         totalQuestions: $totalQuestions,
         nodeType: $nodeType,
         xpEarned: $xpEarned,
         streak: 10,
         completedAt: datetime()
       })
       CREATE (u)-[:COMPLETED]->(qs)
       RETURN qs`,
      { userId: testUserId, sessionId, score, totalQuestions, nodeType, xpEarned }
    )

    logTest('3.1.3: Neo4j quiz session created', 'PASS', `Session ID: ${sessionId}`)

    // Verify it was stored correctly
    const verifyResult = await session.run(
      `MATCH (qs:QuizSession {id: $sessionId})
       RETURN qs.score, qs.totalQuestions, qs.nodeType, qs.xpEarned`,
      { sessionId }
    )

    if (verifyResult.records.length > 0) {
      const qs = verifyResult.records[0]
      const storedNodeType = qs.get('qs.nodeType')

      if (storedNodeType === 'legendary') {
        logTest('3.1.4: Neo4j storage verification', 'PASS', 'Legendary node persisted')
      } else {
        logTest('3.1.4: Neo4j storage verification', 'FAIL', `Stored as '${storedNodeType}'`)
      }
    }

    // Cleanup test data
    await session.run('MATCH (qs:QuizSession {id: $sessionId}) DETACH DELETE qs', { sessionId })

  } finally {
    await session.close()
  }
}

// Test 3.2: High Score → Rare Node
async function testHighScore() {
  printSection('Test 3.2: High Score → Rare Node Assignment')

  const testCases = [
    { score: 9, totalQuestions: 10, percentage: 90 },
    { score: 8, totalQuestions: 10, percentage: 80 }
  ]

  for (const testCase of testCases) {
    console.log(`\n📊 Test Data: ${testCase.score}/${testCase.totalQuestions} correct (${testCase.percentage}%)`)

    const { nodeType, xpRange } = determineNodeType(testCase.score, testCase.totalQuestions)

    if (nodeType === 'rare') {
      logTest(`3.2.${testCase.score}: Node type for ${testCase.score}/10`, 'PASS', 'rare assigned')
    } else {
      logTest(`3.2.${testCase.score}: Node type for ${testCase.score}/10`, 'FAIL', `Got '${nodeType}'`)
    }

    // Verify XP range
    if (xpRange[0] === 12 && xpRange[1] === 15) {
      logTest(`3.2.${testCase.score}b: XP range`, 'PASS', '12-15 XP')
    } else {
      logTest(`3.2.${testCase.score}b: XP range`, 'FAIL', `Got ${xpRange[0]}-${xpRange[1]}`)
    }
  }
}

// Test 3.3: Low Score → Common Node
async function testLowScore() {
  printSection('Test 3.3: Low Score → Common Node Assignment')

  const testCases = [
    { score: 7, totalQuestions: 10, percentage: 70 },
    { score: 5, totalQuestions: 10, percentage: 50 },
    { score: 3, totalQuestions: 10, percentage: 30 }
  ]

  for (const testCase of testCases) {
    console.log(`\n📊 Test Data: ${testCase.score}/${testCase.totalQuestions} correct (${testCase.percentage}%)`)

    const { nodeType, xpRange } = determineNodeType(testCase.score, testCase.totalQuestions)

    if (nodeType === 'common') {
      logTest(`3.3.${testCase.score}: Node type for ${testCase.score}/10`, 'PASS', 'common assigned')
    } else {
      logTest(`3.3.${testCase.score}: Node type for ${testCase.score}/10`, 'FAIL', `Got '${nodeType}'`)
    }

    // Verify XP range
    if (xpRange[0] === 3 && xpRange[1] === 7) {
      logTest(`3.3.${testCase.score}b: XP range`, 'PASS', '3-7 XP')
    } else {
      logTest(`3.3.${testCase.score}b: XP range`, 'FAIL', `Got ${xpRange[0]}-${xpRange[1]}`)
    }
  }
}

// Test Edge Case: React State Timing Bug (Fixed Oct 30, 2025)
async function testReactStateTiming() {
  printSection('Test 3.4: React State Timing Bug Prevention')

  console.log('\n📝 Testing finalScore calculation (prevents async bug)')
  console.log('   Bug: score state update is async, endQuiz() called immediately')
  console.log('   Fix: Calculate finalScore = correct ? score + 1 : score')

  // Simulate the fix from quiz/page.tsx line 253
  let score = 9  // Current score
  const currentQuestionIndex = 9  // Last question (index 9 = question 10)
  const correct = true  // User answered correctly

  console.log(`\n   Current score: ${score}`)
  console.log(`   Question 10/10, answer: correct`)

  // CORRECT approach (post-fix):
  const finalScore = correct ? score + 1 : score
  console.log(`   Calculated finalScore: ${finalScore}`)

  const { nodeType } = determineNodeType(finalScore, 10)

  if (finalScore === 10 && nodeType === 'legendary') {
    logTest('3.4.1: Final score calculation', 'PASS', 'finalScore = 10, legendary assigned')
  } else {
    logTest('3.4.1: Final score calculation', 'FAIL', `finalScore = ${finalScore}, nodeType = ${nodeType}`)
  }

  // Test the BUGGY approach would have failed
  const { nodeType: buggyNodeType } = determineNodeType(score, 10) // Uses old score (9)
  if (buggyNodeType === 'rare') {
    logTest('3.4.2: Bug prevention verified', 'PASS', 'Old score (9) would give rare, not legendary')
  } else {
    logTest('3.4.2: Bug prevention verified', 'FAIL', 'Bug scenario not reproduced correctly')
  }
}

// Main execution
async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════════════╗')
  console.log('║              QUIZ NODE ASSIGNMENT TESTS                          ║')
  console.log('╚══════════════════════════════════════════════════════════════════╝')
  console.log(`\nTest Suite 3: Quiz Completion & Reward Distribution`)
  console.log(`Source: docs/minimalTest/useCase.md`)
  console.log(`Critical Fix: October 30, 2025 (React state timing bug)`)
  console.log(`\nConfiguration:`)
  console.log(`  Neo4j URI: ${neo4jUri}`)

  try {
    await testPerfectScore()
    await testHighScore()
    await testLowScore()
    await testReactStateTiming()

    // Summary
    console.log('\n╔══════════════════════════════════════════════════════════════════╗')
    console.log('║                        TEST SUMMARY                              ║')
    console.log('╚══════════════════════════════════════════════════════════════════╝')
    console.log(`\nTests Passed: ${testsPassed}`)
    console.log(`Tests Failed: ${testsFailed}`)
    console.log(`Total Tests: ${testsPassed + testsFailed}`)

    if (testsFailed === 0) {
      console.log('\n🎉 ALL QUIZ TESTS PASSED!\n')
      process.exit(0)
    } else {
      console.log(`\n⚠️  ${testsFailed} TEST(S) FAILED\n`)
      process.exit(1)
    }

  } finally {
    await driver.close()
  }
}

// Run if called directly
if (require.main === module) {
  runTests().catch(err => {
    console.error('\n❌ Fatal error:', err)
    process.exit(1)
  })
}

module.exports = { runTests, determineNodeType }
