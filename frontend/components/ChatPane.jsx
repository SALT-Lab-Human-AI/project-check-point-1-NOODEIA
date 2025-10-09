"use client"

import { useState, useRef } from "react"
import { Pencil, RefreshCw, Check, X } from "lucide-react"
import Message from "./Message"
import Composer from "./Composer"
import { timeAgo } from "./utils"

function ThinkingMessage() {
  return (
    <Message role="assistant">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
        </div>
        <span className="text-sm text-zinc-500">AI is thinking...</span>
      </div>
    </Message>
  )
}

export default function ChatPane({
  conversation,
  onSend,
  onEditMessage,
  onResendMessage,
  isThinking,
}) {
  const scrollRef = useRef(null)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState("")

  function startEdit(message) {
    setEditingId(message.id)
    setEditValue(message.content)
  }

  function saveEdit() {
    if (editValue.trim() && editingId) {
      onEditMessage(editingId, editValue)
      setEditingId(null)
      setEditValue("")
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setEditValue("")
  }

  const messages = conversation?.messages || []

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Welcome to AI Assistant
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Create a new chat to get started
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="mx-auto max-w-3xl space-y-3 sm:space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  Start a conversation
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Type your message below to begin
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="group relative">
                <Message role={message.role}>
                  {editingId === message.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        rows={4}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1 text-sm text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                          <Check className="h-3 w-3" /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        >
                          <X className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {message.content}
                      </div>
                      {message.role === "user" && (
                        <div className="mt-2 flex items-center gap-4 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => startEdit(message)}
                            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </button>
                          <button
                            onClick={() => onResendMessage(message.id)}
                            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          >
                            <RefreshCw className="h-3 w-3" /> Resend
                          </button>
                        </div>
                      )}
                      {message.createdAt && (
                        <div className="mt-1 text-xs text-zinc-400">
                          {timeAgo(message.createdAt)}
                        </div>
                      )}
                    </>
                  )}
                </Message>
              </div>
            ))
          )}
          {isThinking && <ThinkingMessage />}
        </div>
      </div>
      <Composer onSend={onSend} busy={isThinking} />
    </div>
  )
}