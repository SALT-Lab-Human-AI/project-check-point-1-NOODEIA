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

  const orbColors = {
    common: {
      primary: '#E4B953',
      secondary: '#F8EAC1',
      glow: 'rgba(228, 185, 83, 0.8)',
      shadow: 'rgba(228, 185, 83, 0.6)'
    },
    rare: {
      primary: '#FAB9CA',
      secondary: '#F8C8E2',
      glow: 'rgba(250, 185, 202, 0.8)',
      shadow: 'rgba(250, 185, 202, 0.6)'
    },
    legendary: {
      primary: '#F58FA8',
      secondary: '#FAB9CA',
      glow: 'rgba(245, 143, 168, 1)',
      shadow: 'rgba(245, 143, 168, 0.8)'
    }
  };

  const colors = orbColors[nodeType];

  const handleOrbClick = () => {
    if (isOrbClicked) return;

    setIsOrbClicked(true);

    // Massive confetti explosion
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.5 },
        colors: [colors.primary, colors.secondary, '#FFD700', '#FFA500']
      });

      // Side bursts
      setTimeout(() => {
        confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1 } });
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

            {/* Advanced 3D Orb */}
            <motion.div
              className="relative cursor-pointer"
              style={{
                width: '400px',
                height: '400px',
                perspective: '1500px',
              }}
              onClick={handleOrbClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Outer glow rings - multiple layers for depth */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`glow-${i}`}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${colors.glow}, transparent 70%)`,
                    filter: `blur(${30 + i * 10}px)`,
                  }}
                  animate={{
                    scale: [1, 1.2 + i * 0.1, 1],
                    opacity: [0.3 - i * 0.05, 0.6 - i * 0.05, 0.3 - i * 0.05],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}

              {/* Main Orb Sphere */}
              <motion.div
                className="absolute inset-0"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(0)',
                }}
                animate={isOrbClicked ? {
                  scale: [1, 1.3, 0.5],
                  rotateY: [0, 180, 360],
                  opacity: [1, 1, 0],
                } : {
                  // Pokemon GO style shake - 3 shakes with decreasing intensity
                  rotate: [
                    0, -20, 20, -15, 15, -10, 10, -8, 8, -5, 5, 0
                  ],
                  x: [
                    0, -10, 10, -8, 8, -6, 6, -4, 4, -2, 2, 0
                  ],
                  y: [
                    0, 2, -2, 2, -2, 1, -1, 1, -1, 0.5, -0.5, 0
                  ],
                }}
                transition={isOrbClicked ? {
                  duration: 1.5,
                  ease: [0.6, 0.05, 0.2, 0.95],
                } : {
                  duration: 3.5,
                  repeat: Infinity,
                  repeatDelay: 0.8,
                  ease: 'easeInOut',
                  times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 1]
                }}
              >
                {/* Sphere with realistic lighting */}
                <div
                  className="w-full h-full rounded-full relative"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${colors.secondary}, ${colors.primary})`,
                    boxShadow: `
                      0 0 60px ${colors.shadow},
                      0 0 120px ${colors.glow},
                      inset -30px -30px 60px rgba(0, 0, 0, 0.3),
                      inset 30px 30px 60px rgba(255, 255, 255, 0.3)
                    `,
                  }}
                >
                  {/* Top highlight (light source) */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      top: '10%',
                      left: '25%',
                      width: '40%',
                      height: '40%',
                      background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.4) 40%, transparent 70%)',
                      filter: 'blur(25px)',
                    }}
                  />

                  {/* Secondary highlight */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      top: '20%',
                      left: '35%',
                      width: '25%',
                      height: '25%',
                      background: 'radial-gradient(circle, rgba(255, 255, 255, 0.7) 0%, transparent 60%)',
                      filter: 'blur(15px)',
                    }}
                  />

                  {/* Bottom shadow (depth) */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      bottom: '5%',
                      right: '15%',
                      width: '50%',
                      height: '50%',
                      background: 'radial-gradient(circle, rgba(0, 0, 0, 0.4) 0%, transparent 70%)',
                      filter: 'blur(20px)',
                    }}
                  />

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)`,
                      opacity: 0,
                    }}
                    animate={{
                      opacity: [0, 0.6, 0],
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
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
                        backgroundColor: colors.secondary,
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

              {/* Burst particles when clicked */}
              <AnimatePresence>
                {isOrbClicked && (
                  <>
                    {[...Array(32)].map((_, i) => {
                      const angle = (i / 32) * 360;
                      const distance = 250 + Math.random() * 100;
                      return (
                        <motion.div
                          key={`burst-${i}`}
                          className="absolute rounded-full"
                          style={{
                            width: Math.random() * 12 + 6 + 'px',
                            height: Math.random() * 12 + 6 + 'px',
                            backgroundColor: colors.primary,
                            left: '50%',
                            top: '50%',
                            boxShadow: `0 0 20px ${colors.glow}`,
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
                            scale: [0, 2, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            ease: 'easeOut',
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

              {/* Animated Reward Icon */}
              <motion.div
                className="relative mx-auto mb-8 flex items-center justify-center"
                style={{ perspective: '1000px', width: '200px', height: '200px' }}
                initial={{
                  rotateY: 0,
                  scale: 0.5,
                  opacity: 0,
                }}
                animate={{
                  rotateY: isFlipping ? [0, 180, 360, 540, 720] : 0,
                  scale: isFlipping ? [0.5, 1.2, 1.0, 1.15, 1.1] : 1,
                  opacity: 1,
                }}
                transition={{
                  duration: isFlipping ? 2.5 : 0.6,
                  ease: isFlipping ? [0.6, 0.05, 0.2, 0.95] : "backOut",
                  times: isFlipping ? [0, 0.3, 0.5, 0.7, 1] : undefined,
                }}
              >
                <RewardIcon type={nodeType} size="xl" animate={!isFlipping} />
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
