"use client"

import { Palette } from "lucide-react"

const THEMES = [
  { key: "cream", label: "Yellow", color: "#FEFCE8" },
  { key: "lilac", label: "Purple", color: "#EAD9FF" },
  { key: "rose",  label: "Pink",   color: "#FAD1E8" },
  { key: "sky",   label: "Blue",   color: "#E6F0FF" },
]

export default function ThemeCycleButton({ currentTheme, onThemeChange }) {
  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex(t => t.key === currentTheme)
    const nextIndex = (currentIndex + 1) % THEMES.length
    onThemeChange(THEMES[nextIndex].key)
  }

  const currentThemeData = THEMES.find(t => t.key === currentTheme) || THEMES[0]

  return (
    <button
      onClick={cycleTheme}
      className="relative flex items-center gap-2 px-3 py-2 rounded-xl glass-button glass-button-light transition-all duration-300 hover:scale-105"
      title={`Current: ${currentThemeData.label} theme (click to change)`}
      aria-label="Change color theme"
    >
      <div
        className="w-5 h-5 rounded-full border-2 border-white/50 shadow-sm"
        style={{ backgroundColor: currentThemeData.color }}
      />
      <Palette className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
    </button>
  )
}
