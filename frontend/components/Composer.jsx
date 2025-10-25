"use client"

import { useRef, useState, useEffect } from "react"
import { Send, Loader2 } from "lucide-react"

export default function Composer({ onSend, busy }) {
  const [value, setValue] = useState("")
  const [sending, setSending] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      const textarea = inputRef.current
      const minHeight = 40

      textarea.style.height = "auto"
      const scrollHeight = textarea.scrollHeight

      if (scrollHeight <= 200) {
        textarea.style.height = `${Math.max(minHeight, scrollHeight)}px`
        textarea.style.overflowY = "hidden"
      } else {
        textarea.style.height = "200px"
        textarea.style.overflowY = "auto"
      }
    }
  }, [value])

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!value.trim() || sending || busy) return
    
    setSending(true)
    try {
      await onSend(value)
      setValue("")
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const disabled = busy || sending || !value.trim()

  return (
    <form onSubmit={handleSubmit} className="border-t p-3 sm:p-4 dark:border-zinc-800 flex-shrink-0">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={busy || sending}
            className="min-h-[40px] max-h-[160px] flex-1 resize-none rounded-xl glass-input px-3 py-2 text-sm sm:text-base disabled:opacity-50"
            rows={1}
            style={{ WebkitAppearance: 'none', appearance: 'none' }}
          />
          <button
            type="submit"
            disabled={disabled}
            className="rounded-xl p-2 glass-button glass-button-primary text-white transition-all disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="mt-2 text-xs text-zinc-500 hidden sm:block">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </form>
  )
}