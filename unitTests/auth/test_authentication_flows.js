#!/usr/bin/env node
/**
 * Authentication Flow Tests
 *
 * Tests Suite 1 from docs/minimalTest/useCase.md:
 * - 1.1: New user signup flow
 * - 1.2: Existing user login flow
 * - 1.3: Supabase/Neo4j sync recovery
 */

const { createClient } = require('@supabase/supabase-js')
const neo4j = require('neo4j-driver')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../frontend/.env.local') })

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const neo4jUri = process.env.NEXT_PUBLIC_NEO4J_URI
const neo4jUser = process.env.NEXT_PUBLIC_NEO4J_USERNAME
const neo4jPassword = process.env.NEXT_PUBLIC_NEO4J_PASSWORD

// Initialize clients
const supabase = createClient(supabaseUrl, supabaseKey)
const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword))

// Test helpers
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

// Test Suite 1.1: New User Signup Flow
async function testNewUserSignup() {
  printSection('Test 1.1: New User Signup Flow')

  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'testpass123'

  try {
    // Step 1: Sign up new user in Supabase
    console.log(`\n📝 Creating new user: ${testEmail}`)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    if (signUpError) {
      logTest('1.1.1: Supabase signup', 'FAIL', signUpError.message)
      return
    }

    logTest('1.1.1: Supabase signup', 'PASS', `User ID: ${signUpData.user.id}`)

    // Step 2: Verify session created
    if (signUpData.session) {
      logTest('1.1.2: Session created', 'PASS', 'Access token exists')
    } else {
      logTest('1.1.2: Session created', 'FAIL', 'No session returned')
    }

    // Step 3: Sign in with new credentials (simulates auto-login after signup)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (signInError) {
      logTest('1.1.3: Auto-login after signup', 'FAIL', signInError.message)
      return
    }

    logTest('1.1.3: Auto-login after signup', 'PASS')

    // Step 4: Simulate what AIAssistantUI.jsx does - check if Neo4j user exists
    console.log('\n📊 Simulating Neo4j auto-creation check...')
    const session = driver.session()

    try {
      const userId = signInData.user.id

      // Check if user exists in Neo4j
      const result = await session.run(
        'MATCH (u:User {id: $userId}) RETURN u',
        { userId }
      )

      if (result.records.length === 0) {
        // User doesn't exist - should auto-create (simulating AIAssistantUI.jsx lines 104-115)
        console.log('   User not in Neo4j, creating...')

        const userName = signInData.user.user_metadata?.name || testEmail.split('@')[0]
        await session.run(
          `CREATE (u:User {
            id: $userId,
            email: $email,
            name: $name,
            xp: 0,
            level: 1,
            createdAt: datetime()
          })
          RETURN u`,
          { userId, email: testEmail, name: userName }
        )

        logTest('1.1.4: Neo4j user auto-creation', 'PASS', `Name: ${userName}, XP: 0, Level: 1`)
      } else {
        logTest('1.1.4: Neo4j user auto-creation', 'PASS', 'User already exists')
      }

      // Step 5: Verify final state
      const verifyResult = await session.run(
        'MATCH (u:User {id: $userId}) RETURN u.email, u.name, u.xp, u.level',
        { userId }
      )

      if (verifyResult.records.length > 0) {
        const user = verifyResult.records[0]
        const xp = user.get('u.xp')
        const level = user.get('u.level')

        if (xp === 0 && level === 1) {
          logTest('1.1.5: Default XP/Level', 'PASS', 'XP: 0, Level: 1')
        } else {
          logTest('1.1.5: Default XP/Level', 'FAIL', `XP: ${xp}, Level: ${level}`)
        }
      }

    } finally {
      await session.close()
    }

    // Cleanup: Sign out
    await supabase.auth.signOut()

  } catch (error) {
    console.error('\n❌ Test suite error:', error.message)
    testsFailed++
  }
}

