"use client"

import { Menu, FileText } from "lucide-react"

export default function Header({ onMenuClick, onNotesClick }) {
  return (
    <header className="flex items-center justify-between border-b px-2 sm:px-4 py-2 sm:py-3 dark:border-zinc-800 min-h-[3.5rem]">
      {/* Left Section: Menu and Title only */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-1.5 sm:p-2 glass-icon-button lg:hidden flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-base sm:text-lg font-semibold whitespace-nowrap">
          Noodeia
        </h1>
      </div>

      {/* Right Section: Notes button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNotesClick}
          className="rounded-xl p-1.5 sm:p-2 glass-icon-button flex-shrink-0"
          aria-label="Open notes"
        >
          <FileText className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}