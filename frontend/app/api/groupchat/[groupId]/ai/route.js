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

    // Get parent message directly (much faster than fetching all 50 messages)
    const parentMessage = await groupChatService.getMessage(parentMessageId, user.id)

    if (!parentMessage) {
      console.error('🤖 Parent message not found:', parentMessageId)
      return NextResponse.json({ error: 'Parent message not found' }, { status: 404 })
    }

    // Get thread messages to build context
    const threadMessages = await groupChatService.getThreadMessages(parentMessageId, user.id)

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

    const aiResponse = await geminiService.chat(prompt)

    // Build response with visible thread context
    let responseWithContext = ''

    if (threadMessages.length > 0) {
      responseWithContext += `Thread context (previous messages in this conversation):\n`
      threadMessages.forEach(msg => {
        responseWithContext += `${msg.userName || msg.userEmail}: ${msg.content}\n`
      })
      responseWithContext += '\n'
    }

    responseWithContext += aiResponse

    // Create AI reply in the thread
    const aiMessage = await groupChatService.createMessage(
      groupId,
      'ai_assistant',
      responseWithContext,
      parentMessageId
    )

    // Broadcast AI message via Pusher for real-time updates
    await pusherService.sendMessage(groupId, aiMessage)

    return NextResponse.json(aiMessage)
  } catch (error) {
    console.error('Group chat AI error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}
