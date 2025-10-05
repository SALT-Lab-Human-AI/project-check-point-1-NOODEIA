import { NextResponse } from 'next/server'
import geminiService from '../../../../services/gemini.service'

export async function POST(request) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Build prompt with conversation history
    let prompt = 'You are a helpful AI tutor. Help the student learn and understand concepts.\n\n'

    if (conversationHistory && conversationHistory.length > 0) {
      prompt += 'Conversation history:\n'
      conversationHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'Student' : 'Tutor'
        prompt += `${role}: ${msg.content}\n`
      })
      prompt += '\n'
    }

    prompt += `Student: ${message}\nTutor:`

    const response = await geminiService.chat(prompt)

    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}
