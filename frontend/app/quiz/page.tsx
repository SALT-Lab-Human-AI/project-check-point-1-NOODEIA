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

type GameState = 'menu' | 'quiz' | 'result' | 'opening';
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
  const [highestStreak, setHighestStreak] = useState(0); // Track highest streak in this quiz
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Saved quiz state
  const [hasSavedQuiz, setHasSavedQuiz] = useState(false);

  // Opening state (3D effects)
  const [showNodeAnimation, setShowNodeAnimation] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [oldXP, setOldXP] = useState(0);
  const [newXP, setNewXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);

  // Refs for GSAP animations
  const nodeRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<HTMLDivElement>(null);
  const rewardCard1Ref = useRef<HTMLDivElement>(null);
  const rewardCard2Ref = useRef<HTMLDivElement>(null);
  const rewardCard3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // Accordion-Style Opening Animation with GSAP
  useEffect(() => {
    if (showNodeAnimation && nodeRef.current) {
      // Phase 1: Start with collapsed state (scaleY 0)
      gsap.set(nodeRef.current, {
        opacity: 0,
        scaleY: 0,
        transformOrigin: 'center center',
      });

      // Phase 2: Accordion opens (0-0.8s) - Vertical scale expands with ease-out
      gsap.to(nodeRef.current, {
        opacity: 1,
        scaleY: 1,
        duration: 0.8,
        ease: 'power2.out',
      });

      // Phase 3: Content reveals with scale (0.4-1.0s)
      setTimeout(() => {
        if (nodeRef.current) {
          gsap.fromTo(
            nodeRef.current,
            { scale: 0.8 },
            {
              scale: 1,
              duration: 0.6,
              ease: 'back.out(1.7)',
            }
          );
        }
      }, 400);

      // Phase 4: Particle burst during opening (0.8s)
      setTimeout(() => {
        if (particlesRef.current) {
          const particles = particlesRef.current.children;
          Array.from(particles).forEach((particle: any, i) => {
            const angle = (i / 20) * 360 * (Math.PI / 180);
            const distance = 180;

            gsap.fromTo(
              particle,
              { x: 0, y: 0, opacity: 1, scale: 0 },
              {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                opacity: 0,
                scale: 1.5,
                duration: 1.2,
                ease: 'power3.out',
              }
            );
          });
        }
      }, 800);

      // Phase 5: Floating animation after fully opened (1.5s onwards)
      setTimeout(() => {
        if (nodeRef.current) {
          gsap.to(nodeRef.current, {
            y: -10,
            duration: 2,
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

  // Streak Animation - DISABLED (no pulsing)
  // Only uses Framer Motion entrance animation when it first appears
  useEffect(() => {
    // No continuous GSAP animation - streak badge remains static after entrance
    return () => {
      if (streakRef.current) {
        gsap.killTweensOf(streakRef.current);
      }
    };
  }, [streak]);

  // 3D Auto-Animated Reward Cards (no mouse required)
  useEffect(() => {
    const cards = [
      { ref: rewardCard1Ref.current, delay: 0 },
      { ref: rewardCard2Ref.current, delay: 0.3 },
      { ref: rewardCard3Ref.current, delay: 0.6 }
    ];

    cards.forEach(({ ref: card, delay }, index) => {
      if (card) {
        // Floating animation
        gsap.to(card, {
          y: -20,
          duration: 2.5 + index * 0.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: delay,
        });

        // 3D rotation animation (continuous)
        gsap.to(card, {
          rotationY: 10,
          rotationX: 5,
          duration: 4 + index * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: delay + 0.2,
        });

        // Scale pulse
        gsap.to(card, {
          scale: 1.05,
          duration: 2 + index * 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
          delay: delay + 0.1,
        });
      }
    });

    return () => {
      cards.forEach(({ ref: card }) => {
        if (card) gsap.killTweensOf(card);
      });
    };
  }, []);

  // Auto-save quiz progress when state changes (during active quiz)
  useEffect(() => {
    if (gameState === 'quiz' && questions.length > 0 && sessionId) {
      saveQuizProgress();
    }
  }, [currentQuestionIndex, score, streak, highestStreak, gameState]);

  // Handle browser visibility change (tab switch, minimize, etc.)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameState === 'quiz' && questions.length > 0) {
        // User switched tabs or minimized window - save progress
        saveQuizProgress();
      }
    };

    // Handle page unload (closing tab or navigating away)
    const handleBeforeUnload = () => {
      if (gameState === 'quiz' && questions.length > 0) {
        saveQuizProgress();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameState, questions.length, sessionId, currentQuestionIndex, score, streak, highestStreak]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      // Check for saved quiz after authentication
      checkForSavedQuiz(session.user.id);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  // Save quiz progress to localStorage
  const saveQuizProgress = () => {
    if (!user?.id || !sessionId || questions.length === 0) return;

    const quizState = {
      userId: user.id,
      sessionId,
      questions,
      answers,
      currentQuestionIndex,
      score,
      streak,
      highestStreak,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(`quiz_progress_${user.id}`, JSON.stringify(quizState));
      console.log('Quiz progress saved');
    } catch (error) {
      console.error('Failed to save quiz progress:', error);
    }
  };

  // Load saved quiz from localStorage
  const loadSavedQuiz = () => {
    if (!user?.id) return;

    try {
      const savedState = localStorage.getItem(`quiz_progress_${user.id}`);
      if (!savedState) {
        setHasSavedQuiz(false);
        return;
      }

      const quizState = JSON.parse(savedState);

      // Check if saved quiz is not too old (24 hours)
      const hoursSinceLastSave = (Date.now() - quizState.timestamp) / (1000 * 60 * 60);
      if (hoursSinceLastSave > 24) {
        clearSavedQuiz();
        setHasSavedQuiz(false);
        return;
      }

      // Restore quiz state
      setSessionId(quizState.sessionId);
      setQuestions(quizState.questions);
      setAnswers(quizState.answers);
      setCurrentQuestionIndex(quizState.currentQuestionIndex);
      setScore(quizState.score);
      setStreak(quizState.streak);
      setHighestStreak(quizState.highestStreak);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setGameState('quiz');
      setHasSavedQuiz(false);

      console.log('Quiz progress restored');
    } catch (error) {
      console.error('Failed to load saved quiz:', error);
      clearSavedQuiz();
      setHasSavedQuiz(false);
    }
  };

  // Clear saved quiz from localStorage
  const clearSavedQuiz = () => {
    if (!user?.id) return;

    try {
      localStorage.removeItem(`quiz_progress_${user.id}`);
      setHasSavedQuiz(false);
      console.log('Saved quiz cleared');
    } catch (error) {
      console.error('Failed to clear saved quiz:', error);
    }
  };

  // Check if there's a saved quiz on mount
  const checkForSavedQuiz = (userId: string) => {
    try {
      const savedState = localStorage.getItem(`quiz_progress_${userId}`);
      if (savedState) {
        const quizState = JSON.parse(savedState);
        const hoursSinceLastSave = (Date.now() - quizState.timestamp) / (1000 * 60 * 60);

        // Only show "Continue" option if quiz was saved within 24 hours
        if (hoursSinceLastSave <= 24) {
          setHasSavedQuiz(true);
        } else {
          localStorage.removeItem(`quiz_progress_${userId}`);
        }
      }
    } catch (error) {
      console.error('Failed to check for saved quiz:', error);
    }
  };

  const startQuiz = async () => {
    try {
      // Clear any existing saved quiz when starting fresh
      clearSavedQuiz();

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
      setHighestStreak(0); // Reset highest streak for new quiz
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
      setStreak(prev => {
        const newStreak = prev + 1;
        // Update highest streak if current streak exceeds it
        if (newStreak > highestStreak) {
          setHighestStreak(newStreak);
        }
        return newStreak;
      });

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
          streak: highestStreak, // Send highest streak achieved, not ending streak
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

      // Clear saved quiz since it's completed
      clearSavedQuiz();

      // Show result screen first (with "Open Node" button)
      setGameState('result');

    } catch (error) {
      console.error('End quiz error:', error);
      alert('Failed to submit quiz. Please try again.');
      setGameState('menu');
    }
  };

  const openNode = () => {
    // Transition to opening animation state
    setGameState('opening');
    setShowNodeAnimation(true);
  };

  // 3D Tilt effect on mouse move for reward cards
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardRef: React.RefObject<HTMLDivElement | null>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -15; // -15 to 15 degrees
    const rotateY = ((x - centerX) / centerX) * 15; // -15 to 15 degrees

    gsap.to(card, {
      rotationX: rotateX,
      rotationY: rotateY,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 1000,
    });
  };

  const handleCardMouseLeave = (cardRef: React.RefObject<HTMLDivElement | null>) => {
    if (!cardRef.current) return;

    gsap.to(cardRef.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8" style={{ perspective: '1500px' }}>
                  {/* Common Node Card */}
                  <div
                    ref={rewardCard1Ref}
                    onMouseMove={(e) => handleCardMouseMove(e, rewardCard1Ref)}
                    onMouseLeave={() => handleCardMouseLeave(rewardCard1Ref)}
                    className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 border-2 border-gray-400 cursor-pointer transition-all hover:scale-105"
                    style={{
                      transformStyle: 'preserve-3d',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2), 0 0 20px rgba(200,200,200,0.3)',
                    }}
                  >
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 opacity-40 blur-xl -z-10" />
                    <div className="relative text-5xl mb-3" style={{ transformStyle: 'preserve-3d' }}>
                      <span className="absolute opacity-20 blur-sm" style={{ transform: 'translateZ(-20px) scale(1.1)' }}>⭐</span>
                      <span className="relative" style={{ transform: 'translateZ(10px)', textShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>⭐</span>
                    </div>
                    <div className="font-black text-xl text-gray-800 mb-1">Common Node</div>
                    <div className="text-sm text-gray-600 font-semibold mb-1">30% or more</div>
                    <div className="text-lg text-gray-700 font-bold bg-white/50 rounded-lg px-3 py-1 inline-block">3-7 XP</div>
                  </div>

                  {/* Rare Node Card */}
                  <div
                    ref={rewardCard2Ref}
                    onMouseMove={(e) => handleCardMouseMove(e, rewardCard2Ref)}
                    onMouseLeave={() => handleCardMouseLeave(rewardCard2Ref)}
                    className="relative bg-gradient-to-br from-blue-100 to-blue-300 rounded-2xl p-6 border-2 border-blue-500 cursor-pointer transition-all hover:scale-105"
                    style={{
                      transformStyle: 'preserve-3d',
                      boxShadow: '0 10px 30px rgba(0,0,200,0.3), 0 0 25px rgba(100,150,255,0.4)',
                    }}
                  >
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-300 to-blue-500 opacity-40 blur-xl -z-10" />
                    <div className="relative text-5xl mb-3" style={{ transformStyle: 'preserve-3d' }}>
                      <span className="absolute opacity-20 blur-sm" style={{ transform: 'translateZ(-20px) scale(1.1)' }}>💎</span>
                      <span className="relative" style={{ transform: 'translateZ(10px)', textShadow: '0 5px 15px rgba(0,0,200,0.4), 0 0 20px rgba(100,150,255,0.3)' }}>💎</span>
                    </div>
                    <div className="font-black text-xl text-blue-900 mb-1">Rare Node</div>
                    <div className="text-sm text-blue-700 font-semibold mb-1">80% or more</div>
                    <div className="text-lg text-blue-800 font-bold bg-white/50 rounded-lg px-3 py-1 inline-block">12-15 XP</div>
                  </div>

                  {/* Legendary Node Card */}
                  <div
                    ref={rewardCard3Ref}
                    onMouseMove={(e) => handleCardMouseMove(e, rewardCard3Ref)}
                    onMouseLeave={() => handleCardMouseLeave(rewardCard3Ref)}
                    className="relative bg-gradient-to-br from-yellow-100 via-orange-200 to-red-200 rounded-2xl p-6 border-2 border-yellow-500 cursor-pointer transition-all hover:scale-105"
                    style={{
                      transformStyle: 'preserve-3d',
                      boxShadow: '0 10px 30px rgba(255,165,0,0.4), 0 0 30px rgba(255,100,0,0.5)',
                    }}
                  >
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400 opacity-40 blur-xl -z-10" />
                    <div className="relative text-5xl mb-3" style={{ transformStyle: 'preserve-3d' }}>
                      <span className="absolute opacity-20 blur-sm" style={{ transform: 'translateZ(-20px) scale(1.1)' }}>👑</span>
                      <span className="relative" style={{ transform: 'translateZ(10px)', textShadow: '0 5px 15px rgba(255,165,0,0.6), 0 0 25px rgba(255,215,0,0.5), 0 0 40px rgba(255,100,0,0.4)' }}>👑</span>
                    </div>
                    <div className="font-black text-xl text-orange-900 mb-1">Legendary Node</div>
                    <div className="text-sm text-orange-700 font-semibold mb-1">100% correct</div>
                    <div className="text-lg text-orange-800 font-bold bg-white/50 rounded-lg px-3 py-1 inline-block">25-30 XP</div>
                  </div>
                </div>

                {/* Show Continue Quiz button if there's a saved quiz */}
                {hasSavedQuiz && (
                  <div className="flex flex-col gap-4 items-center">
                    <button
                      onClick={() => loadSavedQuiz()}
                      className="px-12 py-4 text-xl font-black bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all transform active:scale-95"
                    >
                      Continue Quiz 🔄
                    </button>
                  </div>
                )}

                <button
                  onClick={() => startQuiz()}
                  className="px-12 py-4 text-xl font-black bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all transform active:scale-95"
                >
                  {hasSavedQuiz ? 'Start New Quiz 🚀' : 'Start Quiz 🚀'}
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
                  {/* Question counter with streak */}
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-blue-900">
                      Question {currentQuestionIndex + 1} / {questions.length}
                    </div>
                    {/* Streak indicator - Clean Duolingo-style design */}
                    {streak >= 3 && (
                      <motion.div
                        ref={streakRef}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.3 }}
                      >
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full shadow-md">
                          <Flame className="w-4 h-4 text-white" />
                          <span className="text-sm font-bold text-white">
                            {streak} Current Streak
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div className="text-sm font-bold text-blue-900">
                    Score: {score}/{questions.length}
                  </div>
                </div>

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

        {/* RESULT STATE - Show completion screen with "Open Node" button */}
        {gameState === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-2xl mx-auto"
          >
            <PuffyCard color="purple" size="lg" onClick={undefined}>
              <div className="text-center">
                {/* Celebration Header */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  className="mb-6"
                >
                  <h2 className="text-4xl font-black text-purple-900 mb-2">
                    🎉 Quiz Complete! 🎉
                  </h2>
                  <p className="text-xl text-purple-700">
                    Great job! You earned a reward!
                  </p>
                </motion.div>

                {/* Score Summary */}
                <div className="bg-white/50 rounded-2xl p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-3xl font-black text-purple-600">
                        {score}/{questions.length}
                      </div>
                      <div className="text-sm text-gray-600 font-semibold">Correct Answers</div>
                    </div>
                    <div>
                      <div className="text-3xl font-black text-orange-600">
                        {highestStreak}
                      </div>
                      <div className="text-sm text-gray-600 font-semibold">Best Streak</div>
                    </div>
                  </div>
                </div>

                {/* Open Node Button */}
                <button
                  onClick={openNode}
                  className="px-16 py-5 text-2xl font-black bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all transform active:scale-95"
                >
                  Open Your Node! 🎁
                </button>
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

                {/* Main Node - Enhanced 3D Layered Icon */}
                <div
                  className={`relative w-40 h-40 rounded-full bg-gradient-to-br ${nodeColors[earnedNodeType]} shadow-2xl flex items-center justify-center border-4 border-white`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'translateZ(0)',
                  }}
                >
                  {/* 3D Icon with Multiple Layers for Fancy Depth */}
                  <motion.div
                    className="relative"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{
                      y: [-5, 5, -5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {/* Far back shadow layer (deepest) */}
                    <motion.span
                      className="absolute text-7xl opacity-10"
                      style={{
                        transform: 'translateZ(-50px) scale(1.2)',
                        filter: 'blur(12px)',
                      }}
                      animate={{
                        opacity: [0.1, 0.15, 0.1],
                        scale: [1.2, 1.25, 1.2],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      {nodeIcons[earnedNodeType]}
                    </motion.span>

                    {/* Back shadow layer */}
                    <motion.span
                      className="absolute text-7xl opacity-20"
                      style={{
                        transform: 'translateZ(-30px) scale(1.15)',
                        filter: 'blur(8px)',
                      }}
                      animate={{
                        opacity: [0.2, 0.25, 0.2],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.3,
                      }}
                    >
                      {nodeIcons[earnedNodeType]}
                    </motion.span>

                    {/* Middle shadow layer */}
                    <motion.span
                      className="absolute text-7xl opacity-40"
                      style={{
                        transform: 'translateZ(-15px) scale(1.08)',
                        filter: 'blur(4px)',
                      }}
                      animate={{
                        opacity: [0.4, 0.5, 0.4],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.6,
                      }}
                    >
                      {nodeIcons[earnedNodeType]}
                    </motion.span>

                    {/* Front main icon with 3D depth and shimmer */}
                    <motion.span
                      className="relative text-7xl"
                      style={{
                        transform: 'translateZ(25px)',
                        textShadow: '0 5px 15px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.2), 0 0 40px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.5)',
                        filter: 'drop-shadow(0 0 15px rgba(255,255,255,1))',
                      }}
                      animate={{
                        scale: [1, 1.05, 1],
                        filter: [
                          'drop-shadow(0 0 15px rgba(255,255,255,1))',
                          'drop-shadow(0 0 25px rgba(255,255,255,1)) drop-shadow(0 0 35px rgba(255,215,0,0.8))',
                          'drop-shadow(0 0 15px rgba(255,255,255,1))',
                        ],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    >
                      {nodeIcons[earnedNodeType]}
                    </motion.span>

                    {/* Front glow highlight with animated shimmer */}
                    <motion.span
                      className="absolute text-7xl"
                      style={{
                        transform: 'translateZ(35px) scale(0.95)',
                        filter: 'blur(3px)',
                        mixBlendMode: 'overlay',
                      }}
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                        scale: [0.95, 1, 0.95],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 0.5,
                      }}
                    >
                      {nodeIcons[earnedNodeType]}
                    </motion.span>

                    {/* Extra front sparkle layer */}
                    <motion.span
                      className="absolute text-7xl"
                      style={{
                        transform: 'translateZ(40px) scale(0.9)',
                        filter: 'blur(1px)',
                        mixBlendMode: 'screen',
                      }}
                      animate={{
                        opacity: [0, 0.6, 0],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    >
                      {nodeIcons[earnedNodeType]}
                    </motion.span>
                  </motion.div>
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
                      +{Math.round(xpEarned)} XP
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
