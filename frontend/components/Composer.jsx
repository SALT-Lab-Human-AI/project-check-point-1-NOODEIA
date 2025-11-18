"use client"

import { useRef, useState, useEffect } from "react"
import { Send, Loader2, TrendingUp, Sparkles, Mic, Square } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Composer({ onSend, busy, xpGain, xpTrigger }) {
  const [value, setValue] = useState("")
  const [sending, setSending] = useState(false)
  const [showXpAnimation, setShowXpAnimation] = useState(false)
  const [xpAmount, setXpAmount] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const inputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const streamRef = useRef(null)

  // Handle XP gain animation - triggered by xpTrigger counter to ensure it fires every time
  useEffect(() => {
    if (xpGain && xpGain > 0 && xpTrigger > 0) {
      setXpAmount(xpGain)
      setShowXpAnimation(true)
      const timer = setTimeout(() => {
        setShowXpAnimation(false)
      }, 2000) // Show for 2 seconds
      return () => clearTimeout(timer)
    }
  }, [xpTrigger, xpGain])

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

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await transcribeAudio(audioBlob)
        
        // Stop all tracks to release microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check your permissions.')
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Clean up stream if recording was stopped manually
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }

  async function transcribeAudio(audioBlob) {
    setIsTranscribing(true)
    try {
      // Get auth token from Supabase
      const { supabase } = await import('../lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Not authenticated')
      }

      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Transcription failed')
      }

      const data = await response.json()
      if (data.text) {
        // Append transcribed text to the input
        setValue(prev => prev ? `${prev} ${data.text}` : data.text)
        // Focus the input
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }
    } catch (error) {
      console.error('Transcription error:', error)
      alert('Failed to transcribe audio. Please try again.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const disabled = busy || sending || !value.trim()

  return (
    <>
    <form onSubmit={handleSubmit} className="relative p-3 sm:p-4 flex-shrink-0 bg-white/10 backdrop-blur-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-t border-white/20 overflow-visible">
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
          <div className="relative flex items-center gap-2">
            {/* Microphone Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={busy || sending || isTranscribing}
              className={`rounded-xl p-2 glass-button glass-button-primary text-white transition-all disabled:opacity-50 ${
                isRecording ? 'animate-pulse' : ''
              }`}
              style={isRecording ? {
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(220, 38, 38, 0.3))',
                border: '1px solid rgba(239, 68, 68, 1.0)',
                boxShadow: '0 4px 24px rgba(239, 68, 68, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
              } : {}}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              {isTranscribing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isRecording ? (
                <Square className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
            
            {/* Send Button */}
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

              {/* XP Gain Animation - appears above send button */}
              <AnimatePresence>
                {showXpAnimation && (
                  <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -20, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 0.3 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none z-10"
                  >
                    <div
                      className="flex items-center gap-1 px-2 py-1 text-white rounded-full shadow-lg"
                      style={{
                        background: 'linear-gradient(to right, #F6B3DC, #F8C8E2)',
                        fontSize: '12px'
                      }}
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-bold">+{xpAmount.toFixed(2)}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
