import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

const SYSTEM_PROMPT = `You are a Socratic AI tutor. Your role is to guide students to discover answers themselves through:

1. Ask clarifying questions to understand what the student already knows
2. Break down complex problems into smaller, manageable steps
3. Provide hints and guide thinking rather than direct answers
4. Encourage the student to try solving each step themselves
5. Use analogies and examples to build understanding
6. Praise progress and correct thinking
7. Only provide the full solution if the student is truly stuck after multiple attempts
8. Elementary student words and sentences that they can understand
9. Make sure to limit your response to 50 words or 2-3 sentences
10. Only answer questions related to math or english, avoid sensitive or improper topics.

IMPORTANT: Never give away the complete answer immediately. Guide step-by-step with questions and hints.`

export async function POST(request) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const contextSummary = []
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      }
    ]

    if (Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg) => {
        if (!msg || typeof msg.content !== 'string' || !msg.role) return
        messages.push({
          role: msg.role,
          content: msg.content
        })
        contextSummary.push({
          role: msg.role,
          preview: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '')
        })
      })
    }

    messages.push({
      role: 'user',
      content: message
    })

    const scriptPath = path.join(process.cwd(), 'scripts', 'run_ace_agent.py')
    const scriptCwd = path.join(process.cwd(), 'scripts')
    const pythonPathParts = [scriptCwd]
    if (process.env.PYTHONPATH) {
      pythonPathParts.push(process.env.PYTHONPATH)
    }

    const stdout = await new Promise((resolve, reject) => {
      const py = spawn('python3', [scriptPath], {
        cwd: scriptCwd,
        env: {
          ...process.env,
          PYTHONPATH: pythonPathParts.join(path.delimiter)
        }
      })

      let out = ''
      let err = ''

      py.stdout.on('data', (data) => {
        out += data.toString()
      })

      py.stderr.on('data', (data) => {
        err += data.toString()
      })

      py.on('error', (spawnError) => reject(spawnError))

      py.on('close', (code) => {
        if (code !== 0) {
          const errorMessage = (err || out || `ACE agent exited with code ${code}`).trim()
          let parsed
          try {
            parsed = JSON.parse(errorMessage)
          } catch {
            parsed = null
          }
          if (parsed && typeof parsed === 'object') {
            const errorObj = new Error(parsed.error || 'ACE agent failed')
            errorObj.details = parsed
            return reject(errorObj)
          }
          return reject(new Error(errorMessage))
        }
        return resolve(out)
      })

      py.stdin.write(JSON.stringify({ messages }))
      py.stdin.end()
    })

    const parsed = JSON.parse(stdout)
    if (parsed.error) {
      const err = new Error(parsed.error)
      err.details = parsed
      throw err
    }

    return NextResponse.json({
      response: parsed.answer,
      contextCount: contextSummary.length,
      metadata: {
        mode: parsed.mode,
        scratch: parsed.scratch
      }
    })
  } catch (error) {
    console.error('ACE chat error:', error)
    const payload = {
      error: error?.details?.error || error.message || 'Failed to generate AI response',
      metadata: error?.details || null
    }
    return NextResponse.json(
      payload,
      { status: 500 }
    )
  }
}
