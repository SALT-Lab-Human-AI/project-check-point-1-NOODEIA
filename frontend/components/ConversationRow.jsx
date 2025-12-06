"use client"

import { MessageSquare } from "lucide-react"

export default function ConversationRow({ conversation, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
        selected
          ? "bg-zinc-100 dark:bg-zinc-800"
          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      }`}
    >
      <MessageSquare className="h-4 w-4 flex-shrink-0 text-zinc-400" />
      <div className="flex-1 overflow-hidden">
        <div className="truncate font-medium text-sm">
          {conversation.title || "New Chat"}
        </div>
        <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {conversation.preview || "Start a conversation"}
        </div>
      </div>
    </button>
  )
}