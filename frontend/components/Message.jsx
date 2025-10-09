
import { cls, text2audio, extractTextFromReactNode } from "./utils"
import { useState } from "react"

export default function Message({ role, children }) {
  const isUser = role === "user"
  const [playing, setPlaying] = useState(false)

  // 仅AI消息显示播放按钮
  return (
    <div className={cls("flex gap-3", isUser ? "justify-end" : "justify-start")}> 
      {!isUser && (
        <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
          AI
        </div>
      )}
      <div
        className={cls(
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm flex items-center gap-2",
          isUser
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800",
        )}
      >
        <span className="flex-1 break-words">{children}</span>
        {/* AI消息显示播放按钮 */}
        {!isUser && (
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
            className="ml-2 inline-flex items-center gap-1 rounded bg-indigo-500 px-2 py-1 text-xs text-white hover:bg-indigo-600 disabled:opacity-50"
            disabled={playing}
            title="播放AI回复"
          >
            {playing ? 'playing...' : '▶ play'}
          </button>
        )}
      </div>
      {isUser && (
        <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
          JD
        </div>
      )}
    </div>
  )
}
