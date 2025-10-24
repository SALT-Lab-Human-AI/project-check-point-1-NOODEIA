"use client"

import { Menu, LogOut, FileText, Settings } from "lucide-react"
import UserAvatar from './UserAvatar'

export default function Header({ onMenuClick, currentUser, onLogout, onMarkdownClick, onSettingsClick }) {
  return (
    <header className="flex items-center justify-between border-b px-2 sm:px-4 py-2 sm:py-3 dark:border-zinc-800 min-h-[3.5rem]">
      {/* Left Section: Menu and Title only */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 sm:p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-base sm:text-lg font-semibold whitespace-nowrap">
          Noodeia
        </h1>
      </div>

      {/* Right Section: User, Notes, and Logout */}
      {currentUser ? (
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={onSettingsClick}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="User settings"
          >
            <UserAvatar user={currentUser} size="sm" />
            <span className="text-xs sm:text-sm font-medium truncate max-w-[60px] xs:max-w-[100px] sm:max-w-[150px]">
              {currentUser.name}
            </span>
            <Settings className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-zinc-500 flex-shrink-0" />
          </button>
          <button
            onClick={onMarkdownClick}
            className="rounded-lg p-1.5 sm:p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
            title="Open markdown notes panel"
            aria-label="Notes"
          >
            <FileText className="h-4 sm:h-5 w-4 sm:w-5" />
          </button>
          <button
            onClick={onLogout}
            className="rounded-lg p-1.5 sm:p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-4 sm:h-5 w-4 sm:w-5" />
          </button>
        </div>
      ) : (
        <div className="w-9 flex-shrink-0" />
      )}
    </header>
  )
}