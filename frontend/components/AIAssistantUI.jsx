
"use client"

import React, { useEffect, useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import ChatPane from "./ChatPane"

export default function AIAssistantUI() {
  // Initialize with light theme for consistent SSR
  const [theme, setTheme] = useState("light")
  const [isClient, setIsClient] = useState(false)
  const [userId, setUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Handle theme initialization after mount
  useEffect(() => {
    setIsClient(true)
    // Only access localStorage and matchMedia on client
    const saved = localStorage.getItem("theme")
    if (saved) {
      setTheme(saved)
    } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    document.documentElement.setAttribute("data-theme", theme)
    document.documentElement.style.colorScheme = theme
    
    // Only save to localStorage on client
    if (isClient) {
      localStorage.setItem("theme", theme)
    }
  }, [theme, isClient])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [isThinking, setIsThinking] = useState(false)

  // Initialize user and load conversations
  useEffect(() => {
    initializeUser()
  }, [])

  async function initializeUser() {
    try {
      const storedEmail = localStorage.getItem('userEmail')
      let email = storedEmail

      if (!email) {
        email = `user_${Math.random().toString(36).slice(2)}@demo.com`
        localStorage.setItem('userEmail', email)
      }

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        const user = await res.json()
        setUserId(user.id)
        await loadConversations(user.id)
      }
    } catch (error) {
      console.error('Failed to initialize user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadConversations(uid) {
    try {
      const res = await fetch(`/api/conversations?userId=${uid}`)
      if (res.ok) {
        const data = await res.json()
        if (data.length === 0) {
          createNewChat(uid)
        } else {
          setConversations(data)
          setSelectedId(data[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  // Keyboard shortcuts
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

  async function createNewChat(uid = userId) {
    if (!uid) return

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, title: 'New Chat' }),
      })

      if (res.ok) {
        const newConversation = await res.json()
        newConversation.messages = []
        setConversations(prev => [newConversation, ...prev])
        setSelectedId(newConversation.id)
        setSidebarOpen(false)
      }
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  async function sendMessage(convId, content) {
    if (!content.trim()) return

    const now = new Date().toISOString()
    const tempUserMsg = {
      id: 'temp_' + Math.random().toString(36).slice(2),
      role: "user",
      content,
      createdAt: now
    }

    // Optimistically update UI
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id !== convId) return conv
        const messages = [...(conv.messages || []), tempUserMsg]
        return {
          ...conv,
          messages,
          updatedAt: now,
          title: conv.messages.length === 0 ? content.slice(0, 30) + "..." : conv.title,
        }
      })
    )

    try {
      // Save to database
      const res = await fetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content }),
      })

      if (res.ok) {
        const savedMsg = await res.json()

        // Replace temp message with saved one
        setConversations(prev =>
          prev.map(conv => {
            if (conv.id !== convId) return conv
            const messages = conv.messages.map(m =>
              m.id === tempUserMsg.id ? savedMsg : m
            )
            return { ...conv, messages }
          })
        )

        // Simulate AI response
        setIsThinking(true)
        setTimeout(async () => {
          setIsThinking(false)
          const assistantContent = "I'll help you with that. This is a demo response to show the chat interface is working."

          const aiRes = await fetch(`/api/conversations/${convId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'assistant', content: assistantContent }),
          })

          if (aiRes.ok) {
            const assistantMsg = await aiRes.json()
            setConversations(prev =>
              prev.map(conv => {
                if (conv.id !== convId) return conv
                const messages = [...(conv.messages || []), assistantMsg]
                return {
                  ...conv,
                  messages,
                  updatedAt: new Date().toISOString(),
                }
              })
            )
          }
        }, 1500)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  function updateMessage(messageId, content) {
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id !== selectedId) return conv
        const messages = (conv.messages || []).map(msg =>
          msg.id === messageId ? { ...msg, content, updatedAt: new Date().toISOString() } : msg
        )
        return { ...conv, messages }
      })
    )
  }

  function resendMessage(messageId) {
    const conversation = conversations.find(c => c.id === selectedId)
    if (!conversation) return
    const message = (conversation.messages || []).find(m => m.id === messageId)
    if (!message) return
    sendMessage(conversation.id, message.content)
  }

  const selectedConversation = conversations.find(c => c.id === selectedId)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        setTheme={setTheme}
        conversations={conversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
        createNewChat={createNewChat}
      />

      <div className="flex flex-1 flex-col">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          createNewChat={createNewChat} 
        />
        <main className="flex flex-1 flex-col">
          <ChatPane
            conversation={selectedConversation}
            onSend={(text) => sendMessage(selectedConversation?.id, text)}
            onEditMessage={updateMessage}
            onResendMessage={resendMessage}
            isThinking={isThinking}
          />
        </main>
      </div>
    </div>
  )
}