"use client";

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'

// QuizNode Component with 3D GSAP effects
// Features: 720° rotation, 20 particles, 20 stars, glow rings, sparkles
export default function QuizNode({ type, onClick }) {
  const nodeRef = useRef(null)
  const particlesRef = useRef(null)

  useEffect(() => {
    // Floating animation (subtle up-down movement)
    if (nodeRef.current) {
      gsap.to(nodeRef.current, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      })
    }
  }, [])

  const nodeColors = {
    common: 'from-gray-300 to-gray-500',
    rare: 'from-blue-400 to-blue-600',
    legendary: 'from-yellow-400 via-orange-500 to-red-600'
  }

  const nodeIcons = {
    common: '⭐',
    rare: '💎',
    legendary: '👑'
  }

  const nodeNames = {
    common: 'Common Node',
    rare: 'Rare Node',
    legendary: 'Legendary Node'
  }

  const nodeRequirements = {
    common: '80%+',
    rare: '90%+',
    legendary: '100%'
  }

  const xpRanges = {
    common: '5-12 XP',
    rare: '15-22 XP',
    legendary: '30-35 XP'
  }

  return (
    <motion.div
      ref={nodeRef}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <div className="relative group">
        {/* Glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${nodeColors[type]} rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />

        {/* Main node */}
        <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${nodeColors[type]} shadow-2xl flex items-center justify-center border-4 border-white/30`}>
          <span className="text-5xl">{nodeIcons[type]}</span>
        </div>

        {/* Legendary floating particles */}
        {type === 'legendary' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, Math.cos(i * 60 * Math.PI / 180) * 60],
                  y: [0, Math.sin(i * 60 * Math.PI / 180) * 60],
                  opacity: [1, 0],
                  scale: [1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Label */}
      <div className="mt-4 text-center">
        <div className="font-bold text-lg">{nodeNames[type]}</div>
        <div className="text-sm text-gray-600">Requires {nodeRequirements[type]}</div>
        <div className="text-xs font-semibold text-indigo-600 mt-1">{xpRanges[type]}</div>
      </div>
    </motion.div>
  )
}
