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

// fetch TTS audio from backend and play
export async function text2audio(text) {
  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    // Clean up the previous audio URL
    if (currentAudio.src) {
      URL.revokeObjectURL(currentAudio.src)
    }
    currentAudio = null
  }

  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  if (!res.ok) {
    alert('TTS failed')
    return
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)

  // Store reference to current audio
  currentAudio = audio

  audio.play()

  // Clean up when audio ends
  audio.onended = () => {
    URL.revokeObjectURL(url)
    if (currentAudio === audio) {
      currentAudio = null
    }
  }

  // Also clean up on error
  audio.onerror = () => {
    URL.revokeObjectURL(url)
    if (currentAudio === audio) {
      currentAudio = null
    }
  }
}