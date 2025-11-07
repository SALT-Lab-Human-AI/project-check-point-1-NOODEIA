"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import UserAvatar from './UserAvatar';

interface Top3CardProps {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  level: number;
  attempts?: number; // Quiz attempts in the selected timeframe
  iconType?: string;
  iconEmoji?: string;
  iconColor?: string;
  isCurrentUser?: boolean;
  displayType?: 'xp' | 'attempts'; // What to display
}

export default function Top3Card({
  rank,
  userId,
  name,
  xp,
  level,
  attempts,
  iconType,
  iconEmoji,
  iconColor,
  isCurrentUser = false,
  displayType = 'xp'
}: Top3CardProps) {
  const user = {
    id: userId,
    name,
    iconType,
    iconEmoji,
    iconColor
  };

  // Card styling based on rank
  const cardStyles = {
    1: {
      gradient: 'from-purple-400 via-pink-400 to-purple-600',
      shadow: 'shadow-[0_20px_40px_rgba(236,72,153,0.4),0_10px_20px_rgba(168,85,247,0.3),inset_0_2px_4px_rgba(255,255,255,0.5)]',
      height: 'h-[360px]',
      width: 'w-full max-w-[180px]',
      badge: <Trophy className="w-8 h-8 text-yellow-400" />,
      badgeBg: 'bg-yellow-400/20'
    },
    2: {
      gradient: 'from-blue-300 via-indigo-300 to-blue-500',
      shadow: 'shadow-[0_18px_36px_rgba(59,130,246,0.35),0_8px_16px_rgba(99,102,241,0.25),inset_0_2px_4px_rgba(255,255,255,0.5)]',
      height: 'h-[300px]',
      width: 'w-full max-w-[150px]',
      badge: <Medal className="w-7 h-7 text-gray-300" />,
      badgeBg: 'bg-gray-300/20'
    },
    3: {
      gradient: 'from-orange-300 via-rose-300 to-orange-500',
      shadow: 'shadow-[0_18px_36px_rgba(249,115,22,0.35),0_8px_16px_rgba(251,146,60,0.25),inset_0_2px_4px_rgba(255,255,255,0.5)]',
      height: 'h-[280px]',
      width: 'w-full max-w-[140px]',
      badge: <Award className="w-7 h-7 text-orange-400" />,
      badgeBg: 'bg-orange-400/20'
    }
  };

  const style = cardStyles[rank as keyof typeof cardStyles];

  // Get rank title based on level/XP (placeholder logic)
  const getTitle = () => {
    if (level >= 40) return 'Code Master';
    if (level >= 30) return 'Rising Star';
    if (level >= 20) return 'Design Guru';
    if (level >= 10) return 'Tech Ninja';
    return 'Rookie';
  };

  // Generate initials from name
  const getInitials = () => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate consistent color from userId
  const getAvatarColor = () => {
    if (iconColor) return iconColor;
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
    ];
    if (userId) {
      const hash = userId.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      return colors[Math.abs(hash) % colors.length];
    }
    return colors[0];
  };

  const hasEmoji = iconEmoji && iconEmoji.trim();
  const displayInitials = !hasEmoji;

  // Generate sparkle positions around the card - memoized to prevent regeneration
  const sparkles = useMemo(() => {
    const sparkleCount = rank === 1 ? 12 : rank === 2 ? 8 : 6;
    const angleStep = 360 / sparkleCount;
    return Array.from({ length: sparkleCount }, (_, i) => ({
      id: i,
      angle: i * angleStep,
      delay: i * 0.1,
      size: 6 + (i % 3) * 2 // Use deterministic sizing instead of random
    }));
  }, [rank]);

  return (
    <motion.div
      className={`relative flex flex-col items-center p-6 rounded-[2rem] bg-gradient-to-br ${style.gradient} ${style.shadow} ${style.height} ${style.width} backdrop-blur-md border border-white/30 transition-all ${
        isCurrentUser 
          ? rank === 1 
            ? 'ring-2 ring-yellow-300 ring-offset-1' 
            : rank === 2 
            ? 'ring-2 ring-blue-300 ring-offset-1'
            : 'ring-2 ring-orange-300 ring-offset-1'
          : ''
      }`}
      style={{ 
        overflow: 'visible',
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
      initial={{ opacity: 0, y: 50, scale: 0.8, rotateY: -90 }}
      animate={{ 
        opacity: 1, 
        y: [0, -3, 0],
        scale: 1,
        rotateY: 0,
        rotateZ: [0, 0.5, -0.5, 0]
      }}
      transition={{
        opacity: {
          duration: 1.2,
          delay: rank * 0.2,
          ease: [0.25, 0.1, 0.25, 1] // smooth ease-in-out
        },
        scale: {
          duration: 1.0,
          delay: rank * 0.2,
          type: 'spring',
          stiffness: 150,
          damping: 20,
          mass: 1
        },
        rotateY: {
          duration: 1.0,
          delay: rank * 0.2,
          type: 'spring',
          stiffness: 150,
          damping: 20,
          mass: 1
        },
        y: {
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2 + rank * 0.2
        },
        rotateZ: {
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2 + rank * 0.2
        }
      }}
      whileHover={{ 
        scale: 1.08, 
        y: -8,
        rotateY: [0, -5, 5, 0],
        transition: { duration: 0.3 }
      }}
    >
      {/* Floating Sparkles Around Card - Optimized */}
      {sparkles.map((sparkle) => {
        const radius = rank === 1 ? 120 : rank === 2 ? 100 : 90;
        const angleRad = (sparkle.angle * Math.PI) / 180;
        const x = Math.cos(angleRad) * radius;
        const y = Math.sin(angleRad) * radius;
        
        return (
          <motion.div
            key={sparkle.id}
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              x: x - sparkle.size / 2,
              y: y - sparkle.size / 2,
              willChange: 'transform, opacity',
              transform: 'translateZ(0)'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0, 1.2, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: sparkle.delay,
              ease: "easeInOut",
              repeatDelay: 0.5
            }}
          >
            <div
              className={`rounded-full ${
                rank === 1 ? 'bg-yellow-300' :
                rank === 2 ? 'bg-gray-200' :
                'bg-orange-300'
              }`}
              style={{
                width: sparkle.size,
                height: sparkle.size,
                boxShadow: `0 0 ${sparkle.size * 2}px ${
                  rank === 1 ? 'rgba(255, 215, 0, 0.6)' :
                  rank === 2 ? 'rgba(192, 192, 192, 0.6)' :
                  'rgba(205, 127, 50, 0.6)'
                }`
              }}
            />
          </motion.div>
        );
      })}
      {/* Crown for rank 1 - Enhanced Gacha-Style Animation */}
      {rank === 1 && (
        <>
          {/* Crown */}
          <motion.div
            className="absolute -top-12 z-20 pointer-events-none"
            initial={{ opacity: 0, y: -50, rotate: -360, scale: 0 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              rotate: 0,
              scale: 1
            }}
            transition={{ 
              delay: 0.5, 
              type: 'spring', 
              stiffness: 300,
              damping: 10,
              mass: 0.5
            }}
            style={{ willChange: 'transform' }}
          >
            <motion.span 
              className="text-5xl block relative"
              animate={{
                rotate: [0, -15, 15, -15, 0],
                scale: [1, 1.2, 1],
                y: [0, -8, 0],
                filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut"
              }}
              style={{
                textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4)'
              }}
            >
              👑
            </motion.span>
            {/* Floating particles around crown */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, Math.cos((i * 60) * Math.PI / 180) * 30],
                  y: [0, Math.sin((i * 60) * Math.PI / 180) * 30],
                  opacity: [1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        </>
      )}

      {/* Silver medal for rank 2 - Enhanced Animation */}
      {rank === 2 && (
        <motion.div
          className="absolute -top-12 z-20 pointer-events-none"
          initial={{ opacity: 0, y: -40, rotate: -180, scale: 0 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            rotate: 0,
            scale: 1
          }}
          transition={{ 
            delay: 0.45, 
            type: 'spring', 
            stiffness: 250,
            damping: 12
          }}
          style={{ willChange: 'transform' }}
        >
          <motion.span 
            className="text-5xl block relative"
            animate={{
              rotate: [0, -8, 8, -8, 0],
              scale: [1, 1.1, 1],
              y: [0, -5, 0],
              filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)']
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 2.5,
              ease: "easeInOut"
            }}
            style={{
              textShadow: '0 0 15px rgba(192, 192, 192, 0.6), 0 0 30px rgba(192, 192, 192, 0.3)'
            }}
          >
            🥈
          </motion.span>
        </motion.div>
      )}

      {/* Bronze medal for rank 3 - Enhanced Animation */}
      {rank === 3 && (
        <motion.div
          className="absolute -top-12 z-20 pointer-events-none"
          initial={{ opacity: 0, y: -40, rotate: -180, scale: 0 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            rotate: 0,
            scale: 1
          }}
          transition={{ 
            delay: 0.4, 
            type: 'spring', 
            stiffness: 250,
            damping: 12
          }}
          style={{ willChange: 'transform' }}
        >
          <motion.span 
            className="text-5xl block relative"
            animate={{
              rotate: [0, -8, 8, -8, 0],
              scale: [1, 1.1, 1],
              y: [0, -5, 0],
              filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)']
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 2.5,
              ease: "easeInOut"
            }}
            style={{
              textShadow: '0 0 15px rgba(205, 127, 50, 0.6), 0 0 30px rgba(205, 127, 50, 0.3)'
            }}
          >
            🥉
          </motion.span>
        </motion.div>
      )}
      
      {/* Rank Badge/Label - Original size for all ranks */}
      <motion.div
        className={`absolute -top-2 -right-2 rounded-full px-3 py-1 text-xs font-black text-white shadow-lg z-10 ${
          rank === 1 ? 'bg-yellow-400' :
          rank === 2 ? 'bg-gray-300' :
          'bg-orange-400'
        }`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 + rank * 0.1, type: 'spring', stiffness: 300 }}
        style={{ fontSize: '0.75rem' }}
      >
        {rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'}
      </motion.div>


      {/* Modern gradient shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-[2rem] pointer-events-none overflow-hidden"
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: rank === 1
              ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,215,0,0.15) 100%)'
              : rank === 2
              ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(192,192,192,0.15) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(205,127,50,0.15) 100%)',
            width: '200%',
            height: '200%',
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
          animate={{
            x: ['-50%', '50%'],
            y: ['-50%', '50%'],
            rotate: [0, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>

      {/* Subtle border glow animation - removed to prevent border conflicts */}

      {/* Avatar with enhanced bounce animation */}
      <motion.div
        initial={{ scale: 0, rotate: -360, y: 20 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          y: 0
        }}
        transition={{ 
          delay: 0.3 + rank * 0.1, 
          type: 'spring', 
          stiffness: 300,
          damping: 15
        }}
        className="mb-2 relative"
      >
        {displayInitials ? (
          <motion.div
            className={`rounded-full flex items-center justify-center font-black text-white ${
              rank === 1 ? 'w-24 h-24 text-3xl' : 
              rank === 2 ? 'w-20 h-20 text-2xl' : 
              'w-16 h-16 text-xl'
            }`}
            style={{
              backgroundColor: getAvatarColor(),
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
            }}
            animate={{
              y: [0, -5, 0],
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8 + rank * 0.1
            }}
          >
            {getInitials()}
          </motion.div>
        ) : (
          <motion.div 
            className={rank === 1 ? 'text-7xl' : rank === 2 ? 'text-6xl' : 'text-5xl'}
            animate={{
              y: [0, -5, 0],
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8 + rank * 0.1
            }}
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {iconEmoji}
          </motion.div>
        )}
      </motion.div>

      {/* Badge with spin and pulse */}
      <motion.div
        className={`${style.badgeBg} rounded-full p-2 mb-2 relative`}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: 1,
          rotate: 0
        }}
        transition={{ 
          delay: 0.4 + rank * 0.1, 
          type: 'spring', 
          stiffness: 400,
          damping: 12
        }}
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
            ease: "easeInOut"
          }}
        >
          {style.badge}
        </motion.div>
      </motion.div>

      {/* Name */}
      <motion.h3
        className={`font-black text-white mb-0.5 text-center ${
          rank === 1 ? 'text-xl' : rank === 2 ? 'text-lg' : 'text-base'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 + rank * 0.1 }}
      >
        {name}
        {isCurrentUser && (
          <span className="ml-2 text-xs bg-white/30 text-white px-2 py-0.5 rounded-full">
            You
          </span>
        )}
      </motion.h3>

      {/* XP or Accuracy - Animated */}
      <motion.div
        className="text-center mb-1"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 + rank * 0.1, type: 'spring', stiffness: 200 }}
      >
        <motion.div
          className={`font-black text-white ${
            rank === 1 ? 'text-2xl' : rank === 2 ? 'text-xl' : 'text-lg'
          }`}
          animate={{
            scale: [1, 1.05, 1],
            filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {displayType === 'attempts' && attempts !== undefined
            ? `${attempts} Attempt${attempts === 1 ? '' : 's'}`
            : `${Math.round(xp).toLocaleString()} XP`}
        </motion.div>
      </motion.div>

      {/* Level - Animated */}
      <motion.div
        className="text-center mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 + rank * 0.1 }}
      >
        <motion.div
          className={`font-bold text-white/90 ${
            rank === 1 ? 'text-base' : rank === 2 ? 'text-sm' : 'text-xs'
          }`}
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          Level {level}
        </motion.div>
      </motion.div>

    </motion.div>
  );
}
