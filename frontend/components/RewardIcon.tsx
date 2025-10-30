"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface RewardIconProps {
  type: 'common' | 'rare' | 'legendary';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
}

export default function RewardIcon({ type, size = 'md', animate = false }: RewardIconProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-3xl',
    md: 'w-16 h-16 text-4xl',
    lg: 'w-24 h-24 text-6xl',
    xl: 'w-32 h-32 text-8xl'
  };

  const iconData = {
    common: {
      emoji: '⭐',
      gradient: 'linear-gradient(135deg, #E4B953 0%, #F8EAC1 100%)',
      glowColor: 'rgba(228, 185, 83, 0.6)',
      shadowColor: 'rgba(228, 185, 83, 0.4)'
    },
    rare: {
      emoji: '💎',
      gradient: 'linear-gradient(135deg, #FAB9CA 0%, #F8C8E2 100%)',
      glowColor: 'rgba(250, 185, 202, 0.6)',
      shadowColor: 'rgba(250, 185, 202, 0.5)'
    },
    legendary: {
      emoji: '👑',
      gradient: 'linear-gradient(135deg, #F58FA8 0%, #FAB9CA 100%)',
      glowColor: 'rgba(245, 143, 168, 0.8)',
      shadowColor: 'rgba(245, 143, 168, 0.6)'
    }
  };

  const data = iconData[type];

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} flex items-center justify-center`}
      style={{
        perspective: '500px',
        transformStyle: 'preserve-3d',
      }}
      animate={
        animate
          ? {
              rotateY: [0, 15, -15, 0],
              scale: [1, 1.05, 1],
            }
          : {}
      }
      transition={
        animate
          ? {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : {}
      }
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-50"
        style={{
          background: `radial-gradient(circle, ${data.glowColor}, transparent 70%)`,
        }}
      />

      {/* Circular gradient background */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: data.gradient,
          boxShadow: `
            0 8px 32px ${data.shadowColor},
            inset -8px -8px 16px rgba(0, 0, 0, 0.2),
            inset 8px 8px 16px rgba(255, 255, 255, 0.4)
          `,
        }}
      >
        {/* Top highlight */}
        <div
          className="absolute rounded-full"
          style={{
            top: '10%',
            left: '20%',
            width: '40%',
            height: '40%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
            filter: 'blur(10px)',
          }}
        />

        {/* Bottom shadow */}
        <div
          className="absolute rounded-full"
          style={{
            bottom: '5%',
            right: '15%',
            width: '45%',
            height: '45%',
            background: 'radial-gradient(circle, rgba(0, 0, 0, 0.2) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
      </div>

      {/* Icon layers for 3D depth */}
      <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
        {/* Deep shadow layer */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center opacity-10"
          style={{
            transform: 'translateZ(-40px) scale(1.15)',
            filter: 'blur(10px)',
          }}
          animate={
            animate
              ? {
                  opacity: [0.1, 0.15, 0.1],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          {data.emoji}
        </motion.div>

        {/* Mid shadow layer */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center opacity-25"
          style={{
            transform: 'translateZ(-20px) scale(1.08)',
            filter: 'blur(6px)',
          }}
          animate={
            animate
              ? {
                  opacity: [0.25, 0.35, 0.25],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.3,
          }}
        >
          {data.emoji}
        </motion.div>

        {/* Main icon */}
        <motion.div
          className="relative flex items-center justify-center"
          style={{
            transform: 'translateZ(20px)',
            textShadow: `
              0 2px 10px rgba(0, 0, 0, 0.3),
              0 4px 20px ${data.shadowColor},
              0 0 30px rgba(255, 255, 255, 0.8)
            `,
            filter: `drop-shadow(0 0 15px ${data.glowColor})`,
          }}
          animate={
            animate
              ? {
                  scale: [1, 1.05, 1],
                  filter: [
                    `drop-shadow(0 0 15px ${data.glowColor})`,
                    `drop-shadow(0 0 25px ${data.glowColor}) drop-shadow(0 0 35px rgba(255, 255, 255, 0.8))`,
                    `drop-shadow(0 0 15px ${data.glowColor})`,
                  ],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {data.emoji}
        </motion.div>

        {/* Front highlight layer */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center opacity-40"
          style={{
            transform: 'translateZ(30px) scale(0.95)',
            filter: 'blur(3px)',
            mixBlendMode: 'overlay',
          }}
          animate={
            animate
              ? {
                  opacity: [0.4, 0.7, 0.4],
                  scale: [0.95, 1, 0.95],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.5,
          }}
        >
          {data.emoji}
        </motion.div>

        {/* Sparkle layer */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: 'translateZ(35px) scale(0.9)',
            filter: 'blur(1px)',
            mixBlendMode: 'screen',
          }}
          animate={
            animate
              ? {
                  opacity: [0, 0.6, 0],
                  rotate: [0, 180, 360],
                }
              : {}
          }
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        >
          ✨
        </motion.div>
      </div>
    </motion.div>
  );
}
