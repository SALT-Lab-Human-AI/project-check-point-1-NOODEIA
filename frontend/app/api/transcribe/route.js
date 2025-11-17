import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
  try {
    // Check authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '').trim()

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get audio file from form data
    const formData = await req.formData()
    const audioFile = formData.get('audio')
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Create temporary file
    const filename = `audio_${Date.now()}_${Math.random().toString(36).slice(2)}.webm`
    const tempPath = path.join('/tmp', filename)

    // Convert File to Buffer and save
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.writeFile(tempPath, buffer)

    const scriptPath = path.join(process.cwd(), 'scripts', 'audio2text.py')

    // Call the Python script
    const transcribedText = await new Promise((resolve, reject) => {
      const pythonCmd = process.env.PYTHON_PATH || 'python3'
      const py = spawn(pythonCmd, [scriptPath, tempPath], {
        env: {
          ...process.env,
          GROQ_API_KEY: process.env.GROQ_API_KEY
        }
      })

      let stdout = ''
      let stderr = ''

      py.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      py.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      py.on('error', (error) => {
        reject(new Error(`Failed to spawn Python process: ${error.message}`))
      })

      py.on('close', async (code) => {
        if (code !== 0) {
          // Clean up on error
          await fs.unlink(tempPath).catch(() => {})
          reject(new Error(`Transcription failed: ${stderr || 'Unknown error'}`))
        } else {
          // Clean up after successful transcription
          await fs.unlink(tempPath).catch(() => {})
          resolve(stdout.trim())
        }
      })
    })

    return NextResponse.json({ text: transcribedText })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}

