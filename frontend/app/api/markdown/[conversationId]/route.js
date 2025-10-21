import { NextResponse } from 'next/server'
import { neo4jService } from '../../../../lib/neo4j'

// GET - Fetch markdown content for a conversation
export async function GET(request, { params }) {
  const { conversationId } = await params

  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = neo4jService.getSession()

    try {
      // First check if markdown note exists for this conversation
      const result = await session.run(
        `MATCH (s:Session {id: $conversationId})
         OPTIONAL MATCH (s)-[:HAS_NOTES]->(n:MarkdownNote)
         RETURN s.id as conversationId, n.content as content, n.lastModified as lastModified`,
        { conversationId }
      )

      if (result.records.length === 0) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      const record = result.records[0]
      const content = record.get('content') || ''
      const lastModified = record.get('lastModified')

      return NextResponse.json({
        conversationId: record.get('conversationId'),
        content,
        lastModified: lastModified ? lastModified.toISO() : null
      })
    } finally {
      await session.close()
    }
  } catch (error) {
    console.error('Error fetching markdown:', error)
    return NextResponse.json({ error: 'Failed to fetch markdown' }, { status: 500 })
  }
}

// POST - Save/update markdown content
export async function POST(request, { params }) {
  const { conversationId } = await params

  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, userId } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const session = neo4jService.getSession()

    try {
      // Create or update markdown note
      const result = await session.run(
        `MATCH (s:Session {id: $conversationId})
         MERGE (s)-[:HAS_NOTES]->(n:MarkdownNote)
         SET n.content = $content,
             n.lastModified = datetime(),
             n.userId = $userId
         RETURN s.id as conversationId, n.content as content, n.lastModified as lastModified`,
        {
          conversationId,
          content,
          userId
        }
      )

      if (result.records.length === 0) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      const record = result.records[0]

      return NextResponse.json({
        conversationId: record.get('conversationId'),
        content: record.get('content'),
        lastModified: record.get('lastModified').toISO(),
        success: true
      })
    } finally {
      await session.close()
    }
  } catch (error) {
    console.error('Error saving markdown:', error)
    return NextResponse.json({ error: 'Failed to save markdown' }, { status: 500 })
  }
}

// DELETE - Remove markdown content
export async function DELETE(request, { params }) {
  const { conversationId } = await params

  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = neo4jService.getSession()

    try {
      const result = await session.run(
        `MATCH (s:Session {id: $conversationId})-[:HAS_NOTES]->(n:MarkdownNote)
         DETACH DELETE n
         RETURN s.id as conversationId`,
        { conversationId }
      )

      if (result.records.length === 0) {
        return NextResponse.json({ error: 'Markdown note not found' }, { status: 404 })
      }

      return NextResponse.json({
        conversationId: result.records[0].get('conversationId'),
        success: true
      })
    } finally {
      await session.close()
    }
  } catch (error) {
    console.error('Error deleting markdown:', error)
    return NextResponse.json({ error: 'Failed to delete markdown' }, { status: 500 })
  }
}