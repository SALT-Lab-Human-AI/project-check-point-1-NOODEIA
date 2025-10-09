import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const { text } = await req.json()
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }
    const filename = `tts_${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`
    const outPath = path.join('/tmp', filename)
    const scriptPath = path.join(process.cwd(), 'scripts', 'text2audio.py')

    // call the python script
    await new Promise((resolve, reject) => {
      const py = spawn('python3', [scriptPath, text, outPath])
      py.on('error', reject)
      py.stderr.on('data', (data) => {
      })
      py.on('close', (code) => {
        if (code === 0) resolve()
        else reject(new Error('Python script failed'))
      })
    })

    const audio = await fs.readFile(outPath)
    // delete temperary file
    await fs.unlink(outPath)

    return new Response(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="tts.mp3"',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
