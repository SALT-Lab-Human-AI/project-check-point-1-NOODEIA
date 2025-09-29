"use client"

import React from "react"
import { Plus, Moon, Sun, X } from "lucide-react"
import ConversationRow from "./ConversationRow"
import ThemeToggle from "./ThemeToggle"

export default function Sidebar({
  open,
  onClose,
  theme,
  setTheme,
  conversations = [],
  selectedId,
  onSelect,
  createNewChat,
}) {
  // Simple list of all conversations sorted by most recent
  const sortedConversations = [...conversations].sort((a, b) => 
    new Date(b.updatedAt) - new Date(a.updatedAt)
  )

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 transform bg-white transition-transform duration-300 ease-in-out dark:bg-zinc-950 lg:relative lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 dark:border-zinc-800">
            <h2 className="text-lg font-semibold">Chats</h2>
            <div className="flex items-center gap-2">
              <ThemeToggle theme={theme} setTheme={setTheme} />
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2">
            {sortedConversations.length > 0 ? (
              <div className="space-y-1">
                {sortedConversations.map((conversation) => (
                  <ConversationRow
                    key={conversation.id}
                    conversation={conversation}
                    selected={selectedId === conversation.id}
                    onSelect={() => {
                      onSelect(conversation.id)
                      onClose()
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                No conversations yet
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4 dark:border-zinc-800">
            <button
              onClick={createNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>
        </div>
      </div>
    </>
  )
}