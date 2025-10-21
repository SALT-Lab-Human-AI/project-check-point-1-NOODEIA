"use client"

import { useEffect, useRef, useState } from "react"
import { Download, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"

export default function MindMapViewer({ markdown, className = "" }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [markmap, setMarkmap] = useState(null)

  // Color scheme for the mind map - must be defined before loadMarkmap
  const colorScheme = [
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#f43f5e', // rose-500,
  ]

  useEffect(() => {
    if (!markdown) {
      setIsLoading(false)
      return
    }

    loadMarkmap()
  }, [markdown])

  const loadMarkmap = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Dynamically import markmap libraries
      const { Markmap, loadCSS, loadJS } = await import('markmap-view')
      const { Transformer } = await import('markmap-lib')

      // Load markmap styles
      const { styles, scripts } = await loadCSS()
      await loadJS(scripts)

      // Create transformer and transform markdown
      const transformer = new Transformer()
      const { root, features } = transformer.transform(markdown)

      // Clear previous SVG content
      if (svgRef.current) {
        svgRef.current.innerHTML = ''
      }

      // Create and render markmap
      const mm = Markmap.create(svgRef.current, {
        color: colorScheme,
        duration: 300,
        maxWidth: 300,
        paddingX: 20,
        zoom: true,
        pan: true
      }, root)

      setMarkmap(mm)
      setIsLoading(false)

      // Auto-fit on initial load
      setTimeout(() => {
        mm.fit()
      }, 100)
    } catch (err) {
      console.error('Error loading markmap:', err)
      setError('Failed to load mind map visualization')
      setIsLoading(false)
    }
  }

  const handleZoomIn = () => {
    if (markmap) {
      const newZoom = Math.min(zoom * 1.2, 5)
      setZoom(newZoom)
      markmap.rescale(newZoom)
    }
  }

  const handleZoomOut = () => {
    if (markmap) {
      const newZoom = Math.max(zoom / 1.2, 0.2)
      setZoom(newZoom)
      markmap.rescale(newZoom)
    }
  }

  const handleFit = () => {
    if (markmap) {
      markmap.fit()
      setZoom(1)
    }
  }

  const handleExport = () => {
    if (!svgRef.current) return

    // Clone the SVG element
    const svgElement = svgRef.current.cloneNode(true)

    // Add necessary attributes
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    // Get SVG string
    const svgString = new XMLSerializer().serializeToString(svgElement)

    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'mindmap.svg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!markdown) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center space-y-4">
          <div className="text-zinc-400">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              No Mind Map Yet
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              Start writing markdown in the editor to generate a mind map
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative h-full bg-white dark:bg-zinc-900 ${className}`} ref={containerRef}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-2">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-px bg-zinc-200 dark:bg-zinc-700" />
        <button
          onClick={handleExport}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded"
          title="Export as SVG"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 z-10 text-xs text-zinc-500 bg-white dark:bg-zinc-800 rounded px-2 py-1">
        {Math.round(zoom * 100)}%
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 z-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
            </div>
            <p className="mt-2 text-sm text-zinc-500">Generating mind map...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-zinc-900 z-20">
          <div className="text-center space-y-4">
            <div className="text-red-500">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Failed to Load Mind Map
              </h3>
              <p className="mt-2 text-sm text-zinc-500">
                {error}
              </p>
              <button
                onClick={loadMarkmap}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SVG Container */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{
          display: isLoading || error ? 'none' : 'block'
        }}
      />
    </div>
  )
}

// Fallback component for server-side rendering
export function MindMapViewerFallback() {
  return (
    <div className="flex items-center justify-center h-full bg-zinc-50 dark:bg-zinc-900">
      <div className="text-center space-y-4">
        <div className="text-zinc-400">
          <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Mind Map Viewer
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            Loading visualization...
          </p>
        </div>
      </div>
    </div>
  )
}