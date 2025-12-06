import { NextResponse } from 'next/server'
import { neo4jService } from '../../../../lib/neo4j'

// POST - Generate mind map from markdown
export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { markdown, conversationId } = await request.json()

    if (!markdown) {
      return NextResponse.json({ error: 'Markdown content is required' }, { status: 400 })
    }

    // Parse markdown to create a hierarchical structure for mind map
    const mindMapData = parseMarkdownToMindMap(markdown)

    // Optionally save the mind map structure to Neo4j
    if (conversationId) {
      const session = neo4jService.getSession()

      try {
        await session.run(
          `MATCH (s:Session {id: $conversationId})
           MERGE (s)-[:HAS_MINDMAP]->(m:MindMap)
           SET m.data = $data,
               m.lastGenerated = datetime(),
               m.markdown = $markdown
           RETURN m`,
          {
            conversationId,
            data: JSON.stringify(mindMapData),
            markdown
          }
        )
      } finally {
        await session.close()
      }
    }

    return NextResponse.json({
      mindmap: mindMapData,
      success: true
    })
  } catch (error) {
    console.error('Error generating mind map:', error)
    return NextResponse.json({ error: 'Failed to generate mind map' }, { status: 500 })
  }
}

// Helper function to parse markdown into mind map structure
function parseMarkdownToMindMap(markdown) {
  const lines = markdown.split('\n')
  const root = {
    name: 'Root',
    children: []
  }

  const stack = [{ node: root, level: -1 }]

  for (const line of lines) {
    if (!line.trim()) continue

    // Check for headers
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headerMatch) {
      const level = headerMatch[1].length
      const text = headerMatch[2]

      const newNode = {
        name: text,
        children: []
      }

      // Find the correct parent based on level
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop()
      }

      stack[stack.length - 1].node.children.push(newNode)
      stack.push({ node: newNode, level })
    }
    // Check for list items
    else if (line.match(/^[\*\-\+]\s+(.*)$/)) {
      const text = line.replace(/^[\*\-\+]\s+/, '')
      const level = (line.match(/^\s*/)[0].length / 2) + 10 // Offset list items

      const newNode = {
        name: text,
        children: []
      }

      // Find the correct parent
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop()
      }

      stack[stack.length - 1].node.children.push(newNode)
      stack.push({ node: newNode, level })
    }
    // Regular text as leaf nodes
    else if (line.trim() && stack.length > 1) {
      const currentNode = stack[stack.length - 1].node
      if (!currentNode.description) {
        currentNode.description = line.trim()
      } else {
        currentNode.description += ' ' + line.trim()
      }
    }
  }

  // If root has only one child, make that child the root
  if (root.children.length === 1) {
    return root.children[0]
  }

  return root
}

// GET - Retrieve saved mind map
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
    }

    const session = neo4jService.getSession()

    try {
      const result = await session.run(
        `MATCH (s:Session {id: $conversationId})-[:HAS_MINDMAP]->(m:MindMap)
         RETURN m.data as data, m.lastGenerated as lastGenerated, m.markdown as markdown`,
        { conversationId }
      )

      if (result.records.length === 0) {
        return NextResponse.json({ error: 'Mind map not found' }, { status: 404 })
      }

      const record = result.records[0]

      return NextResponse.json({
        mindmap: JSON.parse(record.get('data')),
        lastGenerated: record.get('lastGenerated')?.toISO(),
        markdown: record.get('markdown'),
        success: true
      })
    } finally {
      await session.close()
    }
  } catch (error) {
    console.error('Error fetching mind map:', error)
    return NextResponse.json({ error: 'Failed to fetch mind map' }, { status: 500 })
  }
}