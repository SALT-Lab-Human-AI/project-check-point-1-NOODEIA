import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

/**
 * Advanced TTS using Bark for voice cloning
 * Supports:
 * - Voice presets (different speakers)
 * - Custom voice profiles
 * - Emotional tone control
 * - Multi-language support
 */
export async function POST(request) {
  try {
    const {
      text,
      voice = 'v2/en_speaker_6',  // Default friendly voice
      temperature = 0.7,            // Controls randomness
      useGTTS = false               // Fallback to gTTS if true
    } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Create temp directory
    const tempDir = path.join(process.cwd(), 'temp')
    try {
      await fs.mkdir(tempDir, { recursive: true })
    } catch (err) {
      // Directory exists
    }

    const filename = `tts_${Date.now()}.wav`
    const filepath = path.join(tempDir, filename)

    try {
      if (useGTTS) {
        // Fallback to simple gTTS
        await useGTTS(text, filepath)
      } else {
        // Use Bark for high-quality voice cloning
        await useBark(text, filepath, voice, temperature)
      }

      // Read the audio file
      const audioBuffer = await fs.readFile(filepath)

      // Clean up
      await fs.unlink(filepath)

      // Return audio
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/wav',
          'Content-Length': audioBuffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000',
        },
      })
    } catch (error) {
      console.error('Audio generation error:', error)

      // If Bark fails, try gTTS as fallback
      if (!useGTTS) {
        console.log('Falling back to gTTS...')
        return POST({
          json: async () => ({ text, useGTTS: true })
        })
      }

      throw error
    }
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error.message },
      { status: 500 }
    )
  }
}

async function useBark(text, filepath, voice, temperature) {
  // Python script for Bark TTS
  const pythonScript = `
import sys
import os
os.environ['SUNO_USE_SMALL_MODELS'] = 'True'  # Use small models for faster generation

from bark import SAMPLE_RATE, generate_audio, preload_models
from scipy.io.wavfile import write as write_wav
import numpy as np

# Preload models
preload_models()

text = sys.argv[1]
filepath = sys.argv[2]
voice_preset = sys.argv[3]
temperature = float(sys.argv[4])

# Generate audio
audio_array = generate_audio(
    text,
    history_prompt=voice_preset,
    text_temp=temperature,
    waveform_temp=temperature
)

# Save to file
write_wav(filepath, SAMPLE_RATE, audio_array)

print(f"Audio generated: {filepath}")
`

  const scriptPath = path.join(process.cwd(), 'temp', 'bark_script.py')
  await fs.writeFile(scriptPath, pythonScript)

  try {
    console.log(`Generating audio with Bark: voice=${voice}, temp=${temperature}`)

    const { stdout, stderr } = await execAsync(
      `python3 "${scriptPath}" "${text.replace(/"/g, '\\"')}" "${filepath}" "${voice}" "${temperature}"`,
      { timeout: 60000 } // 60 second timeout
    )

    if (stdout) console.log('Bark output:', stdout)
    if (stderr) console.warn('Bark warnings:', stderr)
  } finally {
    // Clean up script
    try {
      await fs.unlink(scriptPath)
    } catch (err) {
      // Ignore
    }
  }
}

async function useGTTS(text, filepath) {
  // Simple gTTS fallback
  const pythonScript = `
from gtts import gTTS
import sys

text = sys.argv[1]
filepath = sys.argv[2]

tts = gTTS(text=text, lang='en', slow=False)
tts.save(filepath)
`

  const scriptPath = path.join(process.cwd(), 'temp', 'gtts_script.py')
  await fs.writeFile(scriptPath, pythonScript)

  try {
    await execAsync(
      `python3 "${scriptPath}" "${text.replace(/"/g, '\\"')}" "${filepath}"`
    )
  } finally {
    try {
      await fs.unlink(scriptPath)
    } catch (err) {
      // Ignore
    }
  }
}

/**
 * GET endpoint to list available voice presets
 */
export async function GET() {
  const voices = {
    friendly: [
      'v2/en_speaker_6',
      'v2/en_speaker_9',
    ],
    professional: [
      'v2/en_speaker_0',
      'v2/en_speaker_1',
    ],
    energetic: [
      'v2/en_speaker_3',
      'v2/en_speaker_7',
    ],
    calm: [
      'v2/en_speaker_2',
      'v2/en_speaker_8',
    ]
  }

  return NextResponse.json({
    voices,
    default: 'v2/en_speaker_6',
    note: 'Bark supports voice cloning. You can also provide custom voice prompts.'
  })
}
