#!/usr/bin/env node

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../.env.local') })

import { neo4jService } from '../lib/neo4j.js'

async function setupNeo4jSchema() {
  const session = neo4jService.getSession()

  try {
    await neo4jService.verifyConnectivity()

    await session.run(`
      CREATE CONSTRAINT user_id_unique IF NOT EXISTS
      FOR (u:User) REQUIRE u.id IS UNIQUE
    `)

    await session.run(`
      CREATE CONSTRAINT session_id_unique IF NOT EXISTS
      FOR (s:Session) REQUIRE s.id IS UNIQUE
    `)

    await session.run(`
      CREATE CONSTRAINT chat_id_unique IF NOT EXISTS
      FOR (c:Chat) REQUIRE c.id IS UNIQUE
    `)

    await session.run(`
      CREATE INDEX user_email_idx IF NOT EXISTS
      FOR (u:User) ON (u.email)
    `)

    await session.run(`
      CREATE INDEX session_created_at_idx IF NOT EXISTS
      FOR (s:Session) ON (s.created_at)
    `)

    await session.run(`
      CREATE INDEX session_updated_at_idx IF NOT EXISTS
      FOR (s:Session) ON (s.updated_at)
    `)

    await session.run(`
      CREATE INDEX chat_created_at_idx IF NOT EXISTS
      FOR (c:Chat) ON (c.created_at)
    `)

    await session.run(`
      CREATE INDEX chat_role_idx IF NOT EXISTS
      FOR (c:Chat) ON (c.role)
    `)

  } catch (error) {
    console.error('\n Error setting up Neo4j schema:', error)
    throw error
  } finally {
    await session.close()
    await neo4jService.close()
  }
}

setupNeo4jSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Setup failed:', error)
    process.exit(1)
  })
