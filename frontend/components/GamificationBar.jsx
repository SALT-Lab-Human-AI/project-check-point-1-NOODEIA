"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Sparkles, TrendingUp, Award } from "lucide-react"
import {
  getLevelFromXP,
  getLevelProgress,
  getXPRangeForCurrentLevel,
  formatXP
} from "../utils/levelingSystem"

export default function GamificationBar({ currentUser, xpGain, onLevelUp }) {
  const [xp, setXp] = useState(currentUser?.xp || 0)
  const [level, setLevel] = useState(getLevelFromXP(currentUser?.xp || 0))
  const [showXpGain, setShowXpGain] = useState(false)
  const [gainAmount, setGainAmount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Handle XP gain animation
  useEffect(() => {
    if (xpGain > 0) {
      setGainAmount(xpGain)
      setShowXpGain(true)
      setIsAnimating(true)

      const newXp = xp + xpGain
      const oldLevel = level
      const newLevel = getLevelFromXP(newXp)

      // Animate XP increase
      setTimeout(() => {
        setXp(newXp)

        // Check for level up
        if (newLevel > oldLevel) {
          setLevel(newLevel)
          setTimeout(() => {
            if (onLevelUp) {
              onLevelUp(newLevel, oldLevel)
            }
          }, 500)
        }
      }, 300)

      // Hide XP gain display
      setTimeout(() => {
        setShowXpGain(false)
        setIsAnimating(false)
      }, 2000)
    }
  }, [xpGain])

  // Update when user changes
  useEffect(() => {
    if (currentUser) {
      const userXp = currentUser.xp || 0
      setXp(userXp)
      setLevel(getLevelFromXP(userXp))
    }
  }, [currentUser])

  const progress = getLevelProgress(xp)
  const xpRange = getXPRangeForCurrentLevel(xp)
  const xpInCurrentLevel = xpRange.currentLevelXP
  const xpForNextLevel = xpRange.xpNeededForNextLevel

  return (
    <div className="relative w-full">
      <div className="w-full">
        {/* Level and XP Info */}
        <div className="flex flex-col gap-2 mb-2">
          <div className="flex items-center justify-between">
            {/* Level Badge */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-white shadow-md text-xs"
                style={{
                  background: 'linear-gradient(to right, #A57E56, #F6B3DC)'
                }}
              >
                <Trophy className="w-3 h-3" />
                <span className="font-bold">Lvl {level}</span>
              </motion.div>

              {/* Level Up Animation */}
              <AnimatePresence>
                {isAnimating && level > (currentUser?.level || 1) && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-5 h-5 animate-pulse" style={{ color: '#F8C8E2' }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* XP Display */}
            <div className="text-xs text-zinc-600 dark:text-zinc-300">
              <span className="font-semibold">{formatXP(xpInCurrentLevel)}</span>
              <span className="text-zinc-400 dark:text-zinc-500">/{formatXP(xpForNextLevel)}</span>
            </div>
          </div>

          {/* Total XP */}
          <div className="flex items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <Award className="w-3 h-3" />
            <span>Total: {formatXP(xp)} XP</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 bg-zinc-200/50 dark:bg-zinc-700/50 rounded-full overflow-hidden shadow-inner">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
          </div>

          {/* Progress Fill */}
          <motion.div
            className="h-full shadow-lg"
            style={{
              background: 'linear-gradient(to right, #A57E56, #F3E0B0, #FFFDD0, #F7DBEC, #F8C8E2, #F6B3DC)'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              mass: 1
            }}
          >
            {/* Shine Effect */}
            <div className="h-full w-full bg-gradient-to-t from-transparent to-white/20" />
          </motion.div>

          {/* Progress Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 drop-shadow-sm">
              {progress.toFixed(1)}% to Level {level + 1}
            </span>
          </div>
        </div>

        {/* XP Gain Animation */}
        <AnimatePresence>
          {showXpGain && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -10, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="absolute right-2 top-0"
            >
              <div className="flex items-center gap-1 px-1.5 py-0.5 text-white rounded-full shadow-md"
                style={{
                  background: 'linear-gradient(to right, #F6B3DC, #F8C8E2)'
                }}
              >
                <TrendingUp className="w-2.5 h-2.5" />
                <span className="text-xs font-bold">+{gainAmount.toFixed(1)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}