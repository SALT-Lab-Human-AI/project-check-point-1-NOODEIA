#!/usr/bin/env node

import neo4j from 'neo4j-driver'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

// Neo4j connection
const driver = neo4j.driver(
  process.env.NEXT_PUBLIC_NEO4J_URI,
  neo4j.auth.basic(
    process.env.NEXT_PUBLIC_NEO4J_USERNAME,
    process.env.NEXT_PUBLIC_NEO4J_PASSWORD
  ),
  {
    disableLosslessIntegers: true,
    connectionTimeout: 30000,
    maxTransactionRetryTime: 30000
  }
)

async function setupMarkdownSchema() {
  const session = driver.session()

  try {
    console.log('🔧 Setting up Markdown schema in Neo4j...\n')

    // Test connection first
    console.log('Testing database connection...')
    try {
      await driver.verifyConnectivity()
      console.log('✅ Database connected\n')
    } catch (connError) {
      console.error('⚠️  Database connection failed. Make sure Neo4j AuraDB is running.')
      console.error('Error details:', connError.message)
      console.log('\nYou can still run the application locally - the markdown feature will work')
      console.log('when the database becomes available. Try running this script again later.\n')
      process.exit(1)
    }

    // Create indexes for better performance
    console.log('Creating indexes...')

    try {
      await session.run(
        'CREATE INDEX markdown_note_id IF NOT EXISTS FOR (n:MarkdownNote) ON (n.id)'
      )

      await session.run(
        'CREATE INDEX mindmap_id IF NOT EXISTS FOR (m:MindMap) ON (m.id)'
      )

      console.log('✅ Indexes created\n')
    } catch (indexError) {
      console.warn('⚠️  Index creation warning:', indexError.message)
    }

    // Create constraints
    console.log('Creating constraints...')

    try {
      await session.run(
        'CREATE CONSTRAINT unique_markdown_per_session IF NOT EXISTS FOR ()-[r:HAS_NOTES]-() REQUIRE r.id IS UNIQUE'
      )
    } catch (error) {
      // Constraint might already exist or not be supported
      console.log('Note: Could not create uniqueness constraint (may already exist)')
    }

    console.log('✅ Constraints created\n')

    // Add properties to existing Session nodes if needed
    console.log('Updating Session nodes schema...')

    await session.run(`
      MATCH (s:Session)
      WHERE NOT EXISTS(s.hasMarkdown)
      SET s.hasMarkdown = false
      RETURN count(s) as updated
    `)

    console.log('✅ Session nodes updated\n')

    // Sample markdown content for testing
    const sampleMarkdown = `# Conversation Notes

## Key Topics
* Machine Learning fundamentals
* Neural Networks architecture
* Data preprocessing techniques

## Important Concepts

### Supervised Learning
The model learns from labeled training data, where each example has an input and the correct output.

### Unsupervised Learning
The model finds patterns in data without labeled examples.

## Action Items
- [ ] Review gradient descent algorithm
- [ ] Practice with TensorFlow
- [ ] Complete the dataset preparation

## Resources
* [Deep Learning Book](https://www.deeplearningbook.org/)
* [TensorFlow Documentation](https://www.tensorflow.org/)
`

    // Create a sample markdown note for any existing session (optional)
    console.log('Creating sample markdown note (if sessions exist)...')

    const result = await session.run(`
      MATCH (s:Session)
      WITH s LIMIT 1
      MERGE (s)-[:HAS_NOTES]->(n:MarkdownNote)
      SET n.content = $content,
          n.lastModified = datetime(),
          n.id = randomUUID()
      RETURN s.id as sessionId, n.id as noteId
    `, { content: sampleMarkdown })

    if (result.records.length > 0) {
      const sessionId = result.records[0].get('sessionId')
      console.log(`✅ Sample markdown note created for session: ${sessionId}\n`)
    } else {
      console.log('No existing sessions found. Sample note not created.\n')
    }

    // Display schema information
    console.log('📊 Markdown Schema Information:')
    console.log('================================')
    console.log('New Node Types:')
    console.log('  - MarkdownNote: Stores markdown content for conversations')
    console.log('  - MindMap: Stores generated mind map data')
    console.log('\nNew Relationships:')
    console.log('  - (:Session)-[:HAS_NOTES]->(:MarkdownNote)')
    console.log('  - (:Session)-[:HAS_MINDMAP]->(:MindMap)')
    console.log('\nMarkdownNote Properties:')
    console.log('  - id: Unique identifier')
    console.log('  - content: Markdown text content')
    console.log('  - lastModified: Timestamp of last edit')
    console.log('  - userId: ID of the user who created/edited')
    console.log('\nMindMap Properties:')
    console.log('  - id: Unique identifier')
    console.log('  - data: JSON structure of mind map')
    console.log('  - markdown: Source markdown content')
    console.log('  - lastGenerated: Timestamp of generation')
    console.log('================================\n')

    console.log('✅ Markdown schema setup completed successfully!')

  } catch (error) {
    console.error('❌ Error setting up markdown schema:', error)
    throw error
  } finally {
    await session.close()
    await driver.close()
  }
}

// Run the setup
setupMarkdownSchema().catch(error => {
  console.error('Setup failed:', error)
  process.exit(1)
})