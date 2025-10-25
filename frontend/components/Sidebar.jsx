"use client"

import { useState } from "react"
import { Plus, X, PanelLeftClose, PanelLeftOpen, Edit2, Check, MessageSquare, Users, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
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
  onRenameConversation,
  onDeleteConversation,
}) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState("")

  const sortedConversations = [...conversations].sort((a, b) =>
    new Date(b.updatedAt) - new Date(a.updatedAt)
  )

  const handleStartEdit = (conversation) => {
    setEditingId(conversation.id)
    setEditTitle(conversation.title || "New Chat")
  }

  const handleSaveEdit = () => {
    if (onRenameConversation && editingId) {
      onRenameConversation(editingId, editTitle)
    }
    setEditingId(null)
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform bg-sidebar-cream transition-all duration-300 ease-in-out dark:bg-sidebar-dark lg:relative lg:translate-x-0 ${
          collapsed ? "lg:w-16" : "lg:w-80"
        } ${
          open ? "translate-x-0 w-80" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b px-4 dark:border-zinc-800">
            {!collapsed && <h2 className="text-lg font-semibold">Chats</h2>}
            <div className="flex items-center gap-2">
              {!collapsed && <ThemeToggle theme={theme} setTheme={setTheme} />}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden rounded-xl p-2 glass-icon-button lg:block"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={onClose}
                className="rounded-xl p-2 glass-icon-button lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {sortedConversations.length > 0 ? (
              <div className="space-y-1">
                {sortedConversations.map((conversation) => (
                  <div key={conversation.id} className="group relative">
                    {editingId === conversation.id ? (
                      <div className="flex items-center gap-1 px-3 py-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit()
                            if (e.key === "Escape") setEditingId(null)
                          }}
                          className="flex-1 rounded border bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="rounded-lg p-1 glass-icon-button"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    ) : collapsed ? (
                      <button
                        onClick={() => {
                          onSelect(conversation.id)
                          onClose()
                        }}
                        className={`flex w-full items-center justify-center rounded-lg p-3 transition-colors ${
                          selectedId === conversation.id
                            ? "bg-zinc-100 dark:bg-zinc-800"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        }`}
                        title={conversation.title || "New Chat"}
                      >
                        <MessageSquare className="h-4 w-4 text-zinc-400" />
                      </button>
                    ) : (
                      <div className="flex items-center">
                        <ConversationRow
                          conversation={conversation}
                          selected={selectedId === conversation.id}
                          onSelect={() => {
                            onSelect(conversation.id)
                            onClose()
                          }}
                        />
                        <div className="absolute right-2 flex gap-1 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => handleStartEdit(conversation)}
                            className="rounded-lg p-1 glass-icon-button"
                            title="Rename conversation"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this conversation?')) {
                                onDeleteConversation(conversation.id)
                              }
                            }}
                            className="rounded-lg p-1 glass-icon-button"
                            title="Delete conversation"
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              !collapsed && (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                  No conversations yet
                </div>
              )
            )}
          </div>

          <div className="border-t dark:border-zinc-800">
            <div className="px-4 py-2">
              <button
                onClick={createNewChat}
                className={`flex h-10 w-full items-center gap-2 rounded-xl glass-button glass-button-primary px-4 ${
                  collapsed ? "justify-center" : "justify-center"
                }`}
                title={collapsed ? "New Chat" : undefined}
              >
                <Plus className="h-4 w-4" />
                {!collapsed && "New Chat"}
              </button>
            </div>
            <div className="px-4 pb-2">
              <button
                onClick={() => router.push('/groupchat')}
                className={`flex h-10 w-full items-center gap-2 rounded-xl glass-button glass-button-light px-4 ${
                  collapsed ? "justify-center" : "justify-center"
                }`}
                title={collapsed ? "New Group Chat" : undefined}
              >
                <Users className="h-4 w-4" />
                {!collapsed && "Group Chat"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}