"use client"

import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react"
import { X, FileText, Eye, Map, Save, Download, Maximize2, Minimize2 } from "lucide-react"

// Lazy load the MindMapViewer to avoid SSR issues
const MindMapViewer = lazy(() => import("./MindMapViewer"))

export default function MarkdownPanel({
  isOpen,
  onClose,
  conversationId,
  userId,
  initialContent = "",
  onSave
}) {
  const [markdown, setMarkdown] = useState(initialContent)
  const [activeTab, setActiveTab] = useState("editor") // editor, preview, mindmap
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const textareaRef = useRef(null)
  const mindmapContainerRef = useRef(null)
  const saveTimeoutRef = useRef(null)

  // Load markdown content when panel opens
  useEffect(() => {
    if (isOpen && conversationId) {
      loadMarkdownContent()
    }
  }, [isOpen, conversationId])

  // Auto-save functionality
  useEffect(() => {
    if (markdown !== initialContent) {
      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // Set new timeout for auto-save (2 seconds after user stops typing)
      saveTimeoutRef.current = setTimeout(() => {
        handleSave()
      }, 2000)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [markdown])

  const loadMarkdownContent = async () => {
    try {
      const response = await fetch(`/api/markdown/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMarkdown(data.content || "")
        setLastSaved(data.lastModified)
      }
    } catch (error) {
      console.error("Error loading markdown:", error)
    }
  }

  const handleSave = async () => {
    if (!conversationId || isSaving) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/markdown/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          content: markdown,
          userId
        })
      })

      if (response.ok) {
        setLastSaved(new Date())
        if (onSave) {
          onSave(markdown)
        }
      }
    } catch (error) {
      console.error("Error saving markdown:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const renderMarkdownPreview = useCallback(() => {
    // Basic markdown to HTML conversion
    // In production, use a proper markdown parser like marked or remark
    let html = markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\* (.+)/gim, '<li>$1</li>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')

    // Wrap list items in ul tags
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

    return { __html: `<p>${html}</p>` }
  }, [markdown])

  const renderMindMap = useCallback(() => {
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
              </div>
              <p className="mt-2 text-sm text-zinc-500">Loading mind map...</p>
            </div>
          </div>
        }
      >
        <MindMapViewer markdown={markdown} className="h-full" />
      </Suspense>
    )
  }, [markdown])

  const generateMindMap = async () => {
    try {
      const response = await fetch('/api/markdown/mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          markdown,
          conversationId
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Here you would render the actual mind map using markmap
        console.log("Mind map data:", data)
      }
    } catch (error) {
      console.error("Error generating mind map:", error)
    }
  }

  const exportMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation-${conversationId}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const insertMarkdownTemplate = (template) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value

    let insertion = ""
    switch (template) {
      case "heading":
        insertion = "\n# Heading\n"
        break
      case "list":
        insertion = "\n* Item 1\n* Item 2\n* Item 3\n"
        break
      case "link":
        insertion = "[Link Text](https://example.com)"
        break
      case "bold":
        insertion = "**Bold Text**"
        break
      case "italic":
        insertion = "*Italic Text*"
        break
      case "code":
        insertion = "```\nCode block\n```"
        break
      case "table":
        insertion = "\n| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n"
        break
    }

    const newText = text.substring(0, start) + insertion + text.substring(end)
    setMarkdown(newText)

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = start + insertion.length
      textarea.selectionEnd = start + insertion.length
    }, 0)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop overlay */}
      {!isFullscreen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Main panel */}
      <div
        className={`fixed ${isFullscreen ? 'inset-0' : 'top-0 right-0 h-full w-96'} bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col transition-all duration-300 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Markdown Notes
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-zinc-500">
              Saved {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-700">
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "editor"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            Editor
          </div>
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </div>
        </button>
        <button
          onClick={() => setActiveTab("mindmap")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "mindmap"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Map className="w-4 h-4" />
            Mind Map
          </div>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "editor" && (
          <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="p-2 border-b border-zinc-200 dark:border-zinc-700 flex gap-1 flex-wrap">
              <button
                onClick={() => insertMarkdownTemplate("heading")}
                className="px-2 py-1 text-xs rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Insert Heading"
              >
                H1
              </button>
              <button
                onClick={() => insertMarkdownTemplate("bold")}
                className="px-2 py-1 text-xs rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold"
                title="Bold"
              >
                B
              </button>
              <button
                onClick={() => insertMarkdownTemplate("italic")}
                className="px-2 py-1 text-xs rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 italic"
                title="Italic"
              >
                I
              </button>
              <button
                onClick={() => insertMarkdownTemplate("list")}
                className="px-2 py-1 text-xs rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Insert List"
              >
                List
              </button>
              <button
                onClick={() => insertMarkdownTemplate("link")}
                className="px-2 py-1 text-xs rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Insert Link"
              >
                Link
              </button>
              <button
                onClick={() => insertMarkdownTemplate("code")}
                className="px-2 py-1 text-xs rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Insert Code Block"
              >
                Code
              </button>
              <button
                onClick={() => insertMarkdownTemplate("table")}
                className="px-2 py-1 text-xs rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Insert Table"
              >
                Table
              </button>
            </div>

            {/* Editor */}
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Write your markdown notes here..."
              className="flex-1 p-4 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none focus:outline-none font-mono text-sm"
            />
          </div>
        )}

        {activeTab === "preview" && (
          <div className="h-full overflow-y-auto p-4">
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={renderMarkdownPreview()}
            />
          </div>
        )}

        {activeTab === "mindmap" && (
          <div ref={mindmapContainerRef} className="h-full">
            {renderMindMap()}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={exportMarkdown}
            className="px-3 py-1.5 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        <div className="flex gap-2">
          {isSaving && (
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              Saving...
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
    </>
  )
}