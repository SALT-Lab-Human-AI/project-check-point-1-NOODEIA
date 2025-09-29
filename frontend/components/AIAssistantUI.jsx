"use client"

import React, { useEffect, useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import ChatPane from "./ChatPane"
import { supabase } from "../lib/supabase"

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

      // Check if user exists or create new one
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      let user
      if (!existingUser) {
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([{
            email,
            name: email.split('@')[0]
          }])
          .select()
          .single()

        if (error) {
          console.error('Error creating user:', error)
          setIsLoading(false)
          return
        }
        user = newUser
      } else {
        user = existingUser
      }

      setUserId(user.id)
      await loadConversations(user.id)
    } catch (error) {
      console.error('Failed to initialize user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadConversations(uid) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, messages(*)')
        .eq('user_id', uid)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error loading conversations:', error)
        return
      }

      if (!data || data.length === 0) {
        createNewChat(uid)
      } else {
        // Sort messages by created_at for each conversation
        const conversationsWithSortedMessages = data.map(conv => ({
          ...conv,
          messages: conv.messages.sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
          )
        }))
        setConversations(conversationsWithSortedMessages)
        setSelectedId(conversationsWithSortedMessages[0].id)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  async function createNewChat(uid = userId) {
    if (!uid) return

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          user_id: uid,
          title: 'New Chat'
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating conversation:', error)
        return
      }

      const newConversation = { ...data, messages: [] }
      setConversations(prev => [newConversation, ...prev])
      setSelectedId(newConversation.id)
      setSidebarOpen(false)
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
      created_at: now
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
      // Save user message to Supabase
      const { data: savedMsg, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: convId,
          role: 'user',
          content
        }])
        .select()
        .single()

      if (error) {
        console.error('Error saving message:', error)
        return
      }

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

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: now })
        .eq('id', convId)

      // Simulate AI response
      setIsThinking(true)
      setTimeout(async () => {
        setIsThinking(false)
        const assistantContent = "I'll help you with that. This is a demo response to show the chat interface is working."

        const { data: assistantMsg, error: aiError } = await supabase
          .from('messages')
          .insert([{
            conversation_id: convId,
            role: 'assistant',
            content: assistantContent
          }])
          .select()
          .single()

        if (!aiError && assistantMsg) {
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

    // Find the message and its index
    const messageIndex = conversation.messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return

    // Update the message in database
    const { error: updateError } = await supabase
      .from('messages')
      .update({ content })
      .eq('id', messageId)

    if (updateError) {
      console.error('Failed to update message:', updateError)
      return
    }

    // Remove all messages after this one (they will be regenerated)
    const messagesToDelete = conversation.messages.slice(messageIndex + 1).map(m => m.id)

    if (messagesToDelete.length > 0) {
      await supabase
        .from('messages')
        .delete()
        .in('id', messagesToDelete)
    }

    // Update local state
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id !== selectedId) return conv
        const messages = conv.messages.slice(0, messageIndex + 1).map(msg =>
          msg.id === messageId ? { ...msg, content } : msg
        )
        return { ...conv, messages }
      })
    )

    // Regenerate AI response
    await getAIResponse(conversation.id, content)
  }

  function resendMessage(messageId) {
    const conversation = conversations.find(c => c.id === selectedId)
    if (!conversation) return
    const message = (conversation.messages || []).find(m => m.id === messageId)
    if (!message) return
    sendMessage(conversation.id, message.content)
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