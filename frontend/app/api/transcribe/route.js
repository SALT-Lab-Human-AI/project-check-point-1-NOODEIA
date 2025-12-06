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

    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server' },
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
    console.log(`[TRANSCRIBE] Looking for script at: ${scriptPath}`)
    console.log(`[TRANSCRIBE] process.cwd(): ${process.cwd()}`)
    
    try {
      await fs.access(scriptPath)
      const stats = await fs.stat(scriptPath)
      console.log(`[TRANSCRIBE] Script found. Size: ${stats.size} bytes`)
    } catch (err) {
      console.error(`[TRANSCRIBE] Script access error:`, err)
      throw new Error(`audio2text.py script is missing at ${scriptPath}`)
    }

    // Call the Python script
    const transcribedText = await new Promise((resolve, reject) => {
      const pythonCmd = process.env.PYTHON_PATH || 'python3'
      console.log(`[TRANSCRIBE] Executing: ${pythonCmd} ${scriptPath} ${tempPath}`)
      console.log(`[TRANSCRIBE] Script exists: ${scriptPath}`)
      console.log(`[TRANSCRIBE] Temp file exists: ${tempPath}`)
      
      const py = spawn(pythonCmd, [scriptPath, tempPath], {
        env: {
          ...process.env,
          GEMINI_API_KEY: geminiApiKey
        }
      })

      let stdout = ''
      let stderr = ''

      py.stdout.on('data', (data) => {
        const output = data.toString()
        console.log(`[TRANSCRIBE STDOUT]: ${output}`)
        stdout += output
      })

      py.stderr.on('data', (data) => {
        const output = data.toString()
        console.error(`[TRANSCRIBE STDERR]: ${output}`)
        stderr += output
      })

      py.on('error', (error) => {
        console.error(`[TRANSCRIBE] Spawn error:`, error)
        reject(new Error(`Failed to spawn Python process: ${error.message}. Command: ${pythonCmd} ${scriptPath}`))
      })

      py.on('close', async (code) => {
        console.log(`[TRANSCRIBE] Process exited with code: ${code}`)
        console.log(`[TRANSCRIBE] STDOUT: ${stdout}`)
        console.log(`[TRANSCRIBE] STDERR: ${stderr}`)
        
        if (code !== 0) {
          // Clean up on error
          await fs.unlink(tempPath).catch(() => {})
          reject(new Error(`Transcription failed (exit code ${code}): ${stderr || 'Unknown error'}`))
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

