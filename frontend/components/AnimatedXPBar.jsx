"use client";

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// Animated XP Progress Bar
// Shows level progress and animates from oldXP to newXP
export default function AnimatedXPBar({ currentLevel, oldXP, newXP, nodeType }) {
  const [progress, setProgress] = useState(0)

  // Calculate XP within current level (0-100)
  const oldXpInLevel = oldXP % 100
  const newXpInLevel = newXP % 100

  useEffect(() => {
    // Animate progress bar filling from old to new
    const timer = setTimeout(() => {
      setProgress((newXpInLevel / 100) * 100)
    }, 100)

    return () => clearTimeout(timer)
  }, [newXpInLevel])

  const barColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    legendary: 'from-yellow-400 via-orange-500 to-red-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.4 }}
      className="w-full"
    >
      {/* Level Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-gray-700">Level {currentLevel}</span>
        <span className="text-sm font-semibold text-gray-600">
          {Math.round(newXpInLevel)}/100 XP
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
        {/* Animated Fill */}
        <motion.div
          className={`h-full bg-gradient-to-r ${barColors[nodeType]} rounded-full`}
          initial={{ width: `${(oldXpInLevel / 100) * 100}%` }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 1.5,
            delay: 0.2,
            ease: 'easeOut'
          }}
        />

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* XP Gained Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0 }}
        className="text-center mt-2 text-xs text-gray-500"
      >
        +{newXP - oldXP} XP earned
      </motion.div>
    </motion.div>
  )
}
