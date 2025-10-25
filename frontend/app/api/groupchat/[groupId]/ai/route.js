import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import geminiService from '../../../../../services/gemini.service'
import groupChatService from '../../../../../services/groupchat.service'
import pusherService from '../../../../../services/pusher.service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request, { params }) {
  try {
    const startTime = Date.now()
    const { groupId } = await params
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { parentMessageId } = await request.json()

    if (!parentMessageId) {
      return NextResponse.json({ error: 'Parent message ID required' }, { status: 400 })
    }

    console.log('🤖 AI request started')

    // Get parent message directly (much faster than fetching all 50 messages)
    const t1 = Date.now()
    const parentMessage = await groupChatService.getMessage(parentMessageId, user.id)
    console.log(`🤖 Parent message fetched in ${Date.now() - t1}ms`)

    if (!parentMessage) {
      console.error('🤖 Parent message not found:', parentMessageId)
      return NextResponse.json({ error: 'Parent message not found' }, { status: 404 })
    }

    // Get thread messages to build context
    const t2 = Date.now()
    const threadMessages = await groupChatService.getThreadMessages(parentMessageId, user.id)
    console.log(`🤖 Thread messages fetched in ${Date.now() - t2}ms (${threadMessages.length} messages)`)

    // Build prompt with thread context
    const userName = parentMessage.userName || parentMessage.userEmail.split('@')[0]

    let prompt = `You are a Socratic AI tutor in a group chat. Your role is to guide students to discover answers themselves through:

    1. Ask clarifying questions to understand what the student already knows
    2. Break down complex problems into smaller, manageable steps
    3. Provide hints and guide thinking rather than direct answers
    4. Encourage the student to try solving each step themselves
    5. Use analogies and examples to build understanding
    6. Praise progress and correct thinking
    7. Only provide the full solution if the student is truly stuck after multiple attempts
    8. Elementary student words and sentences that they can understand
    9. Make sure to limit your response to 50 words or 2-3 sentences
    10. Only answer questions related to math or english, avoid sensitive or improper topics.

    IMPORTANT:
    - Never give away the complete answer immediately. Guide step-by-step with questions and hints.
    - Always start your response by greeting the user with "@${userName}, Hi!" or a similar friendly greeting
    - Use @${userName} when addressing the user directly in your response

    You were mentioned with @ai in this message:
    ${parentMessage.userName || parentMessage.userEmail}: ${parentMessage.content}

`

    if (threadMessages.length > 0) {
      prompt += `Thread context (previous messages in this conversation):\n`
      threadMessages.forEach(msg => {
        prompt += `${msg.userName || msg.userEmail}: ${msg.content}\n`
      })
      prompt += '\n'
    }

    prompt += `Remember to start with a greeting like "@${userName}, Hi!" and then respond with guiding questions and hints, not direct answers:`

    const t3 = Date.now()
    const aiResponse = await geminiService.chat(prompt)
    console.log(`🤖 Gemini API responded in ${Date.now() - t3}ms`)

    // Build response with visible thread context
    let responseWithContext = ''

    // Always show the parent message and any replies as context
    responseWithContext += `Thread context (previous messages in this conversation):\n`

    // Include the parent message first
    responseWithContext += `${parentMessage.userName || parentMessage.userEmail}: ${parentMessage.content}\n`

    // Then include any thread replies
    if (threadMessages.length > 0) {
      threadMessages.forEach(msg => {
        responseWithContext += `${msg.userName || msg.userEmail}: ${msg.content}\n`
      })
    }

    responseWithContext += '\n'
    responseWithContext += aiResponse

    // Create AI reply in the thread
    const t4 = Date.now()
    const aiMessage = await groupChatService.createMessage(
      groupId,
      'ai_assistant',
      responseWithContext,
      parentMessageId
    )
    console.log(`🤖 AI message created in Neo4j in ${Date.now() - t4}ms`)

    // Broadcast AI message via Pusher for real-time updates
    const t5 = Date.now()
    await pusherService.sendMessage(groupId, aiMessage)
    console.log(`🤖 Pusher broadcast completed in ${Date.now() - t5}ms`)

    console.log(`🤖 Total AI request time: ${Date.now() - startTime}ms`)

    return NextResponse.json(aiMessage)
  } catch (error) {
    console.error('Group chat AI error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}
