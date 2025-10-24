"use client"
import { motion } from "framer-motion"

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes with yellow/orange/green colors */}
      {[...Array(12)].map((_, i) => {
        const colors = [
          "from-yellow-400/30 to-orange-400/30",
          "from-orange-400/30 to-red-400/30",
          "from-green-400/30 to-emerald-400/30",
          "from-lime-400/30 to-green-400/30",
          "from-amber-400/30 to-yellow-400/30",
          "from-emerald-400/30 to-teal-400/30",
          "from-indigo-400/30 to-purple-400/30",
          "from-pink-400/30 to-rose-400/30",
        ]
        const shapes = ["rounded-full", "rounded-lg", "rounded-xl", "rounded-2xl"]
        const sizes = ["w-8 h-8", "w-10 h-10", "w-12 h-12", "w-14 h-14", "w-16 h-16"]

        // Use deterministic positions based on index to avoid hydration mismatch
        const positions = [
          { x: "10%", y: "15%" },
          { x: "85%", y: "20%" },
          { x: "15%", y: "70%" },
          { x: "70%", y: "80%" },
          { x: "30%", y: "40%" },
          { x: "60%", y: "60%" },
          { x: "90%", y: "50%" },
          { x: "20%", y: "90%" },
          { x: "45%", y: "25%" },
          { x: "75%", y: "45%" },
          { x: "5%", y: "45%" },
          { x: "50%", y: "85%" },
        ]

        return (
          <motion.div
            key={i}
            className={`absolute ${sizes[i % sizes.length]} bg-gradient-to-br ${colors[i % colors.length]} ${shapes[i % shapes.length]}`}
            style={{
              left: positions[i].x,
              top: positions[i].y,
            }}
            initial={{
              rotate: 0,
              scale: 0,
              opacity: 0,
            }}
            animate={{
              rotate: [0, 360],
              scale: [0.5, 1, 0.8, 1.2, 0.5],
              opacity: [0.3, 0.6, 0.8, 0.6, 0.3],
            }}
            transition={{
              duration: 20 + (i * 1.5), // Deterministic duration based on index
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.2, // Stagger the animations
            }}
          />
        )
      })}
    </div>
  )
}

export function ThinkingBubbles({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="flex items-center gap-2"
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-red-400"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.5,
            delay: 0.3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            delay: 0.6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  )
}

export function CreativeIllustration() {
  return (
    <motion.div
      className="relative w-64 h-64 mx-auto"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Creative workspace illustration */}

        {/* Desk */}
        <motion.rect
          x="20"
          y="140"
          width="160"
          height="40"
          rx="5"
          fill="url(#deskGradient)"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        {/* Monitor */}
        <motion.rect
          x="60"
          y="80"
          width="80"
          height="50"
          rx="3"
          fill="#2a2a2a"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 80, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />
        <motion.rect
          x="65"
          y="85"
          width="70"
          height="40"
          rx="2"
          fill="url(#screenGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        />

        {/* 3D elements on screen */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <rect x="70" y="90" width="15" height="15" fill="#FFD700" opacity="0.8" />
          <circle cx="95" cy="97" r="7" fill="#32CD32" opacity="0.8" />
          <polygon points="110,90 125,90 117,105" fill="#FFA500" opacity="0.8" />
        </motion.g>

        {/* Coffee cup */}
        <motion.g
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <ellipse cx="40" cy="120" rx="8" ry="12" fill="url(#cupGradient)" />
          <ellipse cx="40" cy="115" rx="6" ry="2" fill="#8B4513" />
          <path d="M48 118 Q52 118, 52 122 Q52 126, 48 126" fill="none" stroke="#D2691E" strokeWidth="1.5" />

          {/* Steam */}
          <motion.g
            animate={{
              y: [0, -3, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <path
              d="M38 108 Q38 105, 40 105 Q42 105, 42 108"
              fill="none"
              stroke="#FFA500"
              strokeWidth="1"
              opacity="0.7"
            />
            <path
              d="M40 106 Q40 103, 42 103 Q44 103, 44 106"
              fill="none"
              stroke="#FFD700"
              strokeWidth="1"
              opacity="0.5"
            />
          </motion.g>
        </motion.g>

        {/* Plant */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 1, type: "spring" }}
        >
          <ellipse cx="160" cy="130" rx="8" ry="6" fill="#8B4513" />
          <path d="M160 125 Q155 115, 150 110 Q155 115, 160 120 Q165 115, 170 110 Q165 115, 160 125" fill="#32CD32" />
          <path d="M160 120 Q150 110, 145 105 Q150 110, 160 115 Q170 110, 175 105 Q170 110, 160 120" fill="#228B22" />
        </motion.g>

        {/* Floating design elements */}
        <motion.g
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <circle cx="30" cy="60" r="3" fill="#FFD700" opacity="0.6" />
          <rect x="170" y="50" width="6" height="6" fill="#32CD32" opacity="0.6" />
          <polygon points="180,70 185,70 182.5,75" fill="#FFA500" opacity="0.6" />
        </motion.g>

        {/* Gradients */}
        <defs>
          <linearGradient id="deskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D2B48C" />
            <stop offset="100%" stopColor="#8B7355" />
          </linearGradient>
          <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A90E2" />
            <stop offset="50%" stopColor="#7B68EE" />
            <stop offset="100%" stopColor="#9370DB" />
          </linearGradient>
          <linearGradient id="cupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5F5DC" />
            <stop offset="100%" stopColor="#D2B48C" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  )
}

export function PulsatingOrb({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`rounded-full bg-gradient-to-r from-thinky-primary to-thinky-tertiary ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    />
  )
}

export function LoadingSpinner() {
  return (
    <motion.div
      className="w-8 h-8 border-3 border-thinky-light border-t-thinky-primary rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
    />
  )
}

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full h-2 bg-thinky-light/30 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-thinky-primary to-thinky-tertiary"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  )
}

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400/5 to-orange-400/5 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/5 to-emerald-400/5 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-r from-amber-400/3 to-lime-400/3 rounded-full blur-3xl"
        animate={{
          x: [-100, 100, -100],
          y: [-50, 50, -50],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
