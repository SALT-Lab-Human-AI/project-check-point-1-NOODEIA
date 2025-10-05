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
  const [sending, setSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const messagesEndRef = useRef(null)
  const pusherRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    loadMessages()
    setupPusher()

    return () => {
      if (pusherRef.current) {
        pusherRef.current.unsubscribe(`group-${groupId}`)
        pusherRef.current.disconnect()
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

    const channel = pusher.subscribe(`group-${groupId}`)

    channel.bind(PUSHER_EVENTS.MESSAGE_SENT, (data) => {
      // Only add to main channel if it's not a thread reply
      if (data.createdBy !== currentUser.id && !data.parentId) {
        setMessages(prev => [...prev, data])
        scrollToBottom()
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
      if (data.userId !== currentUser.id) {
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

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/groupchat/${groupId}/messages`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })

      console.log('Load messages response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Messages API error:', errorData)
        // Don't throw, just set empty messages
        setMessages([])
        return
      }

      const data = await response.json()
      console.log('Loaded messages:', data)
      // Ensure data is an array before reversing
      const messagesArray = Array.isArray(data) ? data : []
      // Filter out thread replies - only show top-level messages in main channel
      const topLevelMessages = messagesArray.filter(msg => !msg.parentId)
      setMessages(topLevelMessages.reverse())
      scrollToBottom()
    } catch (error) {
      console.error('Failed to load messages:', error)
      setMessages([]) // Set empty messages on error
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    const messageContent = newMessage.trim()
    const hasAiMention = messageContent.includes('@ai')

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

      const newMsg = await response.json()
      setMessages(prev => [...prev, newMsg])
      scrollToBottom()

      // If @ai was mentioned, trigger AI response
      if (hasAiMention) {
        try {
          const aiResponse = await fetch(`/api/groupchat/${groupId}/ai`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify({ parentMessageId: newMsg.id })
          })

          if (aiResponse.ok) {
            await aiResponse.json()
            // Update message with AI reply count
            setMessages(prev =>
              prev.map(msg =>
                msg.id === newMsg.id
                  ? { ...msg, replyCount: (msg.replyCount || 0) + 1 }
                  : msg
              )
            )
          }
        } catch (aiError) {
          console.error('AI response error:', aiError)
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setNewMessage(messageContent) // Restore message on error
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
      <div className="flex h-14 items-center justify-between border-b px-6 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{groupData.name}</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            <Users className="mr-1 inline h-4 w-4" />
            {groupData.members?.length || 0} members
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
      <div className="flex-1 overflow-y-auto p-6">
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
            {typingUsers.map(u => u.userEmail).join(', ')}{' '}
            {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4 dark:border-zinc-800">
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
            className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-700"
          >
            <Send className="h-5 w-5" />
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