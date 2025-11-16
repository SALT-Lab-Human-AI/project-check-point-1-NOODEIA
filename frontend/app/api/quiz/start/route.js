import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Generate random math question (3rd/4th grade level)
function generateQuestion() {
  const operations = ['+', '-', '×', '÷']
  const op = operations[Math.floor(Math.random() * operations.length)]

  let num1, num2, answer

  switch (op) {
    case '+':
      // 1st/2nd grade: addition (0-200)
      num1 = Math.floor(Math.random() * 201)
      num2 = Math.floor(Math.random() * 201)
      answer = num1 + num2
      break
    case '-':
      // 1st/2nd grade: subtraction (0-200)
      num1 = Math.floor(Math.random() * 201)
      num2 = Math.floor(Math.random() * (num1 + 1))
      answer = num1 - num2
      break
    case '×':
      // 1st/2nd grade: multiplication up to 15x15
      num1 = Math.floor(Math.random() * 15) + 1
      num2 = Math.floor(Math.random() * 15) + 1
      answer = num1 * num2
      break
    case '÷':
      // 1st/2nd grade: division up to 15, whole number results
      num2 = Math.floor(Math.random() * 14) + 2
      answer = Math.floor(Math.random() * 15) + 1
      num1 = num2 * answer
      break
    default:
      num1 = 1
      num2 = 1
      answer = 2
  }

  // Generate wrong options with appropriate range based on answer size
  const options = [answer]
  const variance = answer > 100 ? 50 : 20
  while (options.length < 4) {
    const wrong = answer + (Math.floor(Math.random() * (variance * 2)) - variance)
    if (wrong > 0 && !options.includes(wrong)) {
      options.push(wrong)
    }
  }

  // Shuffle options using Fisher-Yates algorithm
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]]
  }

  return {
    question: `${num1} ${op} ${num2}`,
    answer,
    options
  }
}

// POST /api/quiz/start
// Body: { userId }
// Response: { sessionId, questions }
export async function POST(request) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Generate 5 questions
    const questions = Array.from({ length: 5 }, () => generateQuestion())

    // Create session ID
    const sessionId = uuidv4()

    return NextResponse.json({
      sessionId,
      questions: questions.map(q => ({
        question: q.question,
        options: q.options,
        // Don't send answer to client - keep it server-side for validation
      })),
      // Store answers for validation (in production, use session storage or database)
      _answers: questions.map(q => q.answer) // Temporary - will validate on submit
    }, { status: 200 })

  } catch (error) {
    console.error('Quiz start error:', error)
    return NextResponse.json(
      { error: 'Failed to start quiz' },
      { status: 500 }
    )
  }
}
