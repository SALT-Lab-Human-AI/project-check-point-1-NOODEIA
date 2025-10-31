"use client"

import { useRef, useState, useEffect } from "react"
import { Send, Loader2, TrendingUp, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Composer({ onSend, busy, xpGain }) {
  const [value, setValue] = useState("")
  const [sending, setSending] = useState(false)
  const [showXpAnimation, setShowXpAnimation] = useState(false)
  const [xpAmount, setXpAmount] = useState(0)
  const inputRef = useRef(null)

  // Handle XP gain animation
  useEffect(() => {
    if (xpGain && xpGain > 0) {
      setXpAmount(xpGain)
      setShowXpAnimation(true)
      const timer = setTimeout(() => {
        setShowXpAnimation(false)
      }, 2000) // Show for 2 seconds
      return () => clearTimeout(timer)
    }
  }, [xpGain])

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
    <>
    <form onSubmit={handleSubmit} className="relative p-3 sm:p-4 flex-shrink-0 bg-white/10 backdrop-blur-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-t border-white/20 overflow-hidden">
      {/* Glass overlay - matching GamificationBar */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-3xl">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={busy || sending}
            className="min-h-[40px] max-h-[160px] flex-1 resize-none rounded-xl glass-input px-3 py-2 text-base disabled:opacity-50"
            rows={1}
            style={{ WebkitAppearance: 'none', appearance: 'none' }}
          />
          <div className="relative">
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

            {/* XP Gain Animation - Above send button */}
            <AnimatePresence>
              {showXpAnimation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 0 }}
                  animate={{ opacity: 1, scale: 1, y: -60 }}
                  exit={{ opacity: 0, scale: 0.3, y: -100 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
                >
                  <div
                    className="flex items-center gap-2 px-5 py-3 text-white rounded-full shadow-2xl"
                    style={{
                      background: 'linear-gradient(to right, #F6B3DC, #F8C8E2)',
                    }}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-black text-lg">+{xpAmount.toFixed(2)} XP</span>
                    <Sparkles className="w-5 h-5" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="mt-2 text-xs text-zinc-500 hidden sm:block">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </form>
  </>
  )
}