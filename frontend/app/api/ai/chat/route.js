import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { neo4jService } from '../../../../lib/neo4j.js'

async function ensureEnvLoaded() {
  if (process.env.GEMINI_API_KEY) return
  try {
    const { config: loadEnv } = await import('dotenv')
    loadEnv({ path: path.join(process.cwd(), '.env.local'), override: false })
  } catch (err) {
    console.warn('[ACE Route] Failed to load .env.local:', err?.message || err)
  }
}

const SYSTEM_PROMPT = `You are a Socratic AI tutor. Your role is to guide students to discover answers themselves through progressive help:

TEACHING APPROACH:
1. Ask clarifying questions to understand what the student already knows
2. Break down complex problems into smaller, manageable steps
3. Provide hints and guide thinking rather than direct answers
4. Encourage the student to try solving each step themselves
5. Use analogies and examples to build understanding
6. Praise progress and correct thinking
7. Use elementary student words and sentences that they can understand
8. Make sure to limit your response to 50 words or 2-3 sentences
9. Only answer questions related to math or english, avoid sensitive or improper topics

PROGRESSIVE HELP RULES:
- Rounds 1-2: Ask guiding questions only (Socratic method)
- Round 3: Start giving direct, straightforward hints
- Rounds 4-6: Continue with clearer, more specific hints
- Round 7+: Provide the complete answer with full explanation

VALIDATION REQUESTS:
- When a student asks you to check if their answer is correct (e.g., "Is this right?", "Did I do it correctly?", "Can you check my answer?"):
  * ALWAYS tell them directly if they are CORRECT or INCORRECT
  * If CORRECT: Praise them and explain why it's right
  * If INCORRECT: Tell them what's wrong, then start helping them solve it step-by-step

IMPORTANT: Count the conversation turns to track which round you're in. Adjust your help level accordingly.`

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    await ensureEnvLoaded()

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '').trim()

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, conversationHistory, conversationId } = body || {}

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server' }, { status: 500 })
    }

    if (conversationId) {
      const session = neo4jService.getSession()
      try {
        const result = await session.run(
          `
          MATCH (u:User {id: $userId})-[:HAS]->(s:Session {id: $sessionId})
          RETURN s.id AS id
          `,
          { userId: user.id, sessionId: conversationId }
        )

        if (result.records.length === 0) {
          return NextResponse.json(
            { error: 'Conversation not found or unauthorized' },
            { status: 403 }
          )
        }
      } catch (dbError) {
        console.error('[ACE Route] Failed to verify conversation ownership:', dbError)
        return NextResponse.json(
          { error: 'Failed to verify conversation ownership' },
          { status: 500 }
        )
      } finally {
        await session.close()
      }
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
    const scratch = {
      learner_id: user.id,
      conversation_id: conversationId ?? null
    }

    const scriptPath = path.join(process.cwd(), 'scripts', 'run_ace_agent.py')
    const scriptCwd = path.join(process.cwd(), 'scripts')
    const pythonPathParts = [scriptCwd]
    if (process.env.PYTHONPATH) {
      pythonPathParts.push(process.env.PYTHONPATH)
    }

    const childEnv = {
      ...process.env,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GEMINI_MODEL: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
      ACE_LLM_TEMPERATURE: process.env.ACE_LLM_TEMPERATURE ?? '0.2',
      PYTHONPATH: pythonPathParts.join(path.delimiter)
    }

    const stdout = await new Promise((resolve, reject) => {
      // Use custom Python path if provided, otherwise default to 'python3'
      const pythonCmd = process.env.PYTHON_PATH || 'python3'
      const py = spawn(pythonCmd, [scriptPath], {
        cwd: scriptCwd,
        env: childEnv
      })

      let out = ''
      let err = ''

      py.stdout.on('data', (data) => {
        out += data.toString()
      })

      py.stderr.on('data', (data) => {
        const text = data.toString()
        err += text
        // Surface ACE runner logs in the Next.js console for visibility
        process.stderr.write(text)
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

      const threadId = conversationId ? `ace-thread-${conversationId}` : undefined
      const payload = { messages, scratch }
      if (threadId) {
        payload.thread_id = threadId
      }
      py.stdin.write(JSON.stringify(payload))
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
        scratch: parsed.scratch,
        conversationId: conversationId ?? null,
        userId: user.id
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
