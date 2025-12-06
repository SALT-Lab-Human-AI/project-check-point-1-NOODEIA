"use client"

import { motion } from "framer-motion"

interface NoodeiaLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function NoodeiaLogo({ size = "md", showText = true, className = "" }: NoodeiaLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {/* Brain/AI SVG Logo */}
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Brain outline */}
          <motion.path
            d="M 50,75
               C 30,75 20,65 20,50
               C 20,40 25,35 30,35
               C 32,25 40,20 50,20
               C 60,20 68,25 70,35
               C 75,35 80,40 80,50
               C 80,65 70,75 50,75"
            fill="none"
            stroke="#440D0F"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Brain sections */}
          <motion.path
            d="M 35,45 C 35,40 40,38 45,40 S 55,38 55,45"
            fill="none"
            stroke="#84596b"
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          <motion.path
            d="M 35,55 C 35,50 40,48 45,50 S 55,48 55,55"
            fill="none"
            stroke="#84596b"
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          />

          {/* Neural connections - dots */}
          <motion.circle
            cx="30"
            cy="40"
            r="2"
            fill="#440D0F"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 1 }}
          />
          <motion.circle
            cx="70"
            cy="40"
            r="2"
            fill="#440D0F"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 1.1 }}
          />
          <motion.circle
            cx="50"
            cy="30"
            r="2"
            fill="#440D0F"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 1.2 }}
          />

          {/* Sparkle/AI effect */}
          <motion.path
            d="M 60,35 L 62,37 L 65,35 L 62,33 Z"
            fill="#FFA500"
            initial={{ scale: 0, rotate: 0 }}
            animate={{
              scale: [0, 1, 1, 0],
              rotate: [0, 45, 90, 180]
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 1
            }}
          />

          <motion.path
            d="M 35,60 L 37,62 L 40,60 L 37,58 Z"
            fill="#FFD700"
            initial={{ scale: 0, rotate: 0 }}
            animate={{
              scale: [0, 1, 1, 0],
              rotate: [0, -45, -90, -180]
            }}
            transition={{
              duration: 3,
              delay: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 1
            }}
          />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#440D0F" />
              <stop offset="100%" stopColor="#84596b" />
            </linearGradient>
          </defs>
        </motion.svg>
      </motion.div>

      {showText && (
        <motion.span
          className={`font-display font-semibold text-gray-800 ${textSizeClasses[size]}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Noodeia
        </motion.span>
      )}
    </div>
  )
}

export function NoodeiaIcon({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Simplified brain */}
        <path
          d="M 50,70 C 30,70 20,60 20,45 C 20,35 25,30 30,30 C 32,20 40,15 50,15 C 60,15 68,20 70,30 C 75,30 80,35 80,45 C 80,60 70,70 50,70"
          fill="#84596b"
        />
        <circle cx="35" cy="35" r="2" fill="#440D0F" />
        <circle cx="65" cy="35" r="2" fill="#440D0F" />
        <circle cx="50" cy="25" r="2" fill="#440D0F" />
      </svg>
    </motion.div>
  )
}