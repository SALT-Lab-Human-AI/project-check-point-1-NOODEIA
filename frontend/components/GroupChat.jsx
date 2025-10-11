"use client"

import { useState, useEffect, useRef } from 'react'
import { Send, Users, LogOut } from 'lucide-react'
import ThreadedMessage from './ThreadedMessage'
import ThreadPanel from './ThreadPanel'
import { getPusherClient, PUSHER_EVENTS } from '../lib/pusher'

export default function GroupChat({ groupId, groupData, currentUser, authToken, onLeaveGroup }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [sending, setSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const pusherRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const currentUserRef = useRef(currentUser)

  useEffect(() => {
    currentUserRef.current = currentUser
  }, [currentUser])

  useEffect(() => {
    loadMessages()
    setupPusher()

    return () => {
      if (pusherRef.current) {
        pusherRef.current.unsubscribe(`group-${groupId}`)
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [groupId])

  const setupPusher = () => {
    const pusher = getPusherClient()
    if (!pusher) return

    pusherRef.current = pusher

    const existingChannel = pusher.channel(`group-${groupId}`)
    if (existingChannel) {
      pusher.unsubscribe(`group-${groupId}`)
    }

    const channel = pusher.subscribe(`group-${groupId}`)

    channel.bind(PUSHER_EVENTS.MESSAGE_SENT, (data) => {
      if (!data.parentId) {
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.id === data.id)
          if (messageExists) return prev
          return [...prev, data]
        })
        scrollToBottom()
      } else {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === data.parentId
              ? { ...msg, replyCount: (msg.replyCount || 0) + 1 }
              : msg
          )
        )
      }
    })

    channel.bind(PUSHER_EVENTS.MESSAGE_EDITED, (data) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === data.messageId ? { ...msg, content: data.newContent, edited: true } : msg
        )
      )
    })

    channel.bind(PUSHER_EVENTS.MESSAGE_DELETED, (data) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId))
    })

    channel.bind(PUSHER_EVENTS.TYPING, (data) => {
      if (data.userId !== currentUserRef.current.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId)
          return [...filtered, data]
        })
      }
    })

    channel.bind(PUSHER_EVENTS.STOP_TYPING, (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
    })
  }

  const loadMessages = async (skip = 0) => {
    try {
      const response = await fetch(`/api/groupchat/${groupId}/messages?limit=50&skip=${skip}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Messages API error:', errorData)
        if (skip === 0) setMessages([])
        return
      }

      const data = await response.json()
      const messagesArray = Array.isArray(data) ? data : []
      const topLevelMessages = messagesArray.filter(msg => !msg.parentId)

      if (skip === 0) {
        // Initial load
        setMessages(topLevelMessages.reverse())
        scrollToBottom()
      } else {
        // Load more (prepend older messages)
        setMessages(prev => [...topLevelMessages.reverse(), ...prev])
      }

      // Check if there are more messages to load
      setHasMore(topLevelMessages.length === 50)
    } catch (error) {
      console.error('Failed to load messages:', error)
      if (skip === 0) setMessages([])
    } finally {
      if (skip === 0) {
        setLoading(false)
      } else {
        setLoadingMore(false)
      }
    }
  }

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    await loadMessages(messages.length)
  }

  // Detect scroll to top
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      if (container.scrollTop < 100 && hasMore && !loadingMore) {
        loadMoreMessages()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [hasMore, loadingMore, messages.length])

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    const messageContent = newMessage.trim()

    setNewMessage('')
    setSending(true)
    stopTyping()

    try {
      const response = await fetch(`/api/groupchat/${groupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ content: messageContent })
      })

      if (!response.ok) throw new Error('Failed to send message')

      await response.json()
      // Don't add locally - let Pusher handle it to avoid duplicates
      // The message will appear via Pusher event in real-time
      // Reply count will be updated automatically via Pusher when AI responds
    } catch (error) {
      console.error('Failed to send message:', error)
      setNewMessage(messageContent)
    } finally {
      setSending(false)
    }
  }


  const handleEdit = async (messageId, newContent) => {
    try {
      const response = await fetch(`/api/groupchat/${groupId}/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ content: newContent })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Edit API error:', errorData)
        throw new Error(`Failed to edit message: ${errorData.error || response.status}`)
      }

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, content: newContent, edited: true } : msg
        )
      )
    } catch (error) {
      console.error('Failed to edit message:', error)
      alert('Failed to edit message. Please try again.')
    }
  }

  const handleDelete = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const response = await fetch(`/api/groupchat/${groupId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to delete message: ${errorData.error || response.status}`)
      }

      setMessages(prev => prev.filter(msg => msg.id !== messageId))

      // Close thread panel if the deleted message is currently open
      if (selectedThread && selectedThread.id === messageId) {
        setSelectedThread(null)
      }
    } catch (error) {
      console.error('Failed to delete message:', error)
      alert('Failed to delete message. Please try again.')
    }
  }

  const handleTyping = () => {
    if (!pusherRef.current) return

    // Notify typing
    fetch('/api/pusher/typing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ groupId })
    })

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(stopTyping, 3000)
  }

  const stopTyping = () => {
    if (!pusherRef.current) return

    fetch('/api/pusher/typing/stop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ groupId })
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4 sm:px-6 dark:border-zinc-800">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-base sm:text-lg font-semibold truncate max-w-[150px] sm:max-w-none">{groupData.name}</h2>
          <span className="hidden sm:flex text-sm text-zinc-500 dark:text-zinc-400 items-center">
            <Users className="mr-1 h-4 w-4" />
            {groupData.members?.length || 0}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to leave this group chat?')) {
                onLeaveGroup(groupId)
              }
            }}
            className="rounded-lg p-2 hover:bg-red-100 dark:hover:bg-red-900/20"
            title="Leave Group"
          >
            <LogOut className="h-5 w-5 text-red-500" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center text-zinc-500 dark:text-zinc-400">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center text-zinc-500 dark:text-zinc-400">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {loadingMore && (
              <div className="flex items-center justify-center py-2 text-sm text-zinc-500 dark:text-zinc-400">
                Loading more messages...
              </div>
            )}
            {messages.map(message => (
              <ThreadedMessage
                key={message.id}
                message={message}
                currentUserId={currentUser.id}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onOpenThread={setSelectedThread}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}

        {typingUsers.length > 0 && (
          <div className="mt-4 text-sm italic text-zinc-500 dark:text-zinc-400">
            {typingUsers.map(u => u.userName).join(', ')}{' '}
            {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-3 sm:p-4 dark:border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 rounded-lg border border-zinc-200 px-3 sm:px-4 py-2 text-sm sm:text-base dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="rounded-lg bg-indigo-500 px-3 sm:px-4 py-2 text-white hover:bg-indigo-600 disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-700"
          >
            <Send className="h-4 sm:h-5 w-4 sm:w-5" />
          </button>
        </div>
      </div>

      {/* Thread Panel */}
      {selectedThread && (
        <ThreadPanel
          parentMessage={selectedThread}
          groupId={groupId}
          authToken={authToken}
          currentUser={currentUser}
          onClose={() => setSelectedThread(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}