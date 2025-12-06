// Extract text from React node (string, number, array, element)
export function extractTextFromReactNode(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractTextFromReactNode).join(' ')
  if (node && typeof node === 'object' && node.props && node.props.children)
    return extractTextFromReactNode(node.props.children)
  return ''
}
export const cls = (...c) => c.filter(Boolean).join(" ");

export function timeAgo(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const sec = Math.max(1, Math.floor((now - d) / 1000));
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const ranges = [
    [60, "seconds"], [3600, "minutes"], [86400, "hours"],
    [604800, "days"], [2629800, "weeks"], [31557600, "months"],
  ];
  let unit = "years";
  let value = -Math.floor(sec / 31557600);
  for (const [limit, u] of ranges) {
    if (sec < limit) {
      unit = u;
      const div =
        unit === "seconds" ? 1 :
        limit / (unit === "minutes" ? 60 :
        unit === "hours" ? 3600 :
        unit === "days" ? 86400 :
        unit === "weeks" ? 604800 : 2629800);
      value = -Math.floor(sec / div);
      break;
    }
  }
  return rtf.format(value, unit);
}

// Global variable to track currently playing audio
let currentAudio = null

// Simple TTS using gTTS via text2audio.py
export async function text2audio(text) {
  try {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }

    // Try gTTS API first
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)

        // Create and play audio
        const audio = new Audio(audioUrl)
        currentAudio = audio

        // Clean up after playing
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          if (currentAudio === audio) {
            currentAudio = null
          }
        }

        audio.onerror = (error) => {
          console.error('Audio playback error:', error)
          URL.revokeObjectURL(audioUrl)
          // Fallback to browser TTS
          useBrowserTTS(text)
        }

        await audio.play()
        return
      }
    } catch (error) {
      console.warn('gTTS failed, falling back to browser TTS:', error)
    }

    // Fallback to browser's built-in Web Speech API
    useBrowserTTS(text)
  } catch (error) {
    console.error('TTS error:', error)
    alert('Failed to play audio. Please try again.')
  }
}

// Fallback browser TTS function
function useBrowserTTS(text) {
  if (!('speechSynthesis' in window)) {
    alert('Text-to-speech is not supported in your browser')
    return
  }

  // Stop any currently playing speech
  window.speechSynthesis.cancel()

  // Create speech utterance
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1.0
  utterance.pitch = 1.0
  utterance.volume = 1.0

  // Try to use a good English voice
  const voices = window.speechSynthesis.getVoices()
  const englishVoice = voices.find(voice =>
    voice.lang.startsWith('en') && voice.localService
  ) || voices.find(voice =>
    voice.lang.startsWith('en')
  )

  if (englishVoice) {
    utterance.voice = englishVoice
  }

  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event.error)
  }

  window.speechSynthesis.speak(utterance)
}