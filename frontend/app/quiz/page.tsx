"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { supabase } from '@/lib/supabase';
import { PuffyCard } from '@/components/PuffyComponents';
import AnimatedXPBar from '@/components/AnimatedXPBar';
import {
  ArrowLeft,
  Check,
  X,
  Flame,
  Zap
} from 'lucide-react';

type GameState = 'menu' | 'quiz' | 'opening';
type NodeType = 'common' | 'rare' | 'legendary';

interface Question {
  question: string;
  options: number[];
  answer?: number;
}

export default function QuizPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Game state
  const [gameState, setGameState] = useState<GameState>('menu');
  const [earnedNodeType, setEarnedNodeType] = useState<NodeType>('common');

  // Quiz state
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Opening state (3D effects)
  const [showNodeAnimation, setShowNodeAnimation] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [oldXP, setOldXP] = useState(0);
  const [newXP, setNewXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);

  // Refs for GSAP animations
  const nodeRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // 3D Node Opening Animation with GSAP
  useEffect(() => {
    if (showNodeAnimation && nodeRef.current) {
      // 1. 720° Rotation Entrance (1.5s)
      gsap.fromTo(
        nodeRef.current,
        {
          scale: 0,
          rotationY: -720,
        },
        {
          scale: 1,
          rotationY: 0,
          duration: 1.5,
          ease: 'back.out(1.2)',
        }
      );

      // 2. Particle Burst (starts at 1s)
      setTimeout(() => {
        if (particlesRef.current) {
          const particles = particlesRef.current.children;
          Array.from(particles).forEach((particle: any, i) => {
            const angle = (i / 20) * 360 * (Math.PI / 180);
            const distance = 150;

            gsap.fromTo(
              particle,
              {
                x: 0,
                y: 0,
                opacity: 1,
              },
              {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out',
              }
            );
          });
        }
      }, 1000);

      // 3. Continuous Pulsing (starts at 1.5s)
      setTimeout(() => {
        if (nodeRef.current) {
          gsap.to(nodeRef.current, {
            scale: 1.1,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }
      }, 1500);
    }

    return () => {
      if (nodeRef.current) {
        gsap.killTweensOf(nodeRef.current);
      }
      if (particlesRef.current) {
        gsap.killTweensOf(particlesRef.current.children);
      }
    };
  }, [showNodeAnimation]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    try {
      // Call API to start quiz
      const response = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id
        })
      });

      if (!response.ok) throw new Error('Failed to start quiz');

      const data = await response.json();
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setAnswers(data._answers); // Store correct answers
      setCurrentQuestionIndex(0);
      setScore(0);
      setStreak(0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setGameState('quiz');
    } catch (error) {
      console.error('Start quiz error:', error);
      alert('Failed to start quiz. Please try again.');
    }
  };

  const handleAnswer = (answer: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const correct = answer === answers[currentQuestionIndex];
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);

      // Confetti for correct answers
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      // Big celebration for streaks
      if (streak + 1 >= 3) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 120,
            origin: { y: 0.5 }
          });
        }, 200);
      }
    } else {
      setStreak(0);
    }

    // Move to next question or end quiz
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        endQuiz();
      }
    }, 1500);
  };

  const endQuiz = async () => {
    try {
      // Submit quiz to backend (nodeType is determined by performance on backend)
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          sessionId,
          score,
          totalQuestions: questions.length,
          streak,
          answers
        })
      });

      if (!response.ok) throw new Error('Failed to submit quiz');

      const data = await response.json();

      if (!data.canOpen) {
        alert(data.message);
        setGameState('menu');
        return;
      }

      // Set XP data for animation and earned node type
      setXpEarned(data.xpEarned);
      setOldXP(data.oldXP);
      setNewXP(data.newXP);
      setCurrentLevel(data.currentLevel);
      setEarnedNodeType(data.nodeType); // Set the node type earned based on performance

      // Show opening animation
      setGameState('opening');
      setShowNodeAnimation(true);

    } catch (error) {
      console.error('End quiz error:', error);
      alert('Failed to submit quiz. Please try again.');
      setGameState('menu');
    }
  };

  const handleContinue = () => {
    // Big confetti for legendary
    if (earnedNodeType === 'legendary') {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FFA500', '#FF4500']
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFD700', '#FFA500', '#FF4500']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      setTimeout(() => {
        setShowNodeAnimation(false);
        setGameState('menu');
      }, 3000);
    } else {
      confetti({
        particleCount: 150,
        spread: 180,
        origin: { y: 0.5 }
      });

      setShowNodeAnimation(false);
      setGameState('menu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-purple-900 text-xl font-black">Loading...</div>
      </div>
    );
  }

  const nodeColors = {
    common: 'from-gray-300 to-gray-500',
    rare: 'from-blue-400 to-blue-600',
    legendary: 'from-yellow-400 via-orange-500 to-red-600'
  };

  const nodeIcons = {
    common: '⭐',
    rare: '💎',
    legendary: '👑'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 sm:p-8">
      <AnimatePresence mode="wait">
        {/* MENU STATE */}
        {gameState === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => router.push('/home')}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <ArrowLeft size={20} />
                <span className="font-semibold">Back</span>
              </button>

              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Math Quiz 🎮
              </h1>

              <div className="w-20" />
            </div>

            {/* Earn Your Rewards */}
            <PuffyCard color="purple" size="lg" className="mb-6" onClick={undefined}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-purple-900 mb-3">Earn Your Rewards</h2>
                <p className="text-purple-700 text-lg mb-4">Answer 10 math questions and earn rewards based on your performance!</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 border-2 border-gray-300">
                    <div className="text-3xl mb-2">⭐</div>
                    <div className="font-black text-gray-800">Common Node</div>
                    <div className="text-sm text-gray-600 font-semibold">30% or more</div>
                    <div className="text-sm text-gray-700 font-bold mt-1">3-7 XP</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 border-2 border-blue-400">
                    <div className="text-3xl mb-2">💎</div>
                    <div className="font-black text-blue-800">Rare Node</div>
                    <div className="text-sm text-blue-600 font-semibold">80% or more</div>
                    <div className="text-sm text-blue-700 font-bold mt-1">12-15 XP</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 rounded-xl p-4 border-2 border-yellow-400">
                    <div className="text-3xl mb-2">👑</div>
                    <div className="font-black text-orange-800">Legendary Node</div>
                    <div className="text-sm text-orange-600 font-semibold">100% correct</div>
                    <div className="text-sm text-orange-700 font-bold mt-1">25-30 XP</div>
                  </div>
                </div>

                <button
                  onClick={() => startQuiz()}
                  className="px-12 py-4 text-xl font-black bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all transform active:scale-95"
                >
                  Start Quiz 🚀
                </button>
              </div>
            </PuffyCard>
          </motion.div>
        )}

        {/* QUIZ STATE */}
        {gameState === 'quiz' && questions.length > 0 && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-2xl mx-auto"
          >
            <PuffyCard color="blue" size="lg" onClick={undefined}>
              {/* Progress Header */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm font-bold text-blue-900">
                    Question {currentQuestionIndex + 1} / {questions.length}
                  </div>
                  <div className="text-sm font-bold text-blue-900">
                    Score: {score}/{questions.length}
                  </div>
                </div>

                {/* Streak indicator */}
                {streak >= 3 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center gap-2 text-orange-600 font-bold text-xl mb-4"
                  >
                    <Flame className="w-6 h-6" />
                    {streak} Streak!
                    <Flame className="w-6 h-6" />
                  </motion.div>
                )}

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question */}
              <motion.div
                key={currentQuestionIndex}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-8 mb-6"
              >
                <h2 className="text-4xl sm:text-6xl font-bold text-purple-600">
                  {questions[currentQuestionIndex]?.question}
                </h2>
              </motion.div>

              {/* Answer Options */}
              <div className="grid grid-cols-2 gap-4">
                {questions[currentQuestionIndex]?.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleAnswer(option)}
                    disabled={selectedAnswer !== null}
                    className={`h-20 text-2xl font-bold rounded-2xl transition-all shadow-lg ${
                      selectedAnswer === option
                        ? isCorrect
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : selectedAnswer !== null && option === answers[currentQuestionIndex]
                        ? 'bg-green-500 text-white'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {option}
                      {selectedAnswer === option && (
                        <span>
                          {isCorrect ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </PuffyCard>
          </motion.div>
        )}

        {/* NODE OPENING STATE (3D Effects) */}
        {gameState === 'opening' && (
          <motion.div
            key="opening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto"
            onClick={handleContinue}
          >
            <PuffyCard color="purple" size="lg" className="text-center relative overflow-hidden" onClick={undefined}>
              {/* Background Stars (20 stars) */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-200 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black mb-6 text-purple-900"
              >
                {earnedNodeType === 'legendary' && '👑 '}
                Node Opened!
                {earnedNodeType === 'legendary' && ' 👑'}
              </motion.h2>

              {/* 3D Animated Node with 720° Rotation */}
              <div
                ref={nodeRef}
                className="relative mx-auto mb-8"
                style={{ perspective: '1000px', width: '160px', height: '160px' }}
              >
                {/* Particle Container */}
                <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => {
                    const colors = {
                      common: 'bg-gray-400',
                      rare: 'bg-blue-400',
                      legendary: 'bg-yellow-400'
                    };
                    return (
                      <div
                        key={i}
                        className={`absolute w-3 h-3 ${colors[earnedNodeType]} rounded-full`}
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    );
                  })}
                </div>

                {/* Glow Rings */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${nodeColors[earnedNodeType]} rounded-full blur-2xl`}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />

                <motion.div
                  className={`absolute inset-2 bg-gradient-to-br ${nodeColors[earnedNodeType]} rounded-full blur-xl`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.9, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.5,
                  }}
                />

                {/* Main Node */}
                <div
                  className={`relative w-40 h-40 rounded-full bg-gradient-to-br ${nodeColors[earnedNodeType]} shadow-2xl flex items-center justify-center border-4 border-white`}
                >
                  <span className="text-7xl">{nodeIcons[earnedNodeType]}</span>
                </div>

                {/* Rotating Sparkles */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  {[...Array(12)].map((_, i) => {
                    const angle = (i / 12) * 360;
                    const radius = 80;
                    return (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(-50%, -50%) translate(${Math.cos((angle * Math.PI) / 180) * radius}px, ${Math.sin((angle * Math.PI) / 180) * radius}px)`,
                        }}
                        animate={{
                          opacity: [0.3, 1, 0.3],
                          scale: [0.5, 1.5, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    );
                  })}
                </motion.div>
              </div>

              {/* Score Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-6"
              >
                <div className="text-xl font-bold text-gray-700 mb-2">
                  {score}/{questions.length} Correct ({((score / questions.length) * 100).toFixed(0)}%)
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
                      +{xpEarned} XP
                    </motion.span>
                  </div>
                </div>
              </motion.div>

              {/* Animated Progress Bar */}
              <div className="max-w-sm mx-auto mb-6">
                <AnimatedXPBar
                  currentLevel={currentLevel}
                  oldXP={oldXP}
                  newXP={newXP}
                  nodeType={earnedNodeType}
                />
              </div>

              {/* Continue Prompt */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="text-sm text-gray-600 cursor-pointer"
              >
                Click anywhere to continue
              </motion.div>
            </PuffyCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
