"use client"

import { useState } from 'react'
import { text2audio, extractTextFromReactNode } from "./utils"
import { MessageCircle, Edit2, Trash2, MoreVertical, Volume2 } from 'lucide-react'
import UserAvatar from './UserAvatar'

export default function ThreadedMessage({
  message,
  currentUserId,
  onEdit,
  onDelete,
  onOpenThread,
  isInThread = false,
  currentUser
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [showMenu, setShowMenu] = useState(false)

  const isOwn = message.createdBy === currentUserId
  const isAI = message.isAI || message.createdBy === 'ai_assistant'
  const [playing, setPlaying] = useState(false)

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false)
      return
    }

    await onEdit(message.id, editContent)
    setIsEditing(false)
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'Now'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Now'

    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="group relative mb-2 rounded-lg p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
      <div className="flex gap-3">
        <UserAvatar
          user={
            isAI
              ? { id: 'ai_assistant', isAI: true }
              : isOwn && currentUser
              ? currentUser
              : {
                  id: message.createdBy,
                  name: message.userName,
                  email: message.userEmail
                }
          }
          size="md"
        />

        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {isAI ? 'AI Assistant' : (message.userName || message.userEmail)}
            </span>
            <span>{formatTime(message.createdAt)}</span>
            {message.edited && <span>(edited)</span>}
          </div>

          {isEditing ? (
            <div className="w-full">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 p-2 dark:border-zinc-700 bg-white/50 dark:bg-black/20"
                rows={3}
                autoFocus
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleEdit}
                  className="rounded-lg bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(message.content)
                  }}
                  className="rounded-lg bg-zinc-200 px-3 py-1 text-sm hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
                {message.content}
              </div>

              {/* Play button for AI messages - inside message content area */}
              {isAI && !isEditing && (
                <div className="mt-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={async () => {
                      setPlaying(true)
                      try {
                        const text = extractTextFromReactNode(message.content)
                        await text2audio(text)
                      } finally {
                        setPlaying(false)
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-50"
                    disabled={playing}
                    title="Play AI's response"
                  >
                    <Volume2 className="h-3 w-3" />
                    {playing ? 'Playing...' : 'Play'}
                  </button>
                </div>
              )}

              <div className="mt-2 flex items-center gap-3">
                {!isInThread && (
                  <button
                    onClick={() => onOpenThread(message)}
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                  >
                    <MessageCircle className="h-3 w-3" />
                    {message.replyCount > 0 ? `${message.replyCount} ${message.replyCount === 1 ? 'reply' : 'replies'}` : 'Reply'}
                  </button>
                )}

                {/* Edit/Delete menu for own messages */}
                {isOwn && !isEditing && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </button>

                    {showMenu && (
                      <div className="absolute left-0 top-5 z-10 w-32 rounded-lg border bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                        <button
                          onClick={() => {
                            setIsEditing(true)
                            setShowMenu(false)
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onDelete(message.id)
                            setShowMenu(false)
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
