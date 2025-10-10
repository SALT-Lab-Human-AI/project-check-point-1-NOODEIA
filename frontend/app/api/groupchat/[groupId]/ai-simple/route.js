import { NextResponse } from 'next/server'
import neo4j from 'neo4j-driver'

const driver = neo4j.driver(
  process.env.NEXT_PUBLIC_NEO4J_URI,
  neo4j.auth.basic(
    process.env.NEXT_PUBLIC_NEO4J_USERNAME,
    process.env.NEXT_PUBLIC_NEO4J_PASSWORD
  ),
  { disableLosslessIntegers: true }
)

export async function POST(request, { params }) {
  const startTime = Date.now()
  const session = driver.session()

  try {
    const { groupId } = await params
    const { parentMessageId, userId, messageContent, userName } = await request.json()

    console.log('🤖 Simple AI endpoint called')

    // Simple prompt without fetching context (to avoid Neo4j slowness)
    const prompt = `You are a Socratic AI tutor. Guide with questions, not answers. Keep under 50 words.
Start with "@${userName}, Hi!"

Student asks: ${messageContent}

Respond with guiding questions to help them think:`

    // Call Gemini directly
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    if (!geminiResponse.ok) {
      throw new Error('Gemini API failed')
    }

    const geminiData = await geminiResponse.json()
    const aiText = geminiData.candidates[0].content.parts[0].text

    console.log(`🤖 Gemini responded in ${Date.now() - startTime}ms`)

    // Build response with context
    const responseText = `Thread context:\n${userName}: ${messageContent}\n\n${aiText}`

    // Create AI message directly in Neo4j (bypass service layer)
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const createResult = await session.run(
      `
      MATCH (g:GroupChat {id: $groupId})
      CREATE (m:Message {
        id: $messageId,
        content: $content,
        createdBy: 'ai_assistant',
        createdAt: datetime(),
        edited: false,
        parentId: $parentId
      })
      CREATE (g)-[:CONTAINS]->(m)
      WITH m
      OPTIONAL MATCH (parent:Message {id: $parentId})
      WHERE parent IS NOT NULL
      CREATE (m)-[:REPLY_TO]->(parent)
      RETURN m.id as id, m.content as content, m.createdAt as createdAt
      `,
      {
        groupId,
        messageId,
        content: responseText,
        parentId: parentMessageId
      }
    )

    console.log(`🤖 Message created in Neo4j in ${Date.now() - startTime}ms`)

    // Broadcast via Pusher
    const pusherResponse = await fetch('https://api-us2.pusher.com/apps/2059509/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PUSHER_SECRET}`
      },
      body: JSON.stringify({
        channels: [`group-${groupId}`],
        name: 'message-sent',
        data: JSON.stringify({
          id: messageId,
          content: responseText,
          createdBy: 'ai_assistant',
          userName: 'AI Assistant',
          userEmail: 'ai@assistant.com',
          createdAt: new Date().toISOString(),
          edited: false,
          parentId: parentMessageId,
          replyCount: 0
        })
      })
    })

    console.log(`🤖 Total time: ${Date.now() - startTime}ms`)

    return NextResponse.json({ success: true, messageId })
  } catch (error) {
    console.error('🤖 Simple AI error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    await session.close()
  }
}