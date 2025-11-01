"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface Logo {
  id: number
  name: string
  image: string
  url: string
  size: "small" | "medium" | "large"
  initialX?: number
  initialY?: number
}

const logoData: Logo[] = [
  {
    id: 1,
    name: "OpenAI",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
    url: "https://openai.com",
    size: "large"
  },
  {
    id: 2,
    name: "Google AI",
    image: "https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg",
    url: "https://ai.google.dev",
    size: "medium"
  },
  {
    id: 3,
    name: "Python",
    image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
    url: "https://www.python.org",
    size: "medium"
  },
  {
    id: 4,
    name: "TensorFlow",
    image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
    url: "https://www.tensorflow.org",
    size: "small"
  },
  {
    id: 5,
    name: "Jupyter",
    image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original.svg",
    url: "https://jupyter.org",
    size: "large"
  },
  {
    id: 6,
    name: "GitHub",
    image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
    url: "https://github.com",
    size: "medium"
  },
  {
    id: 7,
    name: "VS Code",
    image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
    url: "https://code.visualstudio.com",
    size: "small"
  },
  {
    id: 8,
    name: "MongoDB",
    image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
    url: "https://mongodb.com",
    size: "medium"
  },
  {
    id: 9,
    name: "NumPy",
    image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg",
    url: "https://numpy.org",
    size: "small"
  },
  {
    id: 10,
    name: "React",
    image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    url: "https://react.dev",
    size: "medium"
  },
  {
    id: 11,
    name: "Docker",
    image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
    url: "https://docker.com",
    size: "small"
  },
  {
    id: 12,
    name: "Kubernetes",
    image: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
    url: "https://kubernetes.io",
    size: "medium"
  }
]

const sizeMap = {
  small: { width: 50, height: 50 },
  medium: { width: 70, height: 70 },
  large: { width: 90, height: 90 }
}

export function FloatingLogos() {
  const [logos, setLogos] = useState<Logo[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    // Initialize logos with random positions
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setContainerSize({ width: rect.width, height: rect.height })

      const initializedLogos = logoData.map(logo => ({
        ...logo,
        initialX: Math.random() * (rect.width - sizeMap[logo.size].width),
        initialY: Math.random() * (rect.height - sizeMap[logo.size].height)
      }))
      setLogos(initializedLogos)
    }

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <AnimatePresence>
        {logos.map((logo) => (
          <FloatingLogo
            key={logo.id}
            logo={logo}
            containerSize={containerSize}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface FloatingLogoProps {
  logo: Logo
  containerSize: { width: number; height: number }
}

function FloatingLogo({ logo, containerSize }: FloatingLogoProps) {
  const size = sizeMap[logo.size]
  const [isHovered, setIsHovered] = useState(false)

  // Generate random animation path
  const generatePath = () => {
    const margin = 50
    const maxX = containerSize.width - size.width - margin
    const maxY = containerSize.height - size.height - margin

    return {
      x: [
        logo.initialX || Math.random() * maxX,
        Math.random() * maxX,
        Math.random() * maxX,
        Math.random() * maxX,
        logo.initialX || Math.random() * maxX
      ],
      y: [
        logo.initialY || Math.random() * maxY,
        Math.random() * maxY,
        Math.random() * maxY,
        Math.random() * maxY,
        logo.initialY || Math.random() * maxY
      ],
      rotate: [0, 5, -5, 3, 0]
    }
  }

  const animationPath = containerSize.width > 0 ? generatePath() : { x: 0, y: 0, rotate: 0 }
  const duration = 25 + Math.random() * 15 // 25-40 seconds for slower, smoother movement

  return (
    <motion.a
      href={logo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute pointer-events-auto cursor-pointer group"
      initial={{
        opacity: 0,
        x: logo.initialX || 0,
        y: logo.initialY || 0,
        scale: 0.8
      }}
      animate={{
        ...animationPath,
        opacity: isHovered ? 0.95 : 0.6,
        scale: 1
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        opacity: { duration: 0.4 },
        scale: { duration: 1.5, delay: Math.random() * 2 }
      }}
      whileHover={{
        scale: 1.15,
        zIndex: 1000
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        width: size.width,
        height: size.height
      }}
    >
      {/* Logo image with soft background */}
      <div className="relative w-full h-full">
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/85 to-gray-100/80 backdrop-blur-md rounded-2xl shadow-md transition-all duration-500 group-hover:from-white group-hover:to-gray-50 group-hover:shadow-xl"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.5)'
          }}
        />
        <div className="absolute inset-3 flex items-center justify-center">
          <img
            src={logo.image}
            alt={logo.name}
            className="w-full h-full object-contain transition-all duration-300"
            style={{
              filter: isHovered ? "grayscale(0%) brightness(1.1)" : "grayscale(20%) brightness(0.95)",
              opacity: isHovered ? 1 : 0.85
            }}
          />
        </div>
      </div>

      {/* Elegant tooltip */}
      <motion.div
        className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-lg"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: isHovered ? 1 : 0, y: 0 }}
        style={{
          fontSize: '11px',
          fontWeight: 500
        }}
      >
        {logo.name}
      </motion.div>
    </motion.a>
  )
}

export default FloatingLogos