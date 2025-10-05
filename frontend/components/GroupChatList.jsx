"use client"

import { Users, Hash, Clock, Crown } from 'lucide-react'

export default function GroupChatList({ groups, selectedGroupId, onSelectGroup }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return 'Today'
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return `${days} days ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  return (
    <div className="space-y-2">
      {groups.length === 0 ? (
        <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No group chats yet
        </div>
      ) : (
        groups.map((group) => (
          <button
            key={group.id}
            onClick={() => onSelectGroup(group.id)}
            className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
              selectedGroupId === group.id
                ? 'bg-zinc-100 dark:bg-zinc-800'
                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 text-white">
              <Hash className="h-5 w-5" />
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">{group.name}</h3>
                {group.role === 'admin' && (
                  <Crown className="h-3 w-3 text-yellow-500" title="Admin" />
                )}
              </div>

              {group.description && (
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {group.description}
                </p>
              )}

              <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {group.members?.length || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Joined {formatDate(group.joinedAt)}
                </span>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  )
}