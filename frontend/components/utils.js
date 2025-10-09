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

// Global variable to track currently playing speech synthesis
let currentSpeech = null

// Use browser's built-in Web Speech API for TTS (works on Vercel)
export async function text2audio(text) {
  // Check if browser supports speech synthesis
  if (!('speechSynthesis' in window)) {
    alert('Text-to-speech is not supported in your browser')
    return
  }

  // Stop any currently playing speech
  if (currentSpeech) {
    window.speechSynthesis.cancel()
    currentSpeech = null
  }

  // Create a new speech synthesis utterance
  const utterance = new SpeechSynthesisUtterance(text)

  // Configure voice settings
  utterance.rate = 1.0  // Speed (0.1 to 10)
  utterance.pitch = 1.0  // Pitch (0 to 2)
  utterance.volume = 1.0  // Volume (0 to 1)

  // Try to use a good English voice if available
  const voices = window.speechSynthesis.getVoices()
  const englishVoice = voices.find(voice =>
    voice.lang.startsWith('en') && voice.localService
  ) || voices.find(voice =>
    voice.lang.startsWith('en')
  )

  if (englishVoice) {
    utterance.voice = englishVoice
  }

  // Store reference to current speech
  currentSpeech = utterance

  // Handle speech end
  utterance.onend = () => {
    if (currentSpeech === utterance) {
      currentSpeech = null
    }
  }

  // Handle speech error
  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event.error)
    if (currentSpeech === utterance) {
      currentSpeech = null
    }
  }

  // Start speaking
  window.speechSynthesis.speak(utterance)
}