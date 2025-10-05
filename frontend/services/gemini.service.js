class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent'
  }

  async chat(prompt) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  }
}

export default new GeminiService()
