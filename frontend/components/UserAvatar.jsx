"use client"

import { useMemo } from 'react'

export default function UserAvatar({
  user,
  size = 'md',
  className = '',
  showTooltip = false
}) {
  // Size configurations
  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
    xl: 'h-12 w-12 text-base'
  }

  // Generate a consistent color from user ID
  const backgroundColor = useMemo(() => {
    if (user?.iconColor) return user.iconColor

    // Default colors for fallback
    const colors = [
      '#3B82F6', // blue
      '#10B981', // emerald
      '#F59E0B', // amber
      '#EF4444', // red
      '#8B5CF6', // violet
      '#EC4899', // pink
      '#14B8A6', // teal
      '#F97316', // orange
    ]

    if (user?.id) {
      const hash = user.id.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc)
      }, 0)
      return colors[Math.abs(hash) % colors.length]
    }

    return colors[0]
  }, [user?.id, user?.iconColor])

  // Get display content
  const getDisplayContent = () => {
    // AI Assistant special case
    if (user?.id === 'ai_assistant' || user?.isAI) {
      return 'AI'
    }

    // Custom emoji
    if (user?.iconType === 'emoji' && user?.iconEmoji) {
      return user.iconEmoji
    }

    // Initials (default)
    if (user?.name) {
      const names = user.name.trim().split(' ')
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      }
      return names[0].substring(0, 2).toUpperCase()
    }

    // Fallback to email initial
    if (user?.email) {
      return user.email[0].toUpperCase()
    }

    return '?'
  }

  const avatarContent = getDisplayContent()
  const isEmoji = user?.iconType === 'emoji' && user?.iconEmoji

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${className}
        flex-shrink-0 rounded-full flex items-center justify-center font-semibold
        ${isEmoji ? 'bg-zinc-100 dark:bg-zinc-800' : ''}
      `}
      style={{
        backgroundColor: isEmoji ? undefined : backgroundColor,
        color: isEmoji ? undefined : 'white'
      }}
      title={showTooltip ? (user?.name || user?.email || 'User') : undefined}
    >
      {avatarContent}
    </div>
  )
}