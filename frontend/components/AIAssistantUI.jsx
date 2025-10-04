"use client"

import React, { useEffect, useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import ChatPane from "./ChatPane"
import AuthForm from "./AuthForm"
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
    } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
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
      // Save user message to Neo4j
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

      // Simulate AI response
      setIsThinking(true)
      setTimeout(async () => {
        setIsThinking(false)
        const assistantContent = "I'll help you with that. This is a demo response to show the chat interface is working."

        const assistantMsg = await databaseAdapter.createChat(convId, 'assistant', assistantContent)

        if (assistantMsg) {
          setConversations(prev =>
            prev.map(conv => {
              if (conv.id !== convId) return conv
              const messages = [...(conv.messages || []), assistantMsg]
              return {
                ...conv,
                messages,
                updated_at: new Date().toISOString(),
              }
            })
          )
        }
      }, 1500)
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

      setIsThinking(true)
      setTimeout(async () => {
        setIsThinking(false)
        const assistantContent = "I'll help you with that. This is a demo response to show the chat interface is working."

        const assistantMsg = await databaseAdapter.createChat(conversation.id, 'assistant', assistantContent)

        if (assistantMsg) {
          setConversations(prev =>
            prev.map(conv => {
              if (conv.id !== conversation.id) return conv
              const messages = [...(conv.messages || []), assistantMsg]
              return {
                ...conv,
                messages,
                updated_at: new Date().toISOString(),
              }
            })
          )
        }
      }, 1500)
    } catch (error) {
      console.error('Failed to update message:', error)
    }
  }

  function resendMessage(messageId) {
    const conversation = conversations.find(c => c.id === selectedId)
    if (!conversation) return
    const message = (conversation.messages || []).find(m => m.id === messageId)
    if (!message) return
    sendMessage(conversation.id, message.content)
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
      <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthForm onSuccess={handleAuthSuccess} />
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
        onRenameConversation={renameConversation}
      />

      <div className="flex flex-1 flex-col">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
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
