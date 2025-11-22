"use client";

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Sparkles, Award } from 'lucide-react'
import {
  getLevelFromXP,
  getLevelProgress,
  getXPRangeForCurrentLevel,
  formatXP
} from '../utils/levelingSystem'

// Animated XP Progress Bar (matches AI interface design)
// Shows level progress and animates from oldXP to newXP
export default function AnimatedXPBar({ currentLevel, oldXP, newXP, nodeType }) {
  const [xp, setXp] = useState(oldXP)
  const [level, setLevel] = useState(getLevelFromXP(oldXP))
  const [showSparkles, setShowSparkles] = useState(false)

  useEffect(() => {
    // Animate XP increase
    const timer = setTimeout(() => {
      setXp(newXP)
      const newLevel = getLevelFromXP(newXP)

      // Check for level up
      if (newLevel > level) {
        setLevel(newLevel)
        setShowSparkles(true)
        setTimeout(() => setShowSparkles(false), 2000)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [newXP, oldXP])

  const progress = getLevelProgress(xp)
  const xpRange = getXPRangeForCurrentLevel(xp)
  const xpInCurrentLevel = xpRange.currentLevelXP
  const xpForNextLevel = xpRange.xpNeededForNextLevel

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.4 }}
      className="relative w-full"
    >
      {/* Glass morphism container - matches AI interface */}
      <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-3 overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/20">
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        <div className="relative w-full">
          {/* Level and XP Info */}
          <div className="flex flex-col gap-2 mb-2">
            <div className="flex items-center justify-between">
              {/* Level Badge */}
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-white shadow-md text-xs backdrop-blur-lg border border-white/30"
                  style={{
                    background: 'linear-gradient(to right, rgba(165, 126, 86, 0.9), rgba(246, 179, 220, 0.9))'
                  }}
                >
                  <Trophy className="w-3 h-3" />
                  <span className="font-bold">Lvl {level}</span>
                </motion.div>

                {/* Level Up Animation */}
                <AnimatePresence>
                  {showSparkles && (
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
              <div className="text-xs text-gray-500 font-medium">
                <span className="font-semibold">{formatXP(xpInCurrentLevel)}</span>
                <span className="text-gray-500">/{formatXP(xpForNextLevel)}</span>
              </div>
            </div>

            {/* Total XP */}
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
              <Award className="w-3 h-3" />
              <span>Total: {formatXP(xp)} XP</span>
            </div>
          </div>

          {/* Progress Bar - matches AI interface */}
          <div className="relative h-4 bg-white/20 backdrop-blur-md rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border border-white/30">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
            </div>

            {/* Progress Fill - same gradient as AI interface */}
            <motion.div
              className="h-full shadow-lg"
              style={{
                background: 'linear-gradient(to right, #A57E56, #F3E0B0, #FFFDD0, #F7DBEC, #F8C8E2, #F6B3DC)'
              }}
              initial={{ width: `${getLevelProgress(oldXP)}%` }}
              animate={{ width: `${progress}%` }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                mass: 1,
                delay: 0.2
              }}
            >
              {/* Shine Effect */}
              <div className="h-full w-full bg-gradient-to-t from-transparent to-white/20" />
            </motion.div>

            {/* Progress Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-500 drop-shadow-sm">
                {progress.toFixed(1)}% to Level {level + 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* XP Gained Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0 }}
        className="text-center mt-2 text-xs text-gray-500"
      >
        +{Math.round(newXP - oldXP)} XP earned
      </motion.div>

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
    </motion.div>
  )
}
