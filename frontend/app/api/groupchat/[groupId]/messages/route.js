import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import groupChatService from '../../../../../services/groupchat.service'
import pusherService from '../../../../../services/pusher.service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)


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
      console.log('🤖 @ai detected, using simple AI endpoint')

      const baseUrl = process.env.NODE_ENV === 'production' ? 'https://noodeia.vercel.app' : 'http://localhost:3001'
      const aiUrl = `${baseUrl}/api/groupchat/${groupId}/ai-simple`

      console.log('🤖 Calling AI URL:', aiUrl)

      // Call the simplified AI endpoint that avoids slow Neo4j queries
      fetch(aiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentMessageId: parentMessageId || message.id,
          userId: user.id,
          messageContent: content,
          userName: message.userName || user.email.split('@')[0]
        })
      })
      .then(res => console.log('🤖 Simple AI response:', res.status))
      .catch(err => console.error('🤖 Simple AI error:', err))

      /* DISABLED - Too slow on Vercel (48+ seconds for context loading)
      console.log('🤖 @ai detected, processing inline')

      // Process AI response inline with timeout protection
      const processAI = async () => {
        try {
          const startTime = Date.now()

          // Import services
          const [gemini, groupChat, pusher] = await Promise.all([
            import('../../../../../services/gemini.service'),
            import('../../../../../services/groupchat.service'),
            import('../../../../../services/pusher.service')
          ])

          const geminiService = gemini.default
          const groupChatService = groupChat.default
          const pusherService = pusher.default

          console.log(`🤖 Services imported in ${Date.now() - startTime}ms`)

          // Get parent message with timeout
          const contextStart = Date.now()
          const parentMessage = await Promise.race([
            groupChatService.getMessage(parentMessageId || message.id, user.id),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Context timeout')), 5000)
            )
          ])

          if (!parentMessage) {
            console.error('🤖 Parent message not found')
            return
          }

          console.log(`🤖 Parent message loaded in ${Date.now() - contextStart}ms`)

          // Get thread context with timeout - limit to 5 messages for speed
          let threadMessages = []
          try {
            threadMessages = await Promise.race([
              groupChatService.getThreadMessages(parentMessageId || message.id, user.id),
              new Promise((resolve) => setTimeout(() => resolve([]), 3000)) // Return empty if slow
            ])

            // Limit to 5 most recent messages for performance
            threadMessages = threadMessages.slice(0, 5)
          } catch (err) {
            console.log('🤖 Thread context skipped (timeout)')
            threadMessages = []
          }

          console.log(`🤖 Context loaded in ${Date.now() - startTime}ms`)

          // Build prompt
          const userName = parentMessage.userName || parentMessage.userEmail.split('@')[0]
          let prompt = `You are a Socratic AI tutor. Guide with questions, not answers. Keep under 50 words.
Start with "@${userName}, Hi!"

Message: ${parentMessage.content}`

          if (threadMessages.length > 0) {
            prompt += '\nPrevious messages:\n'
            threadMessages.forEach(msg => {
              prompt += `${msg.userName || msg.userEmail}: ${msg.content}\n`
            })
          }

          // Call Gemini with timeout
          const geminiStart = Date.now()
          const aiResponse = await Promise.race([
            geminiService.chat(prompt),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Gemini timeout')), 15000)
            )
          ])
          console.log(`🤖 Gemini responded in ${Date.now() - geminiStart}ms`)

          // Build response
          let responseText = `Thread context:\n${parentMessage.userName || parentMessage.userEmail}: ${parentMessage.content}\n`

          if (threadMessages.length > 0) {
            threadMessages.forEach(msg => {
              responseText += `${msg.userName || msg.userEmail}: ${msg.content}\n`
            })
          }

          responseText += '\n' + aiResponse

          // Create AI message
          const aiMessage = await groupChatService.createMessage(
            groupId,
            'ai_assistant',
            responseText,
            parentMessageId || message.id
          )

          // Send via Pusher
          await pusherService.sendMessage(groupId, aiMessage)
          console.log(`🤖 AI complete in ${Date.now() - startTime}ms`)

        } catch (error) {
          console.error('🤖 AI error:', error.message)
        }
      }

      // Don't wait for AI processing
      processAI().catch(err => console.error('🤖 Background AI error:', err))
      */
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