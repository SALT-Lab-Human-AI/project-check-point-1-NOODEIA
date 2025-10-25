
import { cls, text2audio, extractTextFromReactNode } from "./utils"
import { useState } from "react"
import { Volume2 } from "lucide-react"
import UserAvatar from "./UserAvatar"

export default function Message({ role, children, currentUser }) {
  const isUser = role === "user"
  const [playing, setPlaying] = useState(false)

  // Check if children includes edit/resend buttons (for user messages)
  const hasActions = role === "user" && typeof children === 'object' && children.props

  return (
    <div className="group">
      <div className={cls("flex gap-3", isUser ? "justify-end" : "justify-start")}>
        {!isUser && (
          <UserAvatar
            user={{ id: 'ai_assistant', isAI: true }}
            size="sm"
            className="mt-0.5"
          />
        )}
<div
  className={cls(
    "relative max-w-[80%] rounded-2xl px-3 py-2 text-lg font-patrick shadow-sm",

    isUser
      ? [
          "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900",
          "after:content-[''] after:absolute after:top-3 after:-right-2",
          "after:border-y-[8px] after:border-y-transparent after:border-l-[10px]",
          "after:border-l-zinc-900 dark:after:border-l-white",
        ].join(" ")
      : [

          "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800",

          "before:content-[''] before:absolute before:top-3 before:-left-[11px]",
          "before:border-y-[9px] before:border-y-transparent before:border-r-[11px]",
          "before:border-r-zinc-200 dark:before:border-r-zinc-800",

          "after:content-[''] after:absolute after:top-3 after:-left-[10px]",
          "after:border-y-[8px] after:border-y-transparent after:border-r-[10px]",
          "after:border-r-white dark:after:border-r-zinc-900",
        ].join(" ")
      )}
        >
          {hasActions ? (
            // User message with edit/resend actions - render as is
            children
          ) : (
            // AI message - add play button inside
            <>
              <div className="break-words">{children}</div>
              {!isUser && (
                <div className="mt-2 flex items-center gap-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={async () => {
                      setPlaying(true)
                      try {
                        const text = extractTextFromReactNode(children)
                        await text2audio(text)
                      } finally {
                        setPlaying(false)
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-50"
                    disabled={playing}
                    title="Play AI's response"
                  >
                    <Volume2 className="h-3 w-3" />
                    {playing ? 'Playing...' : 'Play'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        {isUser && (
          <UserAvatar
            user={currentUser}
            size="sm"
            className="mt-0.5"
          />
        )}
      </div>
    </div>
  )
}
