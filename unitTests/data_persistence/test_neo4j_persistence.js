#!/usr/bin/env node
/**
 * Data Persistence Tests
 *
 * Tests Suite 7 from docs/minimalTest/useCase.md:
 * - 7.1: Conversation history persistence (:NEXT chain integrity)
 * - 7.2: Markdown notes auto-save
 */

const neo4j = require('neo4j-driver')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../frontend/.env.local') })

// Configuration
const neo4jUri = process.env.NEXT_PUBLIC_NEO4J_URI
const neo4jUser = process.env.NEXT_PUBLIC_NEO4J_USERNAME
const neo4jPassword = process.env.NEXT_PUBLIC_NEO4J_PASSWORD

const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword))

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

// Test 7.1: Conversation History Persistence
async function testConversationPersistence() {
  printSection('Test 7.1: Conversation History with :NEXT Chain')

  const session = driver.session()

  try {
    const testUserId = `test-user-${Date.now()}`
    const sessionId = `test-session-${Date.now()}`

    console.log('\n📝 Creating test conversation with 5 messages')

    // Create user and session
    await session.run(
      `CREATE (u:User {id: $userId, email: 'persisttest@example.com', name: 'Persist Test'})
       CREATE (s:Session {id: $sessionId, title: 'Test Conversation', created_at: datetime()})
       CREATE (u)-[:HAS]->(s)
       RETURN s`,
      { userId: testUserId, sessionId }
    )

    logTest('7.1.1: Session creation', 'PASS', `Session ID: ${sessionId}`)

    // Create chain of 5 messages with :NEXT relationships
    const messages = [
      { role: 'user', content: 'Hello AI' },
      { role: 'assistant', content: 'Hi! How can I help?' },
      { role: 'user', content: 'Explain fractions' },
      { role: 'assistant', content: 'Fractions represent parts of a whole...' },
      { role: 'user', content: 'Thanks!' }
    ]

    let previousChatId = null

    for (let i = 0; i < messages.length; i++) {
      const chatId = `chat-${sessionId}-${i}`
      const msg = messages[i]

      if (i === 0) {
        // First message
        await session.run(
          `MATCH (s:Session {id: $sessionId})
           CREATE (c:Chat {id: $chatId, role: $role, content: $content, created_at: datetime()})
           CREATE (s)-[:OCCURRED]->(c)
           RETURN c`,
          { sessionId, chatId, role: msg.role, content: msg.content }
        )
      } else {
        // Subsequent messages - create :NEXT relationship
        await session.run(
          `MATCH (prev:Chat {id: $prevId})
           MATCH (s:Session {id: $sessionId})
           CREATE (c:Chat {id: $chatId, role: $role, content: $content, created_at: datetime()})
           CREATE (s)-[:OCCURRED]->(c)
           CREATE (prev)-[:NEXT]->(c)
           RETURN c`,
          { sessionId, prevId: previousChatId, chatId, role: msg.role, content: msg.content }
        )
      }

      previousChatId = chatId
    }

    logTest('7.1.2: Message chain created', 'PASS', `${messages.length} messages with :NEXT links`)

    // Verify chain integrity
    const chainResult = await session.run(
      `MATCH (s:Session {id: $sessionId})-[:OCCURRED]->(first:Chat)
       WHERE NOT ()-[:NEXT]->(first)
       MATCH path = (first)-[:NEXT*]->(last:Chat)
       WHERE NOT (last)-[:NEXT]->()
       RETURN length(path) as chainLength`,
      { sessionId }
    )

    if (chainResult.records.length > 0) {
      const chainLength = chainResult.records[0].get('chainLength').toNumber()
      // Chain length should be messages.length - 1 (number of :NEXT relationships)
      if (chainLength === messages.length - 1) {
        logTest('7.1.3: Chain integrity', 'PASS', `${chainLength} :NEXT links (${messages.length} messages)`)
      } else {
        logTest('7.1.3: Chain integrity', 'FAIL', `Expected ${messages.length - 1}, got ${chainLength}`)
      }
    } else {
      logTest('7.1.3: Chain integrity', 'FAIL', 'Could not find complete chain')
    }

    // Verify all messages belong to session
    const messagesResult = await session.run(
      `MATCH (s:Session {id: $sessionId})-[:OCCURRED]->(c:Chat)
       RETURN count(c) as messageCount`,
      { sessionId }
    )

    const messageCount = messagesResult.records[0].get('messageCount').toNumber()
    if (messageCount === messages.length) {
      logTest('7.1.4: Message count', 'PASS', `All ${messages.length} messages linked to session`)
    } else {
      logTest('7.1.4: Message count', 'FAIL', `Expected ${messages.length}, found ${messageCount}`)
    }

    // Cleanup
    await session.run(
      `MATCH (u:User {id: $userId})-[:HAS]->(s:Session {id: $sessionId})
       MATCH (s)-[:OCCURRED]->(c:Chat)
       DETACH DELETE u, s, c`,
      { userId: testUserId, sessionId }
    )

  } catch (error) {
    console.error('\n❌ Test error:', error.message)
    testsFailed++
  } finally {
    await session.close()
  }
}

