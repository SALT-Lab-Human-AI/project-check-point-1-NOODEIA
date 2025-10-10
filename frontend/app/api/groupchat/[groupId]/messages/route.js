import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import groupChatService from '../../../../../services/groupchat.service'
import pusherService from '../../../../../services/pusher.service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Helper function to process AI response inline
async function processAIResponse(groupId, parentMessageId, userId) {
  console.log('🤖 Processing AI response:', { groupId, parentMessageId })

  try {
    // Import services
    const geminiService = (await import('../../../../../services/gemini.service')).default
    const groupChatService = (await import('../../../../../services/groupchat.service')).default
    const pusherService = (await import('../../../../../services/pusher.service')).default

    // Get parent message
    const parentMessage = await groupChatService.getMessage(parentMessageId, userId)
    if (!parentMessage) {
      console.error('🤖 Parent message not found:', parentMessageId)
      return
    }

    // Get thread messages to build context
    const threadMessages = await groupChatService.getThreadMessages(parentMessageId, userId)

    // Build prompt
    const userName = parentMessage.userName || parentMessage.userEmail.split('@')[0]

    let prompt = `You are a Socratic AI tutor in a group chat. Guide students to discover answers through questions and hints.
    Keep responses under 50 words. Start with "@${userName}, Hi!" greeting.

    Message: ${parentMessage.userName || parentMessage.userEmail}: ${parentMessage.content}`

    if (threadMessages.length > 0) {
      prompt += '\nThread context:\n'
      threadMessages.forEach(msg => {
        prompt += `${msg.userName || msg.userEmail}: ${msg.content}\n`
      })
    }

    prompt += `\nRespond with guiding questions, not direct answers:`

    // Call Gemini API
    console.log('🤖 Calling Gemini API...')
    const aiResponse = await geminiService.chat(prompt)
    console.log('🤖 Gemini responded')

    // Build response with context
    let responseWithContext = `Thread context (previous messages in this conversation):\n`
    responseWithContext += `${parentMessage.userName || parentMessage.userEmail}: ${parentMessage.content}\n`

    if (threadMessages.length > 0) {
      threadMessages.forEach(msg => {
        responseWithContext += `${msg.userName || msg.userEmail}: ${msg.content}\n`
      })
    }

    responseWithContext += '\n' + aiResponse

    // Create AI message
    const aiMessage = await groupChatService.createMessage(
      groupId,
      'ai_assistant',
      responseWithContext,
      parentMessageId
    )

    // Broadcast via Pusher
    await pusherService.sendMessage(groupId, aiMessage)
    console.log('🤖 AI response sent via Pusher')

    return aiMessage
  } catch (error) {
    console.error('🤖 AI processing error:', error)
    console.error('🤖 Error stack:', error.stack)
  }
}

export async function GET(request, { params }) {
  try {
    // Await params as required in Next.js 15
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

    const { searchParams } = new URL(request.url)
    // Convert to integers to avoid Neo4j float error
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const skip = parseInt(searchParams.get('skip') || '0', 10)

    const messages = await groupChatService.getMessages(
      groupId,
      user.id,
      limit,
      skip
    )

    if (!messages) {
      return NextResponse.json([])
    }

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    // Await params as required in Next.js 15
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

    const body = await request.json()
    const { content, parentMessageId } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    const message = await groupChatService.createMessage(
      groupId,
      user.id,
      content,
      parentMessageId
    )

    if (message.error) {
      return NextResponse.json({ error: message.error }, { status: 400 })
    }

    await pusherService.sendMessage(groupId, message)

    // Check if message contains @ai mention
    console.log('📝 Message content:', content)
    console.log('📝 Contains @ai?', content.includes('@ai'))

    if (content.includes('@ai')) {
      console.log('🤖 @ai detected, processing AI response...')

      // Process AI response asynchronously but don't wait for it
      // This allows the user message to return quickly
      processAIResponse(groupId, parentMessageId || message.id, user.id)
        .then(() => console.log('🤖 AI processing completed'))
        .catch(err => console.error('🤖 AI processing error:', err))
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}