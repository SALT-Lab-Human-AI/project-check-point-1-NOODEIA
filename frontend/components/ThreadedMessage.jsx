"use client"

import { useState } from 'react'
import { MessageCircle, Edit2, Trash2, MoreVertical } from 'lucide-react'

export default function ThreadedMessage({
  message,
  replies = [],
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onLoadReplies,
  depth = 0
}) {
  const [showReplies, setShowReplies] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [showMenu, setShowMenu] = useState(false)

  const isOwn = message.createdBy === currentUserId
  const isAI = message.isAI || message.createdBy === 'ai_assistant'

  const handleReply = async () => {
    if (!replyContent.trim()) return

    await onReply(message.id, replyContent)
    setReplyContent('')
    setIsReplying(false)

    if (!showReplies && replies.length === 0) {
      await handleLoadReplies()
    }
  }

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false)
      return
    }

    await onEdit(message.id, editContent)
    setIsEditing(false)
  }

  const handleLoadReplies = async () => {
    if (replies.length === 0) {
      await onLoadReplies(message.id)
    }
    setShowReplies(!showReplies)
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-zinc-200 pl-4 dark:border-zinc-700' : ''}`}>
      <div className="group relative mb-4">
        <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700" />

          <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
            <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
              <span className="font-medium">
                {isAI ? 'AI Assistant' : message.userEmail}
              </span>
              <span>{formatTime(message.createdAt)}</span>
              {message.edited && <span>(edited)</span>}
            </div>

            {isEditing ? (
              <div className="w-full">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 p-2 dark:border-zinc-700 dark:bg-zinc-800"
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
              <div
                className={`rounded-lg px-4 py-2 ${
                  isAI
                    ? 'bg-purple-100 text-purple-900 dark:bg-purple-900/20 dark:text-purple-200'
                    : isOwn
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            )}

            <div className="mt-1 flex items-center gap-2">
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <MessageCircle className="h-3 w-3" />
                Reply
              </button>

              {message.replyCount > 0 && (
                <button
                  onClick={handleLoadReplies}
                  className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"
                >
                  {showReplies ? 'Hide' : 'Show'} {message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}
                </button>
              )}

              {isOwn && !isEditing && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-5 z-10 rounded-lg bg-white shadow-lg dark:bg-zinc-800">
                      <button
                        onClick={() => {
                          setIsEditing(true)
                          setShowMenu(false)
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onDelete(message.id)
                          setShowMenu(false)
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {isReplying && (
          <div className="ml-11 mt-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Type your reply..."
              className="w-full rounded-lg border border-zinc-200 p-2 dark:border-zinc-700 dark:bg-zinc-800"
              rows={2}
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleReply}
                className="rounded-lg bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
              >
                Send Reply
              </button>
              <button
                onClick={() => {
                  setIsReplying(false)
                  setReplyContent('')
                }}
                className="rounded-lg bg-zinc-200 px-3 py-1 text-sm hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showReplies && replies.length > 0 && (
          <div className="mt-4">
            {replies.map((reply) => (
              <ThreadedMessage
                key={reply.id}
                message={reply}
                replies={reply.replies || []}
                currentUserId={currentUserId}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onLoadReplies={onLoadReplies}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}