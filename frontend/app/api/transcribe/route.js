import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'
export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    // Get audio file from form data
    const formData = await req.formData()
    const audioFile = formData.get('audio')
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured on the server' },
        { status: 500 }
      )
    }

    // Create temporary file
    const filename = `audio_${Date.now()}_${Math.random().toString(36).slice(2)}.webm`
    const tempPath = path.join('/tmp', filename)

    // Convert File to Buffer and save
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.writeFile(tempPath, buffer)

    const scriptPath = path.join(process.cwd(), 'scripts', 'audio2text.py')
    await fs
      .access(scriptPath)
      .catch(() => {
        throw new Error('audio2text.py script is missing in /scripts')
      })

    // Call the Python script
    const transcribedText = await new Promise((resolve, reject) => {
      const pythonCmd = process.env.PYTHON_PATH || 'python3'
      const py = spawn(pythonCmd, [scriptPath, tempPath], {
        env: {
          ...process.env,
          GROQ_API_KEY: groqApiKey
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

