import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import groupChatService from '../../../../../services/groupchat.service'
import pusherService from '../../../../../services/pusher.service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Helper function to trigger AI response asynchronously
async function triggerAIResponse(groupId, parentMessageId, authHeader) {
  try {
    const { POST: handleAI } = await import('../ai/route')

    const aiRequest = new Request('http://localhost/api/groupchat/' + groupId + '/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({ parentMessageId })
    })

    await handleAI(aiRequest, { params: Promise.resolve({ groupId }) })
  } catch (error) {
    console.error('🤖 AI response error:', error)
    throw error
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

    // Check if message contains @ai mention and trigger AI response asynchronously
    // Works for both main channel messages and replies
    if (content.includes('@ai')) {
      // Fire-and-forget: Process AI response without blocking
      triggerAIResponse(groupId, parentMessageId || message.id, authHeader).catch(err => {
        console.error('🤖 Background AI error:', err)
      })
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