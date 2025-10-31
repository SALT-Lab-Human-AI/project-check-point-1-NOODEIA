"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import RewardIcon from '@/components/RewardIcon';
import AnimatedXPBar from '@/components/AnimatedXPBar';
import { Zap } from 'lucide-react';

// Orb component with search params
function OrbContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nodeType = (searchParams.get('nodeType') || 'common') as 'common' | 'rare' | 'legendary';
  const xpEarned = parseFloat(searchParams.get('xpEarned') || '0');
  const oldXP = parseFloat(searchParams.get('oldXP') || '0');
  const newXP = parseFloat(searchParams.get('newXP') || '0');
  const currentLevel = parseInt(searchParams.get('currentLevel') || '1');
  const score = parseInt(searchParams.get('score') || '0');
  const totalQuestions = parseInt(searchParams.get('totalQuestions') || '10');

  const [isOrbClicked, setIsOrbClicked] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const cubeColors = {
    common: {
      gradient: 'linear-gradient(to bottom, hsl(45, 80%, 45%) 0%, hsl(45, 85%, 55%) 30%, hsl(45, 90%, 65%) 60%, hsl(45, 95%, 75%) 100%)',
      glow: 'rgba(228, 185, 83, 0.8)',
      shadow: 'rgba(228, 185, 83, 0.6)',
      top: '#E4B953'
    },
    rare: {
      gradient: 'linear-gradient(to bottom, hsl(330, 60%, 60%) 0%, hsl(330, 70%, 70%) 30%, hsl(330, 80%, 80%) 60%, hsl(330, 90%, 90%) 100%)',
      glow: 'rgba(250, 185, 202, 0.8)',
      shadow: 'rgba(250, 185, 202, 0.6)',
      top: '#FAB9CA'
    },
    legendary: {
      gradient: 'linear-gradient(to bottom, hsl(330, 80%, 50%) 0%, hsl(300, 85%, 60%) 25%, hsl(270, 90%, 65%) 50%, hsl(240, 85%, 70%) 75%, hsl(210, 80%, 75%) 100%)',
      glow: 'rgba(245, 143, 168, 1)',
      shadow: 'rgba(245, 143, 168, 0.8)',
      top: '#F58FA8'
    }
  };

  const colors = cubeColors[nodeType];

  const handleOrbClick = () => {
    if (isOrbClicked) return;

    setIsOrbClicked(true);

    // Massive confetti explosion
    setTimeout(() => {
      const particleCount = nodeType === 'legendary' ? 300 : 200;
      const legendaryColors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB', '#FF1493'];

      confetti({
        particleCount,
        spread: nodeType === 'legendary' ? 180 : 160,
        origin: { y: 0.5 },
        colors: nodeType === 'legendary' ? legendaryColors : [colors.top, colors.glow, '#FFD700', '#FFA500']
      });

      // Side bursts (more dramatic for legendary)
      setTimeout(() => {
        const sideBurstCount = nodeType === 'legendary' ? 150 : 100;
        confetti({ particleCount: sideBurstCount, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: sideBurstCount, angle: 120, spread: 55, origin: { x: 1 } });

        // Extra burst for legendary from top
        if (nodeType === 'legendary') {
          setTimeout(() => {
            confetti({ particleCount: 100, angle: 90, spread: 100, origin: { y: 0 } });
          }, 200);
        }
      }, 300);
    }, 800);

    // Show reward card
    setTimeout(() => {
      setShowReward(true);
      setIsFlipping(true);
    }, 1500);
  };

  const handleContinue = () => {
    // Final celebration for legendary
    if (nodeType === 'legendary') {
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FFA500']
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFD700', '#FFA500']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }

    setTimeout(() => {
      router.push('/quiz');
    }, nodeType === 'legendary' ? 2000 : 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-sky-50 flex items-center justify-center p-4 overflow-hidden">
      <AnimatePresence mode="wait">
        {!showReward ? (
          // Orb Stage
          <motion.div
            key="orb"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center"
          >
            {/* Title */}
            <motion.h1
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-black text-center mb-8 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
            >
              Click to Reveal Your Reward!
            </motion.h1>

            {/* Liquid Morphing Orb with SVG Mask - OPTIMIZED FOR 60FPS */}
            <motion.div
              className="relative cursor-pointer flex items-center justify-center"
              style={{
                width: '400px',
                height: '400px',
                willChange: 'transform',
              }}
              onClick={handleOrbClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Outer glow rings - REDUCED to 3 layers for performance */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`glow-${i}`}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${colors.glow}, transparent 70%)`,
                    filter: `blur(${30 + i * 15}px)`,
                    willChange: 'transform, opacity',
                    transform: 'translateZ(0)', // GPU acceleration
                  }}
                  animate={isOrbClicked ? {
                    // Dramatic expansion on click (like Genshin Impact)
                    scale: [1, 3 + i * 0.6, 0],
                    opacity: [0.6, 0.9, 0],
                  } : {
                    // Continuous pulse before click
                    scale: [1, 1.25 + i * 0.15, 1],
                    opacity: [0.4 - i * 0.08, 0.7 - i * 0.08, 0.4 - i * 0.08],
                  }}
                  transition={isOrbClicked ? {
                    duration: 1.5,
                    delay: i * 0.06,
                    ease: [0.6, 0.05, 0.2, 0.95],
                  } : {
                    duration: 3 + i * 0.6,
                    repeat: Infinity,
                    delay: i * 0.25,
                    ease: 'easeInOut',
                  }}
                />
              ))}

              {/* Liquid Morphing Orb - OPTIMIZED: Removed expensive filter animations */}
              <motion.div
                className="absolute"
                style={{
                  width: '300px',
                  height: '300px',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-150px',
                  marginTop: '-150px',
                  borderRadius: '50%',
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)', // GPU acceleration
                }}
                animate={isOrbClicked ? {
                  scale: [1, 1.3, 0.5],
                  rotate: [0, 180, 360],
                  opacity: [1, 1, 0],
                } : {
                  // Subtle rotation for legendary only
                  rotate: nodeType === 'legendary' ? [0, 10, -10, 0] : 0,
                }}
                transition={isOrbClicked ? {
                  duration: 1.5,
                  ease: [0.6, 0.05, 0.2, 0.95],
                } : {
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* SVG Masking and Glowing Shadow */}
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  {/* SVG with rotating polygon masks - OPTIMIZED: Reduced to 3 polygons */}
                  <svg width={300} height={300} viewBox="0 0 300 300" style={{ position: 'absolute', top: 0, left: 0 }}>
                    <defs>
                      <mask id={`clipping-${nodeType}`}>
                        <polygon points="0,0 300,0 300,300 0,300" fill="black" />
                        {/* OPTIMIZED: Only 3 rotating triangles for better performance */}
                        <motion.polygon
                          points="150,75 225,225 75,225"
                          fill="white"
                          style={{ filter: 'blur(18px)', transformOrigin: '150px 150px' }}
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        />
                        <motion.polygon
                          points="105,105 195,105 150,195"
                          fill="white"
                          style={{ filter: 'blur(18px)', transformOrigin: '150px 150px' }}
                          animate={{ rotate: [0, -360] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        />
                        <motion.polygon
                          points="120,90 180,90 150,210"
                          fill="white"
                          style={{ filter: 'blur(18px)', transformOrigin: '150px 150px' }}
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay: -1.5 }}
                        />
                      </mask>

                      {/* REMOVED: Expensive contrast filter animation */}
                    </defs>
                  </svg>

                  {/* Background sphere with border and shadow */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: '300px',
                      height: '300px',
                      borderRadius: '50%',
                      borderTop: `solid 1px ${colors.top}`,
                      borderBottom: `solid 1px ${colors.top}`,
                      background: `linear-gradient(180deg, ${colors.glow}, ${colors.shadow})`,
                      boxShadow: `
                        0 0 25px 0 ${colors.glow},
                        0 20px 50px 0 ${colors.shadow},
                        inset 0 10px 10px 0 ${colors.glow},
                        inset 0 -10px 10px 0 ${colors.shadow}
                      `,
                    }}
                  />

                  {/* Masked gradient box - OPTIMIZED: Removed expensive filter */}
                  <div
                    style={{
                      width: '300px',
                      height: '300px',
                      background: colors.gradient,
                      mask: `url(#clipping-${nodeType})`,
                      WebkitMask: `url(#clipping-${nodeType})`,
                      // REMOVED: filter for better performance
                    }}
                  />
                </div>
              </motion.div>

              {/* Orbiting particles - outer ring */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {[...Array(20)].map((_, i) => {
                  const angle = (i / 20) * 360;
                  const radius = 200;
                  return (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: colors.top,
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) translate(${Math.cos((angle * Math.PI) / 180) * radius}px, ${Math.sin((angle * Math.PI) / 180) * radius}px)`,
                        boxShadow: `0 0 15px ${colors.glow}`,
                      }}
                      animate={{
                        opacity: [0.4, 1, 0.4],
                        scale: [0.8, 1.4, 0.8],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: 'easeInOut',
                      }}
                    />
                  );
                })}
              </motion.div>

              {/* Burst particles when clicked - OPTIMIZED: Reduced from 40 to 24 particles */}
              <AnimatePresence>
                {isOrbClicked && (
                  <>
                    {[...Array(24)].map((_, i) => {
                      const angle = (i / 24) * 360;
                      const distance = 250 + Math.random() * 120;
                      const rotationDirection = i % 2 === 0 ? 1 : -1;
                      const size = Math.random() * 14 + 8;
                      return (
                        <motion.div
                          key={`burst-${i}`}
                          className="absolute rounded-full"
                          style={{
                            width: size + 'px',
                            height: size + 'px',
                            backgroundColor: i % 3 === 0 ? colors.shadow : colors.top,
                            left: '50%',
                            top: '50%',
                            boxShadow: `0 0 25px ${colors.glow}`,
                            willChange: 'transform, opacity', // GPU acceleration
                            transform: 'translateZ(0)',
                          }}
                          initial={{
                            x: 0,
                            y: 0,
                            opacity: 1,
                            scale: 0,
                            rotate: 0,
                          }}
                          animate={{
                            x: Math.cos((angle * Math.PI) / 180) * distance,
                            y: Math.sin((angle * Math.PI) / 180) * distance,
                            opacity: [1, 0.8, 0],
                            scale: [0, 2.5, 0.5, 0],
                            rotate: rotationDirection * 720,
                          }}
                          transition={{
                            duration: 1.8,
                            ease: [0.6, 0.05, 0.2, 0.95],
                            times: [0, 0.4, 0.8, 1],
                          }}
                        />
                      );
                    })}
                  </>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Instruction text */}
            {!isOrbClicked && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-xl text-gray-600 text-center font-semibold"
              >
                Tap the orb to see what you earned! ✨
              </motion.p>
            )}
          </motion.div>
        ) : (
          // Reward Card Stage
          <motion.div
            key="reward"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full mx-auto"
          >
            <div className="glass-card p-8 rounded-3xl text-center">
              {/* Celebration Header */}
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-black mb-6 text-blue-900"
              >
                {nodeType === 'legendary' && '👑 '}
                Node Opened!
                {nodeType === 'legendary' && ' 👑'}
              </motion.h2>

              {/* Animated Reward Icon - OPTIMIZED: Removed expensive filter animations */}
              <motion.div
                className="relative mx-auto mb-8 flex items-center justify-center"
                style={{
                  perspective: '1500px',
                  width: '200px',
                  height: '200px',
                  willChange: 'transform, opacity', // GPU acceleration
                  transform: 'translateZ(0)',
                }}
                initial={{
                  rotateY: 0,
                  scale: 0.5,
                  opacity: 0,
                }}
                animate={{
                  rotateY: isFlipping ? [0, 180, 360, 540, 720] : 0,
                  scale: isFlipping ? [0.5, 1.3, 0.9, 1.25, 1.1] : 1,
                  opacity: 1,
                  // REMOVED: Expensive filter animations for better performance
                }}
                transition={{
                  duration: isFlipping ? 2.5 : 0.6,
                  ease: isFlipping ? [0.6, 0.05, 0.2, 0.95] : "backOut",
                  times: isFlipping ? [0, 0.3, 0.5, 0.7, 1] : undefined,
                }}
              >
                <RewardIcon type={nodeType} size="xl" animate={!isFlipping} />

                {/* Radial glow effect during flip */}
                {isFlipping && (
                  <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${colors.glow}, transparent 70%)`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 2.5, 1.5, 3, 2],
                      opacity: [0, 0.8, 0.4, 0.9, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      ease: [0.6, 0.05, 0.2, 0.95],
                      times: [0, 0.3, 0.5, 0.7, 1],
                    }}
                  />
                )}

                {/* Special legendary sparkles (Genshin Impact style) */}
                {nodeType === 'legendary' && !isFlipping && (
                  <>
                    {[...Array(12)].map((_, i) => {
                      const angle = (i / 12) * 360;
                      const radius = 110 + Math.sin(i) * 20;
                      return (
                        <motion.div
                          key={`sparkle-${i}`}
                          className="absolute text-2xl"
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: `translate(-50%, -50%) translate(${Math.cos((angle * Math.PI) / 180) * radius}px, ${Math.sin((angle * Math.PI) / 180) * radius}px)`,
                          }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                            rotate: [0, 360],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                          }}
                        >
                          ✨
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </motion.div>

              {/* Score Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-6"
              >
                <div className="text-xl font-bold text-gray-700 mb-2">
                  {score}/{totalQuestions} Correct ({((score / totalQuestions) * 100).toFixed(0)}%)
                </div>
              </motion.div>

              {/* XP Reward */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                className="mb-6"
              >
                <div className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl border-2 border-yellow-500 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-600" />
                    <motion.span
                      className="text-4xl font-black text-orange-600"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.3, 1] }}
                      transition={{ delay: 1.4, duration: 0.6, ease: 'backOut' }}
                    >
                      +{Math.round(xpEarned)} XP
                    </motion.span>
                  </div>
                </div>
              </motion.div>

              {/* Animated XP Bar */}
              <div className="max-w-sm mx-auto mb-6">
                <AnimatedXPBar
                  currentLevel={currentLevel}
                  oldXP={oldXP}
                  newXP={newXP}
                  nodeType={nodeType}
                />
              </div>

              {/* Continue Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                onClick={handleContinue}
                className="glass-button glass-button-primary px-8 py-4 text-xl font-black rounded-2xl transition-all hover:scale-105"
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RevealPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-sky-50 flex items-center justify-center">
        <div className="text-xl font-bold text-blue-900">Loading...</div>
      </div>
    }>
      <OrbContent />
    </Suspense>
  );
}
