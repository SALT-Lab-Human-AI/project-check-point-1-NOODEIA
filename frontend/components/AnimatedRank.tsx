"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AnimatedRankProps {
  rank: number | null;
  className?: string;
}

export default function AnimatedRank({ rank, className = '' }: AnimatedRankProps) {
  const [displayRank, setDisplayRank] = useState<number | null>(rank);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (rank === null) {
      setDisplayRank(null);
      return;
    }

    setIsAnimating(true);
    
    // Animate counting up from 0 (or previous rank) to target rank
    const startRank = displayRank || 0;
    const endRank = rank;
    const duration = 1200; // 1.2 seconds
    const steps = 30;
    const stepDuration = duration / steps;
    const stepValue = (endRank - startRank) / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const newValue = Math.floor(startRank + stepValue * currentStep);
      setDisplayRank(newValue);

      if (currentStep >= steps) {
        setDisplayRank(endRank);
        clearInterval(interval);
        setTimeout(() => setIsAnimating(false), 200);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [rank]);

  if (rank === null) {
    return (
      <div className={`text-5xl font-black text-pink-600 ${className}`}>-</div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Sparkles background effect */}
      <AnimatePresence>
        {isAnimating && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  rotate: 360,
                  x: Math.cos((i * Math.PI * 2) / 8) * 60,
                  y: Math.sin((i * Math.PI * 2) / 8) * 60,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              >
                <Sparkles className="w-4 h-4 text-pink-400" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Pulsing glow effect */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-full blur-2xl"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.4), transparent 70%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main rank number with multiple animation layers */}
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{
          scale: isAnimating ? [1, 1.2, 1, 1.1, 1] : 1,
          rotate: 0,
          opacity: 1,
        }}
        transition={{
          scale: {
            duration: 1.2,
            times: [0, 0.3, 0.6, 0.8, 1],
            ease: 'easeOut',
          },
          rotate: {
            duration: 0.8,
            ease: 'backOut',
          },
          opacity: {
            duration: 0.4,
          },
        }}
      >
        {/* Rotating gradient background - optimized with transform */}
        <motion.div
          className="absolute inset-0 rounded-2xl blur-xl opacity-30"
          style={{
            background: 'linear-gradient(45deg, #ec4899, #8b5cf6, #ec4899)',
            willChange: 'transform',
            transform: 'translateZ(0)', // Force GPU acceleration
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Rank number with shine effect */}
        <motion.div
          className="relative text-5xl font-black text-pink-600"
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 30px rgba(236,72,153,0.5)',
            willChange: 'transform, filter',
          }}
          animate={{
            filter: isAnimating
              ? ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
              : ['brightness(1)', 'brightness(1.2)', 'brightness(1)'],
            scale: [1, 1.02, 1],
            y: [0, -2, 0],
          }}
          transition={{
            filter: {
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            y: {
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          #{displayRank}
        </motion.div>

        {/* Optimized shine overlay animation using transform (GPU-accelerated) */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)', // Force GPU acceleration
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)',
              width: '50%',
              height: '100%',
            }}
            animate={{
              x: ['-100%', '300%'],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Floating particles for top ranks */}
      {rank <= 3 && (
        <AnimatePresence>
          {[...Array(rank === 1 ? 12 : rank === 2 ? 8 : 6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.cos((i * Math.PI * 2) / (rank === 1 ? 12 : rank === 2 ? 8 : 6)) * (30 + Math.random() * 20),
                y: Math.sin((i * Math.PI * 2) / (rank === 1 ? 12 : rank === 2 ? 8 : 6)) * (30 + Math.random() * 20),
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            >
              <div
                className="w-1 h-1 rounded-full"
                style={{
                  background: rank === 1 ? '#fbbf24' : rank === 2 ? '#9ca3af' : '#f97316',
                  boxShadow: `0 0 ${rank === 1 ? '8px' : '6px'} ${rank === 1 ? '#fbbf24' : rank === 2 ? '#9ca3af' : '#f97316'}`,
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

