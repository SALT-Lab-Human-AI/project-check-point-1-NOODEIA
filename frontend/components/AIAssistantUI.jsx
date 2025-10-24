"use client"

import { useEffect, useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import ChatPane from "./ChatPane"
import AuthForm from "./AuthForm"
import MarkdownPanel from "./MarkdownPanel"
import UserSettingsModal from "./UserSettingsModal"
import { supabase } from "../lib/supabase"
import { databaseAdapter } from "../lib/database-adapter"

export default function AIAssistantUI() {
  const [theme, setTheme] = useState("light")
  const [isClient, setIsClient] = useState(false)
  const [userId, setUserId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem("theme")
    if (saved) {
      setTheme(saved)
    } else {
      // Always default to light mode to show cream background
      setTheme("light")
    }
  }, [])

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    document.documentElement.setAttribute("data-theme", theme)
    document.documentElement.style.colorScheme = theme

    if (isClient) {
      localStorage.setItem("theme", theme)
    }
  }, [theme, isClient])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [isThinking, setIsThinking] = useState(false)
  const [markdownPanelOpen, setMarkdownPanelOpen] = useState(false)
  const [currentMarkdown, setCurrentMarkdown] = useState("")
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  useEffect(() => {
    // Add chat-interface class to html and body for proper styling
    document.documentElement.classList.add("chat-interface")
    document.body.classList.add("chat-interface")

    // Remove the classes when component unmounts
    return () => {
      document.documentElement.classList.remove("chat-interface")
      document.body.classList.remove("chat-interface")
    }
  }, [])

  useEffect(() => {
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!authChecked) return

      if (event === 'SIGNED_IN' && session) {
        const userData = await databaseAdapter.getUserById(session.user.id)
        if (userData) {
          handleAuthSuccess(userData)
        }
      } else if (event === 'SIGNED_OUT') {
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        const userData = await databaseAdapter.getUserById(session.user.id)
        if (userData) {
          await handleAuthSuccess(userData)
        } else {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
      setAuthChecked(true)
    } catch (error) {
      console.error('Failed to check auth:', error)
      setIsLoading(false)
      setAuthChecked(true)
    }
  }

  async function handleAuthSuccess(userData) {
    setCurrentUser(userData)
    setUserId(userData.id)
    setIsAuthenticated(true)
    setIsLoading(false)
    loadConversations(userData.id)
  }

  async function handleLogout() {
    setIsLoading(true)
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setCurrentUser(null)
    setUserId(null)
    setConversations([])
    setSelectedId(null)
    setIsLoading(false)
  }

  async function handleUpdateUser(updatedUser) {
    setCurrentUser(updatedUser)
  }

  async function loadConversations(uid) {
    try {
      const sessions = await databaseAdapter.getUserSessions(uid)

      if (!sessions || sessions.length === 0) {
        createNewChat()
      } else {
        const conversationsWithChats = await Promise.all(
          sessions.map(async (session) => {
            const chats = await databaseAdapter.getSessionChats(session.id)
            return {
              ...session,
              messages: chats || []
            }
          })
        )

        setConversations(conversationsWithChats)
        setSelectedId(conversationsWithChats[0].id)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  async function createNewChat() {
    if (!userId || !isAuthenticated) return

    try {
      const newSession = await databaseAdapter.createSession(userId, 'New Chat')
      const newConversation = { ...newSession, messages: [] }
      setConversations(prev => [newConversation, ...prev])
      setSelectedId(newConversation.id)
      setSidebarOpen(false)
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  async function renameConversation(convId, newTitle) {
    try {
      await databaseAdapter.updateSessionTitle(convId, newTitle)
      setConversations(prev =>
        prev.map(conv =>
          conv.id === convId ? { ...conv, title: newTitle } : conv
        )
      )
    } catch (error) {
      console.error('Failed to rename conversation:', error)
    }
  }

  async function deleteConversation(convId) {
    try {
      await databaseAdapter.deleteSession(convId)
      setConversations(prev => prev.filter(conv => conv.id !== convId))
      if (selectedId === convId) {
        setSelectedId(null)
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  async function sendMessage(convId, content) {
    if (!content.trim()) return

    const conversation = conversations.find(c => c.id === convId)
    const isFirstMessage = !conversation?.messages || conversation.messages.length === 0

    const now = new Date().toISOString()
    const tempUserMsg = {
      id: 'temp_' + Math.random().toString(36).slice(2),
      role: "user",
      content,
      created_at: now
    }

    // If this is the first message, auto-rename the conversation
    if (isFirstMessage) {
      const autoTitle = content.slice(0, 50) + (content.length > 50 ? '...' : '')
      await renameConversation(convId, autoTitle)
    }

    // Optimistically update UI
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id !== convId) return conv
        const messages = [...(conv.messages || []), tempUserMsg]
        return {
          ...conv,
          messages,
          updated_at: now,
          title: conv.messages.length === 0 ? content.slice(0, 30) + "..." : conv.title,
        }
      })
    )

    try {
      const savedMsg = await databaseAdapter.createChat(convId, 'user', content)

      // Replace temp message with saved one
      setConversations(prev =>
        prev.map(conv => {
          if (conv.id !== convId) return conv
          const messages = conv.messages.map(m =>
            m.id === tempUserMsg.id ? savedMsg : m
          )
          // Update title if first message
          const title = conv.messages.length === 0 ? content.slice(0, 30) + "..." : conv.title
          return { ...conv, messages, title }
        })
      )

      // Get AI response
      setIsThinking(true)
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            conversationHistory: conversation?.messages || []
          })
        })

        if (!response.ok) {
          throw new Error('Failed to get AI response')
        }

        const data = await response.json()
        const assistantContent = data.response

        // Create temporary AI message for immediate display
        const tempAiMsg = {
          id: 'temp_ai_' + Math.random().toString(36).slice(2),
          role: "assistant",
          content: assistantContent,
          created_at: new Date().toISOString()
        }

        // Show AI response immediately
        setIsThinking(false)
        setConversations(prev =>
          prev.map(conv => {
            if (conv.id !== convId) return conv
            const messages = [...(conv.messages || []), tempAiMsg]
            return {
              ...conv,
              messages,
              updated_at: new Date().toISOString(),
            }
          })
        )

        // Save to database in background and replace temp message
        const assistantMsg = await databaseAdapter.createChat(convId, 'assistant', assistantContent)

        if (assistantMsg) {
          setConversations(prev =>
            prev.map(conv => {
              if (conv.id !== convId) return conv
              const messages = conv.messages.map(m =>
                m.id === tempAiMsg.id ? assistantMsg : m
              )
              return {
                ...conv,
                messages,
                updated_at: new Date().toISOString(),
              }
            })
          )
        }
      } catch (aiError) {
        console.error('AI response error:', aiError)
        setIsThinking(false)
        // Show error message to user
        const errorMsg = await databaseAdapter.createChat(convId, 'assistant', 'Sorry, I encountered an error. Please try again.')
        if (errorMsg) {
          setConversations(prev =>
            prev.map(conv => {
              if (conv.id !== convId) return conv
              const messages = [...(conv.messages || []), errorMsg]
              return { ...conv, messages, updated_at: new Date().toISOString() }
            })
          )
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  async function updateMessage(messageId, content) {
    const conversation = conversations.find(c => c.id === selectedId)
    if (!conversation) return

    const messageIndex = conversation.messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return

    try {
      await databaseAdapter.updateChat(messageId, content)

      const messagesToDelete = conversation.messages.slice(messageIndex + 1)
      if (messagesToDelete.length > 0) {
        for (const msg of messagesToDelete) {
          await databaseAdapter.deleteChat(msg.id)
        }
      }

      setConversations(prev =>
        prev.map(conv => {
          if (conv.id !== selectedId) return conv
          const messages = conv.messages.slice(0, messageIndex + 1).map(msg =>
            msg.id === messageId ? { ...msg, content } : msg
          )
          return { ...conv, messages, updated_at: new Date().toISOString() }
        })
      )

      // Get AI response using real API
      setIsThinking(true)
      try {
        // Build the correct conversation history with the edited message
        const historyUpToEdit = conversation.messages.slice(0, messageIndex).map(msg => msg)

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            conversationHistory: historyUpToEdit // Send history before the edited message
          })
        })

        if (!response.ok) {
          throw new Error('Failed to get AI response')
        }

        const data = await response.json()
        const assistantContent = data.response

        // Create temporary AI message for immediate display
        const tempAiMsg = {
          id: 'temp_ai_' + Math.random().toString(36).slice(2),
          role: "assistant",
          content: assistantContent,
          created_at: new Date().toISOString()
        }

        // Show AI response immediately
        setIsThinking(false)
        setConversations(prev =>
          prev.map(conv => {
            if (conv.id !== conversation.id) return conv
            const messages = [...(conv.messages || []), tempAiMsg]
            return {
              ...conv,
              messages,
              updated_at: new Date().toISOString(),
            }
          })
        )

        // Save to database in background and replace temp message
        const assistantMsg = await databaseAdapter.createChat(conversation.id, 'assistant', assistantContent)

        if (assistantMsg) {
          setConversations(prev =>
            prev.map(conv => {
              if (conv.id !== conversation.id) return conv
              const messages = conv.messages.map(m =>
                m.id === tempAiMsg.id ? assistantMsg : m
              )
              return {
                ...conv,
                messages,
                updated_at: new Date().toISOString(),
              }
            })
          )
        }
      } catch (aiError) {
        console.error('AI response error:', aiError)
        setIsThinking(false)
        // Show error message
        const errorMsg = await databaseAdapter.createChat(conversation.id, 'assistant', 'Sorry, I encountered an error. Please try again.')
        if (errorMsg) {
          setConversations(prev =>
            prev.map(conv => {
              if (conv.id !== conversation.id) return conv
              const messages = [...(conv.messages || []), errorMsg]
              return { ...conv, messages, updated_at: new Date().toISOString() }
            })
          )
        }
      }
    } catch (error) {
      console.error('Failed to update message:', error)
    }
  }

  async function resendMessage(messageId) {
    const conversation = conversations.find(c => c.id === selectedId)
    if (!conversation) return
    const message = (conversation.messages || []).find(m => m.id === messageId)
    if (!message) return

    // Find the index of the message being resent
    const messageIndex = conversation.messages.findIndex(m => m.id === messageId)

    try {
      // Delete all messages after this one (including old AI responses)
      const messagesToDelete = conversation.messages.slice(messageIndex + 1)
      if (messagesToDelete.length > 0) {
        for (const msg of messagesToDelete) {
          await databaseAdapter.deleteChat(msg.id)
        }
      }

      // Update UI to keep messages up to and including the resent message
      setConversations(prev =>
        prev.map(conv => {
          if (conv.id !== conversation.id) return conv
          const messages = conv.messages.slice(0, messageIndex + 1)
          return { ...conv, messages, updated_at: new Date().toISOString() }
        })
      )

      // Get AI response using real API (same as edit, but without changing the original message)
      setIsThinking(true)

      try {
        // Build conversation history up to the resent message
        const historyUpToMessage = conversation.messages.slice(0, messageIndex)

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: message.content,
            conversationHistory: historyUpToMessage
          })
        })

        if (!response.ok) {
          throw new Error('Failed to get AI response')
        }

        const data = await response.json()
        const assistantContent = data.response

        // Create temporary AI message for immediate display
        const tempAiMsg = {
          id: 'temp_ai_' + Math.random().toString(36).slice(2),
          role: "assistant",
          content: assistantContent,
          created_at: new Date().toISOString()
        }

        // Show AI response immediately
        setIsThinking(false)
        setConversations(prev =>
          prev.map(conv => {
            if (conv.id !== conversation.id) return conv
            const messages = [...(conv.messages || []), tempAiMsg]
            return {
              ...conv,
              messages,
              updated_at: new Date().toISOString(),
            }
          })
        )

        // Save to database in background and replace temp message
        const assistantMsg = await databaseAdapter.createChat(conversation.id, 'assistant', assistantContent)

        if (assistantMsg) {
          setConversations(prev =>
            prev.map(conv => {
              if (conv.id !== conversation.id) return conv
              const messages = conv.messages.map(m =>
                m.id === tempAiMsg.id ? assistantMsg : m
              )
              return {
                ...conv,
                messages,
                updated_at: new Date().toISOString(),
              }
            })
          )
        }
      } catch (aiError) {
        console.error('AI response error:', aiError)
        setIsThinking(false)
        // Show error message
        const errorMsg = await databaseAdapter.createChat(conversation.id, 'assistant', 'Sorry, I encountered an error. Please try again.')
        if (errorMsg) {
          setConversations(prev =>
            prev.map(conv => {
              if (conv.id !== conversation.id) return conv
              const messages = [...(conv.messages || []), errorMsg]
              return { ...conv, messages, updated_at: new Date().toISOString() }
            })
          )
        }
      }
    } catch (error) {
      console.error('Failed to resend message:', error)
    }
  }

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
        event.preventDefault()
        createNewChat()
      }
      if (event.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [sidebarOpen])

  const selectedConversation = conversations.find(c => c.id === selectedId)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#FDFBD4' }}>
        <div className="text-zinc-600">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthForm onSuccess={handleAuthSuccess} />
  }

  return (
    <div className="flex h-screen text-zinc-900" style={{ backgroundColor: '#FDFBD4' }}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        setTheme={setTheme}
        conversations={conversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        createNewChat={createNewChat}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
      />

      <div className="flex flex-1 flex-col min-h-0 overflow-hidden" style={{ backgroundColor: '#FDFBD4' }}>
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
          onMarkdownClick={() => setMarkdownPanelOpen(true)}
          onSettingsClick={() => setSettingsModalOpen(true)}
        />
        <main className="flex flex-1 flex-col min-h-0 overflow-hidden" style={{ backgroundColor: '#FDFBD4' }}>
          <ChatPane
            conversation={selectedConversation}
            currentUser={currentUser}
            onSend={(text) => sendMessage(selectedConversation?.id, text)}
            onEditMessage={updateMessage}
            onResendMessage={resendMessage}
            isThinking={isThinking}
          />
        </main>
      </div>

      {/* Markdown Panel */}
      <MarkdownPanel
        isOpen={markdownPanelOpen}
        onClose={() => setMarkdownPanelOpen(false)}
        conversationId={selectedId}
        userId={userId}
        initialContent={currentMarkdown}
        onSave={(content) => setCurrentMarkdown(content)}
      />

      {/* User Settings Modal */}
      <UserSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  )
}
