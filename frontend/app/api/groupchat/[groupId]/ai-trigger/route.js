import { NextResponse } from 'next/server'
import geminiService from '../../../../../services/gemini.service'
import groupChatService from '../../../../../services/groupchat.service'
import pusherService from '../../../../../services/pusher.service'

export async function POST(request, { params }) {
  try {
    const { groupId } = await params
    const { parentMessageId, userId } = await request.json()

    console.log('🤖 AI trigger endpoint called:', { groupId, parentMessageId })

    // Get parent message
    const parentMessage = await groupChatService.getMessage(parentMessageId, userId)
    if (!parentMessage) {
      console.error('🤖 Parent message not found:', parentMessageId)
      return NextResponse.json({ error: 'Parent message not found' }, { status: 404 })
    }

    // Get thread messages
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

    return NextResponse.json({ success: true, messageId: aiMessage.id })
  } catch (error) {
    console.error('🤖 AI trigger error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process AI response' },
      { status: 500 }
    )
  }
}