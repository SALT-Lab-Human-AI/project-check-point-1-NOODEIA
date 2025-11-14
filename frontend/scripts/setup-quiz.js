#!/usr/bin/env node

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../.env.local') })

import { neo4jService } from '../lib/neo4j.js'

async function setupQuizSchema() {
  const session = neo4jService.getSession()

  try {
    console.log('🎮 Setting up Quiz System schema...')
    await neo4jService.verifyConnectivity()

    // QuizProgress node constraints
    await session.run(`
      CREATE CONSTRAINT quiz_progress_user_id_unique IF NOT EXISTS
      FOR (qp:QuizProgress) REQUIRE qp.userId IS UNIQUE
    `)
    console.log('✅ QuizProgress constraint created')

    // QuizSession node constraints
    await session.run(`
      CREATE CONSTRAINT quiz_session_id_unique IF NOT EXISTS
      FOR (qs:QuizSession) REQUIRE qs.id IS UNIQUE
    `)
    console.log('✅ QuizSession constraint created')

    // Indexes for efficient queries
    await session.run(`
      CREATE INDEX quiz_session_user_idx IF NOT EXISTS
      FOR (qs:QuizSession) ON (qs.userId)
    `)
    console.log('✅ QuizSession userId index created')

    await session.run(`
      CREATE INDEX quiz_session_completed_at_idx IF NOT EXISTS
      FOR (qs:QuizSession) ON (qs.completedAt)
    `)
    console.log('✅ QuizSession completedAt index created')

    await session.run(`
      CREATE INDEX quiz_session_node_type_idx IF NOT EXISTS
      FOR (qs:QuizSession) ON (qs.nodeType)
    `)
    console.log('✅ QuizSession nodeType index created')

    console.log('🎉 Quiz System schema setup completed successfully!')

  } catch (error) {
    console.error('\n❌ Error setting up Quiz schema:', error)
    throw error
  } finally {
    await session.close()
    await neo4jService.close()
  }
}

setupQuizSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  })
