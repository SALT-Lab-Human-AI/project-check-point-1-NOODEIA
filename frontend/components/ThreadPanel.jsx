"use client"

import { useState, useEffect, useRef } from 'react'
import { X, Send } from 'lucide-react'
import ThreadedMessage from './ThreadedMessage'
import { getPusherClient, PUSHER_EVENTS } from '../lib/pusher'

export default function ThreadPanel({
  parentMessage,
  groupId,
  authToken,
  currentUser,
  onClose,
  onEdit,
  onDelete
}) {
  const [replies, setReplies] = useState([])
  const [replyContent, setReplyContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const repliesEndRef = useRef(null)
  const pusherRef = useRef(null)

  useEffect(() => {
    loadReplies()
    setupPusher()

    return () => {
      // Don't unsubscribe - the channel is shared with GroupChat
      // Just unbind this component's event handlers
      if (pusherRef.current) {
        const channel = pusherRef.current.channel(`group-${groupId}`)
        if (channel) {
          channel.unbind(PUSHER_EVENTS.MESSAGE_SENT)
          channel.unbind(PUSHER_EVENTS.MESSAGE_EDITED)
          channel.unbind(PUSHER_EVENTS.MESSAGE_DELETED)
        }
      }
    }
  }, [parentMessage.id])

  const setupPusher = () => {
    const pusher = getPusherClient()
    if (!pusher) return

    pusherRef.current = pusher

    // Get or subscribe to the channel (don't unsubscribe, it's shared with GroupChat)
    let channel = pusher.channel(`group-${groupId}`)
    if (!channel) {
      channel = pusher.subscribe(`group-${groupId}`)
    }

    // Listen for new messages in this thread
    channel.bind(PUSHER_EVENTS.MESSAGE_SENT, (data) => {
      // Only add if it's a reply to our parent message
      if (data.parentId === parentMessage.id) {
        // Check if message already exists (avoid duplicates for own messages)
        setReplies(prev => {
          const messageExists = prev.some(msg => msg.id === data.id)
          if (messageExists) {
            return prev
          }
          return [...prev, data]
        })
        scrollToBottom()
      }
    })

    // Listen for edited messages in this thread
    channel.bind(PUSHER_EVENTS.MESSAGE_EDITED, (data) => {
      setReplies(prev =>
        prev.map(msg =>
          msg.id === data.messageId ? { ...msg, content: data.newContent, edited: true } : msg
        )
      )
    })

    // Listen for deleted messages in this thread
    channel.bind(PUSHER_EVENTS.MESSAGE_DELETED, (data) => {
      setReplies(prev => prev.filter(msg => msg.id !== data.messageId))
    })
  }

  const loadReplies = async () => {
    try {
      const response = await fetch(`/api/groupchat/${groupId}/messages/${parentMessage.id}/thread`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })

      if (!response.ok) throw new Error('Failed to load thread')

      const data = await response.json()
      setReplies(data)
    } catch (error) {
      console.error('Failed to load thread:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendReply = async () => {
    if (!replyContent.trim() || sending) return

    const content = replyContent.trim()
    setReplyContent('')
    setSending(true)

    try {
      const response = await fetch(`/api/groupchat/${groupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ content, parentMessageId: parentMessage.id })
      })

      if (!response.ok) throw new Error('Failed to send reply')

      await response.json()
      // Don't add locally - let Pusher handle it to avoid duplicates
      // The reply will appear via Pusher event in real-time
    } catch (error) {
      console.error('Failed to send reply:', error)
      setReplyContent(content)
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'Now'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Now'

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={onClose} />

      <div className="fixed right-0 top-0 z-50 flex h-screen w-full sm:w-96 flex-col border-l bg-white dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b px-4 dark:border-zinc-800">
          <h3 className="text-sm font-semibold">Thread</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Parent Message */}
        <div className="border-b p-4 dark:border-zinc-800">
          <div className="flex gap-3">
            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {parentMessage.userName || parentMessage.userEmail}
                </span>
                <span>{formatTime(parentMessage.createdAt)}</span>
              </div>
              <div className="text-sm text-zinc-900 dark:text-zinc-100">
                <p className="whitespace-pre-wrap">{parentMessage.content}</p>
              </div>
              <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center text-zinc-500 dark:text-zinc-400">
            Loading replies...
          </div>
        ) : replies.length === 0 ? (
          <div className="flex items-center justify-center text-zinc-500 dark:text-zinc-400">
            No replies yet. Start the conversation!
          </div>
        ) : (
          <>
            {replies.map((reply) => (
              <ThreadedMessage
                key={reply.id}
                message={reply}
                currentUserId={currentUser.id}
                onEdit={onEdit}
                onDelete={(id) => {
                  onDelete(id)
                  setReplies(prev => prev.filter(r => r.id !== id))
                }}
                onOpenThread={() => {}}
                isInThread={true}
              />
            ))}
            <div ref={repliesEndRef} />
          </>
        )}
      </div>

        {/* Reply Input */}
        <div className="border-t p-3 sm:p-4 dark:border-zinc-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendReply()
                }
              }}
              placeholder="Reply to thread..."
              disabled={sending}
              className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              onClick={sendReply}
              disabled={!replyContent.trim() || sending}
              className="rounded-lg bg-indigo-500 px-3 py-2 text-white hover:bg-indigo-600 disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
