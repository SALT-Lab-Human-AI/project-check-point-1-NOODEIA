"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Mail,
  User,
  Globe,
  LogOut,
  Check,
  X,
  Type,
  FileText,
  Home,
  LayoutGrid,
  Trophy
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { supabase } from '@/lib/supabase'
import UserAvatar from '@/components/UserAvatar'
import { formatXP } from '@/utils/levelingSystem'

const POPULAR_EMOJIS = [
  '😀', '😎', '🤓', '🧐', '🤠', '🥳', '😇', '🤩',
  '🚀', '⭐', '🔥', '💎', '🎯', '⚡', '🌟', '💫',
  '🎨', '🎭', '🎪', '🎸', '🎮', '🎲', '🎳', '🏆',
  '🐶', '🐱', '🐼', '🦊', '🦁', '🐯', '🐸', '🦄',
  '🌈', '🌸', '🌺', '🌻', '🌿', '🍀', '🌙', '☀️',
  '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👨‍🚀', '👩‍🚀'
]

const PRESET_COLORS = [
  '#F6B3DC', // Pink (Noodeia primary)
  '#F8C8E2', // Light pink
  '#A57E56', // Brown/gold
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#7C3AED', // Purple
]

export default function SettingsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Avatar customization states
  const [isEditingAvatar, setIsEditingAvatar] = useState(false)
  const [iconType, setIconType] = useState('initials')
  const [selectedEmoji, setSelectedEmoji] = useState('😀')
  const [selectedColor, setSelectedColor] = useState('#F6B3DC')
  const [customEmoji, setCustomEmoji] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Toast notification
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Bottom nav bar visibility
  const [showNavBar, setShowNavBar] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  // Strict scroll detection - only show at EXACT bottom when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement
      const body = document.body

      // Get scroll values (different browsers use different properties)
      const scrollTop = Math.ceil(window.scrollY ?? window.pageYOffset ?? doc.scrollTop ?? body.scrollTop ?? 0)
      const scrollHeight = Math.max(doc.scrollHeight, body.scrollHeight)
      const clientHeight = doc.clientHeight || window.innerHeight

      // Check if page has scrollable content (needs more than 20px to be considered scrollable)
      const isScrollable = scrollHeight > clientHeight + 20

      // Calculate distance from bottom
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight)

      // Only show nav bar if:
      // 1. Page is scrollable (has content that requires scrolling)
      // 2. User is within 1px of bottom
      setShowNavBar(isScrollable && Math.abs(distanceFromBottom) <= 1)
    }

    // Add listeners
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    // Don't check immediately - wait for user to scroll
    // This prevents nav bar from showing on initial page load

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      // Fetch user data from API
      const response = await fetch(`/api/user/profile?userId=${session.user.id}`)
      if (response.ok) {
        const userData = await response.json()
        setCurrentUser(userData)
        setIconType(userData.iconType || 'initials')
        setSelectedEmoji(userData.iconEmoji || '😀')
        setSelectedColor(userData.iconColor || '#F6B3DC')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      showNotification('Failed to sign out')
    }
  }

  const handleSaveAvatar = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          iconType,
          iconEmoji: iconType === 'emoji' ? selectedEmoji : null,
          iconColor: selectedColor,
        })
      })

      if (!response.ok) throw new Error('Failed to update profile')

      const updatedUser = await response.json()
      setCurrentUser(updatedUser)
      setIsEditingAvatar(false)

      // Celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F6B3DC', '#F8C8E2', '#D4A5FF']
      })

      showNotification('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      showNotification('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCustomEmojiSubmit = () => {
    if (customEmoji.trim()) {
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u
      if (emojiRegex.test(customEmoji) || customEmoji.length <= 2) {
        setSelectedEmoji(customEmoji.trim())
        setCustomEmoji('')
      } else {
        showNotification('Please enter a valid emoji')
      }
    }
  }

  const showNotification = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  const previewUser = {
    ...currentUser,
    iconType,
    iconEmoji: selectedEmoji,
    iconColor: selectedColor
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100/60 via-purple-100 to-purple-100 pb-24">
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Main Content */}
        <div className="max-w-md mx-auto px-6 pt-8 pb-12 space-y-6">

          {/* Profile Card */}
          <motion.div
            className="glass-card p-4 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
              <UserAvatar user={currentUser} size="xl" />
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-800 drop-shadow-md">
                  {currentUser.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Level {currentUser.level} • {formatXP(currentUser.xp || 0)} XP
                </p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <button
                    onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                    className="h-12 px-5 rounded-lg glass-button glass-button-primary text-gray-800 font-medium backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300"
                  >
                    {isEditingAvatar ? 'Cancel' : 'Customize Avatar'}
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="h-12 px-5 rounded-lg bg-red-500/80 hover:bg-red-600/80 text-white font-medium backdrop-blur-sm border border-red-400/30 transition-all duration-300 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Avatar Customization (Expanded) */}
            <AnimatePresence>
              {isEditingAvatar && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/20 pt-6 space-y-6">
                    {/* Preview */}
                    <div className="flex flex-col items-center space-y-2">
                      <p className="text-sm text-gray-600 font-medium">Preview</p>
                      <div className="flex items-center gap-4">
                        <UserAvatar user={previewUser} size="lg" />
                        <UserAvatar user={previewUser} size="md" />
                        <UserAvatar user={previewUser} size="sm" />
                      </div>
                    </div>

                    {/* Icon Type Selection */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-800">Icon Type</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setIconType('initials')}
                          className={`p-3 rounded-xl border-2 transition-colors backdrop-blur-sm ${
                            iconType === 'initials'
                              ? 'border-zinc-900 bg-white/40'
                              : 'border-white/30 bg-white/20 hover:border-white/50'
                          }`}
                        >
                          <Type className="h-5 w-5 mx-auto mb-1 text-gray-800" />
                          <span className="text-sm text-gray-800 font-medium">Initials</span>
                        </button>
                        <button
                          onClick={() => setIconType('emoji')}
                          className={`p-3 rounded-xl border-2 transition-colors backdrop-blur-sm ${
                            iconType === 'emoji'
                              ? 'border-zinc-900 bg-white/40'
                              : 'border-white/30 bg-white/20 hover:border-white/50'
                          }`}
                        >
                          <span className="text-xl mb-1 block">😀</span>
                          <span className="text-sm text-gray-800 font-medium">Emoji</span>
                        </button>
                      </div>
                    </div>

                    {/* Emoji Selection */}
                    {iconType === 'emoji' && (
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <p className="text-sm font-medium text-gray-800">Choose Emoji</p>
                        <div className="grid grid-cols-8 gap-1 bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                          {POPULAR_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => setSelectedEmoji(emoji)}
                              className={`p-2 text-xl rounded-lg hover:bg-white/30 transition-colors ${
                                selectedEmoji === emoji ? 'bg-white/50 scale-110' : ''
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>

                        {/* Custom emoji input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter custom emoji"
                            value={customEmoji}
                            onChange={(e) => setCustomEmoji(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl glass-input border border-white/30 bg-white/20 backdrop-blur-sm text-gray-800 placeholder-gray-600"
                            maxLength={2}
                          />
                          <button
                            onClick={handleCustomEmojiSubmit}
                            className="px-4 py-2 glass-button glass-button-primary text-gray-800 rounded-xl hover:bg-white/40 border border-white/30 font-medium"
                          >
                            Use
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Color Selection */}
                    {iconType === 'initials' && (
                      <motion.div
                        className="space-y-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <p className="text-sm font-medium text-gray-800">Background Color</p>
                        <div className="grid grid-cols-6 gap-2">
                          {PRESET_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={`h-12 w-full rounded-lg border-2 transition-all ${
                                selectedColor === color
                                  ? 'border-zinc-900 scale-110'
                                  : 'border-white/30'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        {/* Custom color input */}
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={selectedColor}
                            onChange={(e) => setSelectedColor(e.target.value)}
                            className="h-12 w-20 rounded-lg"
                          />
                          <span className="text-sm text-gray-600 font-mono">{selectedColor}</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-white/20">
                      <button
                        onClick={() => setIsEditingAvatar(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-800 hover:bg-white/20 rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveAvatar}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium glass-button glass-button-primary text-gray-800 rounded-xl hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed border border-white/30 transition-all"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Account Settings */}
          <motion.div
            className="glass-card p-4 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg sm:text-xl font-display font-bold text-gray-800 drop-shadow-md mb-4">
              Account Information
            </h3>
            <div className="space-y-2">
              <SettingsItem icon={Mail} label="Email" value={currentUser.email} />
              <SettingsItem icon={User} label="Username" value={currentUser.name} />
            </div>
          </motion.div>

          {/* App Features */}
          <motion.div
            className="glass-card p-4 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <h3 className="text-lg sm:text-xl font-display font-bold text-gray-800 drop-shadow-md mb-4">
              App Features
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => window.open('https://github.com/SALT-Lab-Human-AI/project-check-point-1-NOODEIA/blob/main/designSpecification/TASK_FLOW.md', '_blank')}
                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-3xl hover:bg-white/10 transition-all duration-300 group backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/20">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 drop-shadow-md" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-gray-800 drop-shadow-md block text-sm sm:text-base">Explore all the features in Noodeia</span>
                    <span className="text-xs sm:text-sm text-gray-600">View our complete task flow guide</span>
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-800 group-hover:-translate-x-1 transition-all duration-300 drop-shadow-md rotate-180" />
              </button>
            </div>
          </motion.div>

        </div>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50 glass-card px-6 py-3 border border-white/30 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-800">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar - Animated Liquid Glass (appears on scroll to bottom) */}
      <div
        className={`fixed bottom-0 left-0 right-0 pb-safe z-50 transition-all duration-300 ${
          showNavBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="max-w-md mx-auto px-4 pb-4">
          <div className="relative bg-white/15 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.3)] border border-white/20 overflow-hidden">
            {/* Glass morphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5 pointer-events-none" />

            <div className="relative flex items-center justify-around px-4 py-2.5">
              {/* Home */}
              <button
                onClick={() => router.push('/home')}
                className="relative flex flex-col items-center gap-1 transition-all duration-300 group"
              >
                <div className="relative p-2 rounded-xl transform group-active:scale-95 transition-all group-hover:bg-gray-100/50">
                  <Home size={18} className="text-gray-500 group-active:text-gray-700 transition-colors" />
                </div>
                <span className="text-[9px] font-medium text-gray-500">Home</span>
              </button>

              {/* Grid/Dashboard */}
              <button
                onClick={() => router.push('/home')}
                className="relative flex flex-col items-center gap-1 transition-all duration-300 group"
              >
                <div className="relative p-2 rounded-xl transform group-active:scale-95 transition-all group-hover:bg-gray-100/50">
                  <LayoutGrid size={18} className="text-gray-500 group-active:text-gray-700 transition-colors" />
                </div>
                <span className="text-[9px] font-medium text-gray-500">Menu</span>
              </button>

              {/* Achievements */}
              <button
                onClick={() => router.push('/achievements')}
                className="relative flex flex-col items-center gap-1 transition-all duration-300 group"
              >
                <div className="relative p-2 rounded-xl transform group-active:scale-95 transition-all group-hover:bg-gray-100/50">
                  <Trophy size={18} className="text-gray-500 group-active:text-gray-700 transition-colors" />
                </div>
                <span className="text-[9px] font-medium text-gray-500">Achievements</span>
              </button>

              {/* Profile - Active state */}
              <button
                onClick={() => router.push('/settings')}
                className="relative flex flex-col items-center gap-1 transition-all duration-300 group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-100/40 to-pink-200/40 rounded-xl blur-md opacity-50 group-active:opacity-70 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-pink-100/60 to-pink-200/60 p-2 rounded-xl shadow-md transform group-active:scale-95 transition-transform backdrop-blur-sm">
                    <User size={18} className="text-pink-400" strokeWidth={2.5} />
                  </div>
                </div>
                <span className="text-[9px] font-bold text-pink-400">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Glassmorphism Styles */}
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
        }

        .glass-button {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-button:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: translateY(-2px);
        }

        .glass-button-light {
          background: rgba(255, 255, 255, 0.2);
        }

        .glass-button-primary {
          background: rgba(246, 179, 220, 0.3);
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  )
}

interface SettingsItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value?: string
}

function SettingsItem({ icon: Icon, label, value }: SettingsItemProps) {
  return (
    <button
      className="w-full rounded-lg bg-white/20 backdrop-blur-sm border border-white/30
                 transition-all duration-300 hover:bg-white/30
                 h-16 px-4 flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-white/25 border border-white/30
                        flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-800 drop-shadow" />
        </div>
        <div className="text-left">
          <span className="block text-sm sm:text-base font-medium text-gray-800">{label}</span>
          {value && <span className="block text-xs sm:text-sm text-gray-600">{value}</span>}
        </div>
      </div>

      <ChevronLeft
        className="w-5 h-5 text-gray-500 rotate-180 group-hover:text-gray-700 transition-colors"
      />
    </button>
  )
}