// Test 7.2: Markdown Notes Auto-Save
async function testMarkdownAutoSave() {
  printSection('Test 7.2: Markdown Notes Auto-Save')

  const session = driver.session()

  try {
    const testSessionId = `test-md-session-${Date.now()}`
    const testUserId = `test-md-user-${Date.now()}`
    const testContent = '# Test Notes\n\nThis is test markdown content.'

    console.log('\n📝 Creating test markdown note')

    // Create user and session
    await session.run(
      `CREATE (u:User {id: $userId, email: 'mdtest@example.com', name: 'MD Test'})
       CREATE (s:Session {id: $sessionId, title: 'Test Session', created_at: datetime()})
       CREATE (u)-[:HAS]->(s)`,
      { userId: testUserId, sessionId: testSessionId }
    )

    // Create markdown note (simulates auto-save from MarkdownPanel.jsx)
    await session.run(
      `MATCH (s:Session {id: $sessionId})
       MERGE (s)-[:HAS_NOTES]->(n:MarkdownNote {conversationId: $sessionId})
       ON CREATE SET n.content = $content, n.lastModified = datetime()
       ON MATCH SET n.content = $content, n.lastModified = datetime()
       RETURN n`,
      { sessionId: testSessionId, content: testContent }
    )

    logTest('7.2.1: Markdown note created', 'PASS')

    // Verify retrieval
    const verifyResult = await session.run(
      `MATCH (s:Session {id: $sessionId})-[:HAS_NOTES]->(n:MarkdownNote)
       RETURN n.content, n.lastModified`,
      { sessionId: testSessionId }
    )

    if (verifyResult.records.length > 0) {
      const note = verifyResult.records[0]
      const content = note.get('n.content')
      const lastModified = note.get('n.lastModified')

      if (content === testContent) {
        logTest('7.2.2: Content persistence', 'PASS', 'Markdown content matches')
      } else {
        logTest('7.2.2: Content persistence', 'FAIL', 'Content mismatch')
      }

      if (lastModified) {
        logTest('7.2.3: Timestamp tracking', 'PASS', `lastModified: ${lastModified.toString().substring(0, 19)}`)
      } else {
        logTest('7.2.3: Timestamp tracking', 'FAIL', 'No lastModified timestamp')
      }
    } else {
      logTest('7.2.2: Content persistence', 'FAIL', 'Note not found')
    }

    // Test update (simulates 2nd auto-save)
    const updatedContent = testContent + '\n\n## Updated section'
    await session.run(
      `MATCH (s:Session {id: $sessionId})-[:HAS_NOTES]->(n:MarkdownNote)
       SET n.content = $content, n.lastModified = datetime()
       RETURN n`,
      { sessionId: testSessionId, content: updatedContent }
    )

    // Verify update
    const updateResult = await session.run(
      `MATCH (s:Session {id: $sessionId})-[:HAS_NOTES]->(n:MarkdownNote)
       RETURN n.content`,
      { sessionId: testSessionId }
    )

    if (updateResult.records.length > 0) {
      const updatedNote = updateResult.records[0].get('n.content')
      if (updatedNote === updatedContent) {
        logTest('7.2.4: Note update', 'PASS', 'Content updated successfully')
      } else {
        logTest('7.2.4: Note update', 'FAIL', 'Update not persisted')
      }
    }

    // Cleanup
    await session.run(
      `MATCH (u:User {id: $userId})-[:HAS]->(s:Session {id: $sessionId})
       OPTIONAL MATCH (s)-[:HAS_NOTES]->(n:MarkdownNote)
       DETACH DELETE u, s, n`,
      { userId: testUserId, sessionId: testSessionId }
    )

  } catch (error) {
    console.error('\n❌ Test error:', error.message)
    testsFailed++
  } finally {
    await session.close()
  }
}

// Main execution
async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════════════╗')
  console.log('║                 DATA PERSISTENCE TESTS                           ║')
  console.log('╚══════════════════════════════════════════════════════════════════╝')
  console.log(`\nTest Suite 7: Data Persistence`)
  console.log(`Source: docs/minimalTest/useCase.md`)
  console.log(`\nConfiguration:`)
  console.log(`  Neo4j URI: ${neo4jUri}`)

  try {
    await testConversationPersistence()
    await testMarkdownAutoSave()

    // Summary
    console.log('\n╔══════════════════════════════════════════════════════════════════╗')
    console.log('║                        TEST SUMMARY                              ║')
    console.log('╚══════════════════════════════════════════════════════════════════╝')
    console.log(`\nTests Passed: ${testsPassed}`)
    console.log(`Tests Failed: ${testsFailed}`)
    console.log(`Total Tests: ${testsPassed + testsFailed}`)

    if (testsFailed === 0) {
      console.log('\n🎉 ALL DATA PERSISTENCE TESTS PASSED!\n')
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
