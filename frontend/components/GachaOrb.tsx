"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GachaOrbProps {
  nodeType: 'common' | 'rare' | 'legendary';
  onOpen: () => void;
}

export default function GachaOrb({ nodeType, onOpen }: GachaOrbProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showCracks, setShowCracks] = useState(false);

  // Color schemes for each node type
  const orbColors = {
    common: {
      primary: '#E4B953',
      secondary: '#F8EAC1',
      glow: 'rgba(228, 185, 83, 0.6)',
      particles: '#F8EAC1'
    },
    rare: {
      primary: '#FAB9CA',
      secondary: '#F8C8E2',
      glow: 'rgba(250, 185, 202, 0.6)',
      particles: '#F8C8E2'
    },
    legendary: {
      primary: '#F58FA8',
      secondary: '#FAB9CA',
      glow: 'rgba(245, 143, 168, 0.8)',
      particles: '#FFD700'
    }
  };

  const colors = orbColors[nodeType];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isClicked) return;
    setIsClicked(true);
    setShowCracks(true);

    // Trigger opening animation and callback
    setTimeout(() => {
      try {
        onOpen();
      } catch (error) {
        console.error('Error opening orb:', error);
      }
    }, 1500);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1200px' }}>
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              backgroundColor: colors.particles,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main orb container */}
      <motion.div
        className="relative cursor-pointer"
        style={{
          width: '280px',
          height: '280px',
          transformStyle: 'preserve-3d',
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onTap={handleClick}
        whileTap={{ scale: 0.98 }}
        animate={{
          // Idle shake animation
          rotateY: isClicked ? 0 : [0, -5, 5, -3, 3, 0],
          rotateX: isClicked ? 0 : [0, 2, -2, 1, -1, 0],
          scale: isHovered && !isClicked ? 1.1 : 1,
        }}
        transition={{
          rotateY: {
            duration: 2,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: 'easeInOut',
          },
          rotateX: {
            duration: 2,
            repeat: Infinity,
            repeatDelay: 0.5,
            ease: 'easeInOut',
          },
          scale: {
            duration: 0.3,
            ease: 'easeOut',
          },
        }}
      >
        {/* Outer glow rings */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl opacity-60"
          style={{
            background: `radial-gradient(circle, ${colors.glow}, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute inset-4 rounded-full blur-2xl opacity-70"
          style={{
            background: `radial-gradient(circle, ${colors.glow}, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.5,
            ease: 'easeInOut',
          }}
        />

        {/* Main sphere with gradient and highlights */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            boxShadow: `
              0 0 40px ${colors.glow},
              inset -20px -20px 40px rgba(0, 0, 0, 0.2),
              inset 20px 20px 40px rgba(255, 255, 255, 0.4)
            `,
            transformStyle: 'preserve-3d',
          }}
          animate={
            isClicked
              ? {
                  scale: [1, 1.2, 0.8],
                  opacity: [1, 1, 0],
                }
              : {}
          }
          transition={
            isClicked
              ? {
                  duration: 1.5,
                  ease: 'easeInOut',
                }
              : {}
          }
        >
          {/* Top highlight */}
          <div
            className="absolute rounded-full"
            style={{
              top: '15%',
              left: '25%',
              width: '35%',
              height: '35%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />

          {/* Bottom shadow */}
          <div
            className="absolute rounded-full"
            style={{
              bottom: '10%',
              right: '20%',
              width: '40%',
              height: '40%',
              background: 'radial-gradient(circle, rgba(0, 0, 0, 0.3) 0%, transparent 70%)',
              filter: 'blur(15px)',
            }}
          />

          {/* Cracks overlay when clicked */}
          <AnimatePresence>
            {showCracks && (
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Crack lines */}
                {[...Array(12)].map((_, i) => {
                  const angle = (i / 12) * 360;
                  return (
                    <motion.div
                      key={i}
                      className="absolute bg-black/40"
                      style={{
                        width: '2px',
                        height: '50%',
                        left: '50%',
                        top: '50%',
                        transformOrigin: 'top center',
                        transform: `translate(-50%, 0) rotate(${angle}deg)`,
                      }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: i * 0.03,
                        ease: 'easeOut',
                      }}
                    />
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Rotating sparkles around orb */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {[...Array(16)].map((_, i) => {
            const angle = (i / 16) * 360;
            const radius = 140;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: '6px',
                  height: '6px',
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${Math.cos((angle * Math.PI) / 180) * radius}px, ${Math.sin((angle * Math.PI) / 180) * radius}px)`,
                  boxShadow: `0 0 10px ${colors.particles}`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
        </motion.div>

        {/* Center icon/symbol */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-8xl"
          style={{
            textShadow: '0 0 20px rgba(255, 255, 255, 0.8)',
            filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.8))',
          }}
          animate={{
            scale: isHovered ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: isHovered ? Infinity : 0,
          }}
        >
          {nodeType === 'common' && '⭐'}
          {nodeType === 'rare' && '💎'}
          {nodeType === 'legendary' && '👑'}
        </motion.div>

        {/* Click prompt */}
        {!isClicked && (
          <motion.div
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
            animate={{
              y: [0, -8, 0],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="text-xl font-black text-gray-700 mb-1">
              Click to Open!
            </div>
            <div className="text-sm text-gray-500">
              Tap the orb to reveal your reward
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Burst particles on click */}
      <AnimatePresence>
        {isClicked && (
          <>
            {[...Array(24)].map((_, i) => {
              const angle = (i / 24) * 360;
              const distance = 200 + Math.random() * 100;
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: Math.random() * 8 + 4 + 'px',
                    height: Math.random() * 8 + 4 + 'px',
                    backgroundColor: colors.particles,
                    left: '50%',
                    top: '50%',
                    boxShadow: `0 0 20px ${colors.particles}`,
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 0,
                  }}
                  animate={{
                    x: Math.cos((angle * Math.PI) / 180) * distance,
                    y: Math.sin((angle * Math.PI) / 180) * distance,
                    opacity: 0,
                    scale: [0, 1.5, 0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1.2,
                    ease: 'easeOut',
                  }}
                />
              );
            })}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
