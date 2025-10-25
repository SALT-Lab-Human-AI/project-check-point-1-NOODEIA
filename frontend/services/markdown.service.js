// Markdown Service for handling markdown operations

class MarkdownService {
  constructor() {
    this.baseUrl = '/api/markdown'
  }

  // Get authentication token
  getAuthToken() {
    // Try to get token from localStorage or from Supabase session
    const token = localStorage.getItem('auth_token')
    if (token) return token

    // Fallback to Supabase session if available
    const supabaseToken = localStorage.getItem('supabase.auth.token')
    return supabaseToken || ''
  }

  // Fetch markdown content for a conversation
  async getMarkdown(conversationId) {
    try {
      const response = await fetch(`${this.baseUrl}/${conversationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch markdown')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching markdown:', error)
      return {
        content: '',
        lastModified: null,
        error: error.message
      }
    }
  }

  // Save markdown content
  async saveMarkdown(conversationId, content, userId) {
    try {
      const response = await fetch(`${this.baseUrl}/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          content,
          userId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save markdown')
      }

      return await response.json()
    } catch (error) {
      console.error('Error saving markdown:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Delete markdown content
  async deleteMarkdown(conversationId) {
    try {
      const response = await fetch(`${this.baseUrl}/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete markdown')
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting markdown:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Generate mind map from markdown
  async generateMindMap(markdown, conversationId = null) {
    try {
      const response = await fetch(`${this.baseUrl}/mindmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          markdown,
          conversationId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate mind map')
      }

      return await response.json()
    } catch (error) {
      console.error('Error generating mind map:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get saved mind map
  async getMindMap(conversationId) {
    try {
      const response = await fetch(`${this.baseUrl}/mindmap?conversationId=${conversationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch mind map')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching mind map:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Export markdown as file
  exportMarkdown(content, filename = 'notes.md') {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Parse markdown to extract structure (headers, lists, etc.)
  parseMarkdownStructure(markdown) {
    const lines = markdown.split('\n')
    const structure = []
    let currentSection = null

    for (const line of lines) {
      // Check for headers
      const headerMatch = line.match(/^(#{1,6})\s+(.*)$/)
      if (headerMatch) {
        const level = headerMatch[1].length
        const text = headerMatch[2]

        currentSection = {
          type: 'header',
          level,
          text,
          content: []
        }
        structure.push(currentSection)
      }
      // Check for list items
      else if (line.match(/^[\*\-\+]\s+(.*)$/)) {
        const text = line.replace(/^[\*\-\+]\s+/, '')
        const item = {
          type: 'list-item',
          text
        }

        if (currentSection) {
          currentSection.content.push(item)
        } else {
          structure.push(item)
        }
      }
      // Regular paragraphs
      else if (line.trim()) {
        const item = {
          type: 'paragraph',
          text: line.trim()
        }

        if (currentSection) {
          currentSection.content.push(item)
        } else {
          structure.push(item)
        }
      }
    }

    return structure
  }

  // Generate summary from chat messages
  generateSummaryFromChat(messages) {
    if (!messages || messages.length === 0) {
      return '# Conversation Summary\n\nNo messages yet.'
    }

    let summary = '# Conversation Summary\n\n'
    summary += `**Date:** ${new Date().toLocaleDateString()}\n\n`
    summary += `**Messages:** ${messages.length}\n\n`

    summary += '## Key Points\n\n'

    // Extract key points from messages
    const keyPoints = []
    messages.forEach((msg, index) => {
      if (msg.role === 'user' && index === 0) {
        summary += `### Initial Question\n${msg.content}\n\n`
      } else if (msg.role === 'assistant') {
        // Extract first sentence or key insight from AI responses
        const firstSentence = msg.content.split(/[.!?]/)[0]
        if (firstSentence && firstSentence.length > 20) {
          keyPoints.push(firstSentence.trim())
        }
      }
    })

    if (keyPoints.length > 0) {
      summary += '### AI Insights\n'
      keyPoints.slice(0, 5).forEach(point => {
        summary += `* ${point}\n`
      })
    }

    summary += '\n## Notes\n\n'
    summary += '_Add your own notes here..._\n'

    return summary
  }
}

// Export singleton instance
export const markdownService = new MarkdownService()