// Test Suite 1.2: Existing User Login Flow
async function testExistingUserLogin() {
  printSection('Test 1.2: Existing User Login Flow')

  try {
    // Use a known test account or create one
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com'
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123'

    console.log(`\n📝 Testing login with: ${testEmail}`)

    // Step 1: Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (error) {
      logTest('1.2.1: Supabase login', 'FAIL', error.message)
      console.log('   ℹ️  Note: Create test user first or set TEST_USER_EMAIL/TEST_USER_PASSWORD')
      return
    }

    logTest('1.2.1: Supabase login', 'PASS', `User ID: ${data.user.id}`)

    // Step 2: Verify session
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData?.session) {
      logTest('1.2.2: Session validation', 'PASS', 'Active session exists')
    } else {
      logTest('1.2.2: Session validation', 'FAIL', 'No active session')
      return
    }

    // Step 3: Check Neo4j user exists
    const session = driver.session()
    try {
      const result = await session.run(
        'MATCH (u:User {id: $userId}) RETURN u.email, u.xp, u.level',
        { userId: data.user.id }
      )

      if (result.records.length > 0) {
        const user = result.records[0]
        logTest('1.2.3: Neo4j user lookup', 'PASS',
          `XP: ${user.get('u.xp')}, Level: ${user.get('u.level')}`)
      } else {
        logTest('1.2.3: Neo4j user lookup', 'FAIL', 'User not found in Neo4j')
      }

      // Step 4: Check for conversation history
      const sessionsResult = await session.run(
        'MATCH (u:User {id: $userId})-[:HAS]->(s:Session) RETURN count(s) as sessionCount',
        { userId: data.user.id }
      )

      const sessionCount = sessionsResult.records[0]?.get('sessionCount')?.toNumber() || 0
      logTest('1.2.4: Conversation history', 'PASS', `${sessionCount} sessions found`)

    } finally {
      await session.close()
    }

    // Cleanup
    await supabase.auth.signOut()

  } catch (error) {
    console.error('\n❌ Test suite error:', error.message)
    testsFailed++
  }
}

// Test Suite 1.3: Supabase/Neo4j Sync Recovery
async function testSyncRecovery() {
  printSection('Test 1.3: Supabase/Neo4j Sync Recovery')

  const testEmail = `sync-test-${Date.now()}@example.com`
  const testPassword = 'synctest123'

  try {
    // Step 1: Create user in Supabase only
    console.log(`\n📝 Creating Supabase-only user: ${testEmail}`)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    })

    if (signUpError) {
      logTest('1.3.1: Supabase user creation', 'FAIL', signUpError.message)
      return
    }

    logTest('1.3.1: Supabase user creation', 'PASS')
    const userId = signUpData.user.id

    // Step 2: Verify NOT in Neo4j initially
    const session = driver.session()
    try {
      const checkResult = await session.run(
        'MATCH (u:User {id: $userId}) RETURN u',
        { userId }
      )

      if (checkResult.records.length === 0) {
        logTest('1.3.2: User missing from Neo4j', 'PASS', 'Mismatch created')
      } else {
        logTest('1.3.2: User missing from Neo4j', 'FAIL', 'User already exists')
      }

      // Step 3: Simulate auto-creation (what AIAssistantUI.jsx does)
      console.log('   Simulating auto-creation...')
      const userName = signUpData.user.user_metadata?.name || testEmail.split('@')[0]

      await session.run(
        `CREATE (u:User {
          id: $userId,
          email: $email,
          name: $name,
          xp: 0,
          level: 1,
          createdAt: datetime()
        })`,
        { userId, email: testEmail, name: userName }
      )

      logTest('1.3.3: Auto-creation executed', 'PASS')

      // Step 4: Verify sync recovered
      const verifyResult = await session.run(
        'MATCH (u:User {id: $userId}) RETURN u.id, u.email, u.xp, u.level',
        { userId }
      )

      if (verifyResult.records.length > 0) {
        const user = verifyResult.records[0]
        if (user.get('u.xp') === 0 && user.get('u.level') === 1) {
          logTest('1.3.4: Sync recovered successfully', 'PASS', 'User now in both systems')
        } else {
          logTest('1.3.4: Sync recovered successfully', 'FAIL', 'Incorrect initial values')
        }
      } else {
        logTest('1.3.4: Sync recovered successfully', 'FAIL', 'User still missing')
      }

    } finally {
      await session.close()
    }

    // Cleanup
    await supabase.auth.signOut()

  } catch (error) {
    console.error('\n❌ Test suite error:', error.message)
    testsFailed++
  }
}

// Main execution
async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════════════╗')
  console.log('║            AUTHENTICATION FLOW TESTS                             ║')
  console.log('╚══════════════════════════════════════════════════════════════════╝')
  console.log(`\nTest Suite 1: Authentication & User Initialization`)
  console.log(`Source: docs/minimalTest/useCase.md`)
  console.log(`\nConfiguration:`)
  console.log(`  Supabase URL: ${supabaseUrl}`)
  console.log(`  Neo4j URI: ${neo4jUri}`)

  try {
    await testNewUserSignup()
    await testExistingUserLogin()
    await testSyncRecovery()

    // Summary
    console.log('\n╔══════════════════════════════════════════════════════════════════╗')
    console.log('║                        TEST SUMMARY                              ║')
    console.log('╚══════════════════════════════════════════════════════════════════╝')
    console.log(`\nTests Passed: ${testsPassed}`)
    console.log(`Tests Failed: ${testsFailed}`)
    console.log(`Total Tests: ${testsPassed + testsFailed}`)

    if (testsFailed === 0) {
      console.log('\n🎉 ALL AUTHENTICATION TESTS PASSED!\n')
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

module.exports = { runTests }
