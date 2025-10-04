"use client"

import React from "react"
import { Menu, LogOut, User } from "lucide-react"

export default function Header({ onMenuClick, currentUser, onLogout }) {
  return (
    <header className="flex items-center justify-between border-b px-4 py-3 dark:border-zinc-800">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-lg font-semibold">Noodeia AI Tutor</h1>

      {currentUser ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
            <User className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-medium">{currentUser.name}</span>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="w-9" />
      )}
    </header>
  )
}