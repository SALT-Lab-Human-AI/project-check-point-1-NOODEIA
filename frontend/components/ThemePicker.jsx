"use client"

import { useEffect, useState } from "react"

const THEMES = [
  { key: "cream", label: "Yellow", swatch: "bg-[#FEFCE8]", border: "border-[#FEF9C3]" },
  { key: "lilac", label: "Purple", swatch: "bg-[#F3E8FF]", border: "border-[#E9D5FF]" },
  { key: "rose",  label: "Pink",   swatch: "bg-[#FCE7F3]", border: "border-[#FBCFE8]" },
  { key: "sky",   label: "Blue",   swatch: "bg-[#EFF6FF]", border: "border-[#DBEAFE]" },
]

export default function ThemePicker({ value, onChange }) {
  const [active, setActive] = useState(value || "cream")

  useEffect(() => {
    setActive(value)
  }, [value])

  const handleThemeClick = (themeKey) => {
    setActive(themeKey)
    onChange?.(themeKey)
  }

  return (
    <div className="flex items-center gap-2">
      {THEMES.map(theme => (
        <button
          key={theme.key}
          onClick={() => handleThemeClick(theme.key)}
          className={`h-8 w-8 rounded-full border-2 transition-all duration-300
            ${theme.swatch}
            ${theme.border}
            ${active === theme.key
              ? "ring-2 ring-zinc-600 ring-offset-2 dark:ring-zinc-300 scale-110 shadow-lg"
              : "hover:opacity-80 hover:scale-105 shadow-md"
            }`}
          title={theme.label}
          aria-label={`${theme.label} theme`}
        />
      ))}
    </div>
  )
}
