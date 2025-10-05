import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import geminiService from '../../../../../services/gemini.service'
import groupChatService from '../../../../../services/groupchat.service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request, { params }) {
  try {
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

    // Get thread messages to build context
    const threadMessages = await groupChatService.getThreadMessages(parentMessageId, user.id)

    // Get parent message
    const messages = await groupChatService.getMessages(groupId, user.id, 50, 0)
    const parentMessage = messages.find(m => m.id === parentMessageId)

    if (!parentMessage) {
      return NextResponse.json({ error: 'Parent message not found' }, { status: 404 })
    }

    console.log('=== AI Context Debug ===')
    console.log('Parent Message:', {
      id: parentMessage.id,
      content: parentMessage.content,
      userName: parentMessage.userName,
      userEmail: parentMessage.userEmail,
      createdAt: parentMessage.createdAt
    })
    console.log('Thread Messages Count:', threadMessages.length)
    console.log('Thread Messages:', threadMessages.map(msg => ({
      id: msg.id,
      content: msg.content,
      userName: msg.userName,
      userEmail: msg.userEmail,
      createdAt: msg.createdAt,
      isAI: msg.isAI
    })))
    console.log('======================')

    // Build prompt with thread context
    let prompt = `You are a Socratic AI tutor in a group chat. Your role is to guide students to discover answers themselves through:

1. Ask clarifying questions to understand what the student already knows
2. Break down complex problems into smaller, manageable steps
3. Provide hints and guide thinking rather than direct answers
4. Encourage the student to try solving each step themselves
5. Use analogies and examples to build understanding
6. Praise progress and correct thinking
7. Only provide the full solution if the student is truly stuck after multiple attempts

IMPORTANT: Never give away the complete answer immediately. Guide step-by-step with questions and hints.

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

    prompt += `Respond with guiding questions and hints, not direct answers:`

    console.log('=== Full Prompt Sent to AI ===')
    console.log(prompt)
    console.log('==============================')

    const aiResponse = await geminiService.chat(prompt)

    console.log('=== AI Response ===')
    console.log(aiResponse)
    console.log('===================')

    // Create AI reply in the thread
    const aiMessage = await groupChatService.createMessage(
      groupId,
      'ai_assistant',
      aiResponse,
      parentMessageId
    )

    return NextResponse.json(aiMessage)
  } catch (error) {
    console.error('Group chat AI error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}
