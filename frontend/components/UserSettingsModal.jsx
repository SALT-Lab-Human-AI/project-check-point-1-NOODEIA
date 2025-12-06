"use client"

import { useState, useEffect } from 'react'
import { X, User, Palette, Type } from 'lucide-react'
import UserAvatar from './UserAvatar'

const POPULAR_EMOJIS = [
  '😀', '😎', '🤓', '🧐', '🤠', '🥳', '😇', '🤩',
  '🚀', '⭐', '🔥', '💎', '🎯', '⚡', '🌟', '💫',
  '🎨', '🎭', '🎪', '🎸', '🎮', '🎲', '🎳', '🏆',
  '🐶', '🐱', '🐼', '🦊', '🦁', '🐯', '🐸', '🦄',
  '🌈', '🌸', '🌺', '🌻', '🌿', '🍀', '🌙', '☀️',
  '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👨‍🚀', '👩‍🚀'
]

const PRESET_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#6B7280', // gray
  '#059669', // green
  '#DC2626', // red-600
  '#7C3AED', // purple
]

export default function UserSettingsModal({ isOpen, onClose, currentUser, onUpdateUser }) {
  const [iconType, setIconType] = useState(currentUser?.iconType || 'initials')
  const [selectedEmoji, setSelectedEmoji] = useState(currentUser?.iconEmoji || '😀')
  const [selectedColor, setSelectedColor] = useState(currentUser?.iconColor || '#3B82F6')
  const [customEmoji, setCustomEmoji] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setIconType(currentUser.iconType || 'initials')
      setSelectedEmoji(currentUser.iconEmoji || '😀')
      setSelectedColor(currentUser.iconColor || '#3B82F6')
    }
  }, [currentUser])

  if (!isOpen) return null

  const previewUser = {
    ...currentUser,
    iconType,
    iconEmoji: selectedEmoji,
    iconColor: selectedColor
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          iconType,
          iconEmoji: iconType === 'emoji' ? selectedEmoji : null,
          iconColor: selectedColor,
          userId: currentUser?.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.details || errorData.error || 'Failed to update profile')
      }

      const updatedUser = await response.json()
      onUpdateUser(updatedUser)
      onClose()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert(`Failed to update profile: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCustomEmojiSubmit = () => {
    if (customEmoji.trim()) {
      // Check if it's a valid emoji (basic check)
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
      if (emojiRegex.test(customEmoji) || customEmoji.length <= 2) {
        setSelectedEmoji(customEmoji.trim())
        setCustomEmoji('')
        setShowEmojiPicker(false)
      } else {
        alert('Please enter a valid emoji')
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
          <h2 className="text-lg font-semibold">Customize Your Icon</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Preview */}
          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Preview</p>
            <div className="flex items-center gap-4">
              <UserAvatar user={previewUser} size="lg" />
              <UserAvatar user={previewUser} size="md" />
              <UserAvatar user={previewUser} size="sm" />
            </div>
          </div>

          {/* Icon Type Selection */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Icon Type</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIconType('initials')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  iconType === 'initials'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                }`}
              >
                <Type className="h-5 w-5 mx-auto mb-1" />
                <span className="text-sm">Initials</span>
              </button>
              <button
                onClick={() => setIconType('emoji')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  iconType === 'emoji'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                }`}
              >
                <span className="text-xl mb-1 block">😀</span>
                <span className="text-sm">Emoji</span>
              </button>
            </div>
          </div>

          {/* Emoji Selection (only if emoji type is selected) */}
          {iconType === 'emoji' && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Choose Emoji</p>
              <div className="grid grid-cols-8 gap-1">
                {POPULAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`p-2 text-xl rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                      selectedEmoji === emoji ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Custom emoji input */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Enter custom emoji"
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                  maxLength={2}
                />
                <button
                  onClick={handleCustomEmojiSubmit}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                >
                  Use
                </button>
              </div>
            </div>
          )}

          {/* Color Selection (only if initials type is selected) */}
          {iconType === 'initials' && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Background Color</p>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-10 w-full rounded-lg border-2 transition-all ${
                      selectedColor === color
                        ? 'border-zinc-900 dark:border-white scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Custom color input */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="h-10 w-20"
                />
                <span className="text-sm text-zinc-500">{selectedColor}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t dark:border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}