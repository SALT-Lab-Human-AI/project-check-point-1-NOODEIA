#!/usr/bin/env node

/**
 * Neo4j AuraDB Schema Setup Script
 *
 * This script initializes the Neo4j database with:
 * - Unique constraints (which automatically create indexes)
 * - Additional indexes for performance
 *
 * Run with: node frontend/scripts/setup-neo4j.js
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../.env.local') })

import { neo4jService } from '../lib/neo4j.js'

async function setupNeo4jSchema() {
  console.log('🚀 Starting Neo4j AuraDB schema setup...\n')

  const session = neo4jService.getSession()

  try {
    // First, verify connectivity
    console.log('1️⃣ Verifying Neo4j connection...')
    await neo4jService.verifyConnectivity()
    console.log('✅ Connection verified\n')

    // Create unique constraints (automatically creates indexes)
    console.log('2️⃣ Creating unique constraints...')

    await session.run(`
      CREATE CONSTRAINT user_id_unique IF NOT EXISTS
      FOR (u:User) REQUIRE u.id IS UNIQUE
    `)
    console.log('   ✓ User.id unique constraint created')

    await session.run(`
      CREATE CONSTRAINT session_id_unique IF NOT EXISTS
      FOR (s:Session) REQUIRE s.id IS UNIQUE
    `)
    console.log('   ✓ Session.id unique constraint created')

    await session.run(`
      CREATE CONSTRAINT chat_id_unique IF NOT EXISTS
      FOR (c:Chat) REQUIRE c.id IS UNIQUE
    `)
    console.log('   ✓ Chat.id unique constraint created\n')

    // Create additional indexes for performance
    console.log('3️⃣ Creating additional indexes...')

    await session.run(`
      CREATE INDEX user_email_idx IF NOT EXISTS
      FOR (u:User) ON (u.email)
    `)
    console.log('   ✓ User.email index created')

    await session.run(`
      CREATE INDEX session_created_at_idx IF NOT EXISTS
      FOR (s:Session) ON (s.created_at)
    `)
    console.log('   ✓ Session.created_at index created')

    await session.run(`
      CREATE INDEX session_updated_at_idx IF NOT EXISTS
      FOR (s:Session) ON (s.updated_at)
    `)
    console.log('   ✓ Session.updated_at index created')

    await session.run(`
      CREATE INDEX chat_created_at_idx IF NOT EXISTS
      FOR (c:Chat) ON (c.created_at)
    `)
    console.log('   ✓ Chat.created_at index created')

    await session.run(`
      CREATE INDEX chat_role_idx IF NOT EXISTS
      FOR (c:Chat) ON (c.role)
    `)
    console.log('   ✓ Chat.role index created\n')

    // Verify setup
    console.log('4️⃣ Verifying schema setup...')

    const constraints = await session.run('SHOW CONSTRAINTS')
    console.log(`   ✓ Total constraints: ${constraints.records.length}`)

    const indexes = await session.run('SHOW INDEXES')
    console.log(`   ✓ Total indexes: ${indexes.records.length}\n`)

    console.log('✅ Neo4j schema setup complete!')
    console.log('\n📊 Database Structure:')
    console.log('   (:User)-[:HAS]->(:Session)-[:OCCURRED]->(:Chat)-[:NEXT]->(:Chat)')
    console.log('\n🎉 Ready to start using Neo4j AuraDB!\n')

  } catch (error) {
    console.error('\n❌ Error setting up Neo4j schema:', error)
    throw error
  } finally {
    await session.close()
    await neo4jService.close()
  }
}

// Run the setup
setupNeo4jSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Setup failed:', error)
    process.exit(1)
  })
