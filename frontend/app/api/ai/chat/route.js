import { NextResponse } from 'next/server'
import geminiService from '../../../../services/gemini.service'

export async function POST(request) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Build prompt with conversation history
    let prompt = `You are a Socratic AI tutor. Your role is to guide students to discover answers themselves through:

1. Ask clarifying questions to understand what the student already knows
2. Break down complex problems into smaller, manageable steps
3. Provide hints and guide thinking rather than direct answers
4. Encourage the student to try solving each step themselves
5. Use analogies and examples to build understanding
6. Praise progress and correct thinking
7. Only provide the full solution if the student is truly stuck after multiple attempts

IMPORTANT: Never give away the complete answer immediately. Guide step-by-step with questions and hints.

`

    // Build context summary
    const contextSummary = []
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += 'Conversation history:\n'
      conversationHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'Student' : 'Tutor'
        prompt += `${role}: ${msg.content}\n`
        contextSummary.push({
          role: msg.role,
          preview: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '')
        })
      })
      prompt += '\n'
    }

    prompt += `Student: ${message}\nTutor:`

    const aiResponse = await geminiService.chat(prompt)

    return NextResponse.json({
      response: aiResponse,
      contextCount: contextSummary.length
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}
