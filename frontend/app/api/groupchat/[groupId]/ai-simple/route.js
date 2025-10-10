import { NextResponse } from 'next/server'
import neo4j from 'neo4j-driver'
import pusherService from '../../../../../services/pusher.service'

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

    // Fetch thread messages with optimized query
    const threadResult = await session.run(
      `
      MATCH (parent:Message {id: $parentMessageId})
      OPTIONAL MATCH (parent)<-[:REPLY_TO]-(reply:Message)
      OPTIONAL MATCH (author:User)-[:POSTED]->(reply)
      WITH parent, reply, author
      ORDER BY reply.createdAt ASC
      RETURN parent.content as parentContent,
             collect({
               content: reply.content,
               userName: coalesce(author.name, author.email)
             }) as replies
      `,
      { parentMessageId }
    )

    let threadContext = ''
    if (threadResult.records.length > 0) {
      const record = threadResult.records[0]
      const parentContent = record.get('parentContent')
      const replies = record.get('replies') || []

      threadContext = `${userName}: ${parentContent}\n`
      replies.forEach(reply => {
        if (reply.content && reply.userName) {
          threadContext += `${reply.userName}: ${reply.content}\n`
        }
      })
    }

    console.log(`🤖 Thread context loaded: ${threadContext.split('\n').length} messages`)

    // Build prompt with full thread context
    const prompt = `You are a Socratic AI tutor. Guide with questions, not answers. Keep under 50 words.
Start with "@${userName}, Hi!"

Thread conversation:
${threadContext}

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

    // Build response with full thread context
    const responseText = `Thread context (previous messages in this conversation):\n${threadContext}\n${aiText}`

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

    // Broadcast via Pusher using the service
    const aiMessage = {
      id: messageId,
      content: responseText,
      createdBy: 'ai_assistant',
      userName: 'AI Assistant',
      userEmail: 'ai@assistant.com',
      createdAt: new Date().toISOString(),
      edited: false,
      parentId: parentMessageId,
      replyCount: 0
    }

    await pusherService.sendMessage(groupId, aiMessage)
    console.log(`🤖 Pusher broadcast completed`)

    console.log(`🤖 Total time: ${Date.now() - startTime}ms`)

    return NextResponse.json({ success: true, messageId })
  } catch (error) {
    console.error('🤖 Simple AI error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    await session.close()
  }
}