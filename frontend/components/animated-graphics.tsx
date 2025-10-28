"use client"
import { motion } from "framer-motion"

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes with yellow/orange/green colors */}
      {[...Array(12)].map((_, i) => {
        const colors = [
          "from-yellow-400/20 to-orange-400/20",
          "from-orange-400/20 to-red-400/20",
          "from-green-400/20 to-emerald-400/20",
          "from-lime-400/20 to-green-400/20",
          "from-amber-400/20 to-yellow-400/20",
          "from-emerald-400/20 to-teal-400/20",
          "from-indigo-400/20 to-purple-400/20",
          "from-pink-400/20 to-rose-400/20",
          "from-blue-400/20 to-cyan-400/20",
          "from-violet-400/20 to-fuchsia-400/20",
        ]

        // Mix of circles (rounded-full), squares (rounded-lg), and triangles
        const shapeTypes = ["circle", "square", "triangle", "circle", "square"]
        const currentShape = shapeTypes[i % shapeTypes.length]

        const sizes = ["w-6 h-6", "w-8 h-8", "w-10 h-10", "w-12 h-12", "w-14 h-14", "w-16 h-16", "w-20 h-20"]

        const positions = [
          { x: "5%", y: "15%" },
          { x: "15%", y: "70%" },
          { x: "85%", y: "20%" },
          { x: "75%", y: "60%" },
          { x: "10%", y: "45%" },
          { x: "90%", y: "40%" },
          { x: "25%", y: "25%" },
          { x: "65%", y: "75%" },
          { x: "45%", y: "15%" },
          { x: "35%", y: "55%" },
          { x: "55%", y: "35%" },
          { x: "20%", y: "80%" },
        ]

        // For triangles, we'll use a different approach
        if (currentShape === "triangle") {
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: positions[i].x,
                top: positions[i].y,
                width: 0,
                height: 0,
                borderLeft: "18px solid transparent",
                borderRight: "18px solid transparent",
                borderBottom: `30px solid rgba(${i % 2 === 0 ? '251, 191, 36' : i % 3 === 0 ? '34, 197, 94' : '249, 115, 22'}, 0.7)`,
              }}
              initial={{
                rotate: 0,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                rotate: [0, 360],
                scale: [0.6, 1.1, 0.9, 1.3, 0.6],
                opacity: [0.5, 0.7, 0.9, 0.7, 0.5],
              }}
              transition={{
                duration: 8 + (i * 1),
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          )
        }

        // For circles and squares
        const shapeClass = currentShape === "circle" ? "rounded-full" : "rounded-lg"

        return (
          <motion.div
            key={i}
            className={`absolute ${sizes[i % sizes.length]} bg-gradient-to-br ${colors[i % colors.length]} ${shapeClass}`}
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
              scale: [0.6, 1.1, 0.9, 1.3, 0.6],
              opacity: [0.5, 0.7, 0.9, 0.7, 0.5],
            }}
            transition={{
              duration: 8 + (i * 1),
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        )
      })}
    </div>
  )
}

