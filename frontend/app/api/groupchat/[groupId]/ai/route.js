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

    // Build prompt with thread context
    let prompt = `You are an AI assistant in a group chat. You were mentioned with @ai in this message:\n\n`
    prompt += `${parentMessage.userName || parentMessage.userEmail}: ${parentMessage.content}\n\n`

    if (threadMessages.length > 0) {
      prompt += `Thread context:\n`
      threadMessages.forEach(msg => {
        prompt += `${msg.userName || msg.userEmail}: ${msg.content}\n`
      })
      prompt += '\n'
    }

    prompt += `Provide a helpful, contextual response to the question or topic.`

    const aiResponse = await geminiService.chat(prompt)

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