// Floating elements for logo section - only left and center positions (no right side)
export function FloatingElementsLeftCenter() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes - left and center only */}
      {[...Array(12)].map((_, i) => {
        const colors = [
          "from-yellow-400/20 to-orange-400/20",
          "from-orange-400/20 to-red-400/20",
          "from-green-400/20 to-emerald-400/20",
          "from-lime-400/20 to-green-400/20",
          "from-amber-400/20 to-yellow-400/20",
          "from-emerald-400/20 to-teal-400/20",
          "from-indigo-400/20 to-purple-400/20",
          "from-pink-400/20 to-rose-400/20",
          "from-blue-400/20 to-cyan-400/20",
          "from-violet-400/20 to-fuchsia-400/20",
        ]

        const shapeTypes = ["circle", "square", "triangle", "circle", "square"]
        const currentShape = shapeTypes[i % shapeTypes.length]

        const sizes = ["w-6 h-6", "w-8 h-8", "w-10 h-10", "w-12 h-12", "w-14 h-14", "w-16 h-16", "w-20 h-20"]

        // Only left (5%-25%) and center (30%-50%) positions - NO right side
        const positions = [
          { x: "5%", y: "15%" },
          { x: "15%", y: "70%" },
          { x: "10%", y: "45%" },
          { x: "25%", y: "25%" },
          { x: "45%", y: "15%" },
          { x: "35%", y: "55%" },
          { x: "20%", y: "80%" },
          { x: "40%", y: "65%" },
          { x: "30%", y: "35%" },
          { x: "12%", y: "55%" },
          { x: "50%", y: "75%" },
          { x: "8%", y: "30%" },
        ]

        if (currentShape === "triangle") {
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: positions[i].x,
                top: positions[i].y,
                width: 0,
                height: 0,
                borderLeft: "15px solid transparent",
                borderRight: "15px solid transparent",
                borderBottom: `25px solid rgba(${i % 2 === 0 ? '251, 191, 36' : i % 3 === 0 ? '34, 197, 94' : '249, 115, 22'}, 0.5)`,
              }}
              initial={{
                rotate: 0,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                rotate: [0, 360],
                scale: [0.5, 1, 0.8, 1.2, 0.5],
                opacity: [0.3, 0.5, 0.7, 0.5, 0.3],
              }}
              transition={{
                duration: 8 + (i * 1),
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          )
        }

        const shapeClass = currentShape === "circle" ? "rounded-full" : "rounded-lg"

        return (
          <motion.div
            key={i}
            className={`absolute ${sizes[i % sizes.length]} bg-gradient-to-br ${colors[i % colors.length]} ${shapeClass}`}
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
              opacity: [0.3, 0.5, 0.7, 0.5, 0.3],
            }}
            transition={{
              duration: 8 + (i * 1),
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.2,
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

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Animated gradient blobs with increased visibility */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-yellow-400/50 to-orange-400/50 blur-[100px]"
          initial={{
            x: -100,
            y: -100,
            scale: 1,
          }}
          animate={{
            x: [-100, -50, -100],
            y: [-100, -50, -100],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-green-400/50 to-lime-400/50 blur-[120px]"
          initial={{
            x: 100,
            y: 0,
            scale: 1,
          }}
          animate={{
            x: [100, 50, 100],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 w-[550px] h-[550px] rounded-full bg-gradient-to-r from-orange-400/50 to-red-400/50 blur-[110px]"
          initial={{
            x: 0,
            y: 100,
            scale: 1,
          }}
          animate={{
            x: [0, 60, 0],
            y: [100, 50, 100],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 16,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>
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
          initial={{ scale: 0, transformOrigin: "bottom center" }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <rect x="150" y="125" width="15" height="5" rx="2" fill="#654321" />
          <path d="M158 125 Q158 115, 155 110" fill="none" stroke="#228B22" strokeWidth="2" />
          <ellipse cx="155" cy="108" rx="6" ry="8" fill="url(#leafGradient)" />
          <ellipse cx="160" cy="112" rx="5" ry="7" fill="url(#leafGradient)" transform="rotate(15 160 112)" />
          <ellipse cx="150" cy="112" rx="5" ry="7" fill="url(#leafGradient)" transform="rotate(-15 150 112)" />
        </motion.g>

        {/* Floating creative elements */}
        <motion.g
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <circle cx="30" cy="60" r="4" fill="#FFB6C1" opacity="0.7" />
          <rect x="50" y="55" width="8" height="8" fill="#87CEEB" opacity="0.7" transform="rotate(45 54 59)" />
          <polygon points="160,60 165,50 170,60" fill="#98FB98" opacity="0.7" />
        </motion.g>

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="deskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D2691E" />
            <stop offset="100%" stopColor="#8B4513" />
          </linearGradient>
          <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#87CEEB" />
            <stop offset="100%" stopColor="#4169E1" />
          </linearGradient>
          <linearGradient id="cupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D2691E" />
            <stop offset="100%" stopColor="#A0522D" />
          </linearGradient>
          <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#90EE90" />
            <stop offset="100%" stopColor="#228B22" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  )
}