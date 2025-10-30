"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { supabase } from '@/lib/supabase';
import { PuffyCard } from '@/components/PuffyComponents';
import {
  ArrowLeft,
  Check,
  X,
  Flame
} from 'lucide-react';
import RewardIcon from '@/components/RewardIcon';

type GameState = 'menu' | 'quiz' | 'result';
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

  // XP and level state (for result display and reveal page)
  const [xpEarned, setXpEarned] = useState(0);
  const [oldXP, setOldXP] = useState(0);
  const [newXP, setNewXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);

  // Refs for GSAP animations
  const streakRef = useRef<HTMLDivElement>(null);
  const rewardCard1Ref = useRef<HTMLDivElement>(null);
  const rewardCard2Ref = useRef<HTMLDivElement>(null);
  const rewardCard3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
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

    // Calculate the final score (current score + 1 if this answer is correct)
    const finalScore = correct ? score + 1 : score;

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
    if (currentQuestionIndex < questions.length - 1) {
      // Delay before next question (for answer feedback)
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      }, 1500);
    } else {
      // Pass the calculated final score to avoid state timing issues
      endQuiz(finalScore);
    }
  };

  const endQuiz = async (finalScore?: number) => {
    try {
      // Use the passed finalScore to avoid state timing issues, fall back to state score if not provided
      const scoreToSubmit = finalScore !== undefined ? finalScore : score;

      // Submit quiz to backend (nodeType is determined by performance on backend)
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          sessionId,
          score: scoreToSubmit,
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
    try {
      // Build URL with all quiz data as parameters
      const params = new URLSearchParams({
        nodeType: earnedNodeType,
        xpEarned: xpEarned.toString(),
        oldXP: oldXP.toString(),
        newXP: newXP.toString(),
        currentLevel: currentLevel.toString(),
        score: score.toString(),
        totalQuestions: questions.length.toString()
      });

      router.push(`/quiz/reveal?${params.toString()}`);
    } catch (error) {
      console.error('Navigation error:', error);
      alert('Failed to open reveal page. Please try again.');
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-purple-900 text-xl font-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-cyan-50 to-sky-50 p-4 sm:p-8">
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
                className="glass-button glass-button-light flex items-center gap-2 px-4 py-2 rounded-full"
              >
                <ArrowLeft size={20} />
                <span className="font-semibold">Back</span>
              </button>

              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Math Quiz 🎮
              </h1>

              <div className="w-20" />
            </div>

            {/* Earn Your Rewards */}
            <PuffyCard color="blue" size="lg" className="mb-6" onClick={undefined}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-blue-900 mb-3">Earn Your Rewards</h2>
                <p className="text-blue-700 text-lg mb-4">Answer 5 math questions and earn rewards based on your performance!</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8" style={{ perspective: '1500px' }}>
                  {/* Common Node Card */}
                  <div
                    ref={rewardCard1Ref}
                    onMouseMove={(e) => handleCardMouseMove(e, rewardCard1Ref)}
                    onMouseLeave={() => handleCardMouseLeave(rewardCard1Ref)}
                    className="relative rounded-2xl p-6 border-2 cursor-pointer transition-all hover:scale-105"
                    style={{
                      transformStyle: 'preserve-3d',
                      background: 'linear-gradient(to bottom right, #E4B953, #F8EAC1)',
                      borderColor: 'rgba(228, 185, 83, 0.5)',
                      boxShadow: '0 10px 30px rgba(228,185,83,0.3), 0 0 20px rgba(248,234,193,0.3)',
                    }}
                  >
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-2xl opacity-40 blur-xl -z-10" style={{ background: 'linear-gradient(to bottom right, #E4B953, #F8EAC1)' }} />
                    <div className="flex justify-center mb-3">
                      <RewardIcon type="common" size="lg" animate={true} />
                    </div>
                    <div className="font-black text-xl text-gray-800 mb-1">Common Node</div>
                    <div className="text-sm text-gray-700 font-semibold mb-1">30% or more</div>
                    <div className="text-lg text-gray-800 font-bold bg-white/50 rounded-lg px-3 py-1 inline-block">3-7 XP</div>
                  </div>

                  {/* Rare Node Card */}
                  <div
                    ref={rewardCard2Ref}
                    onMouseMove={(e) => handleCardMouseMove(e, rewardCard2Ref)}
                    onMouseLeave={() => handleCardMouseLeave(rewardCard2Ref)}
                    className="relative rounded-2xl p-6 border-2 cursor-pointer transition-all hover:scale-105"
                    style={{
                      transformStyle: 'preserve-3d',
                      background: 'linear-gradient(to bottom right, #FAB9CA, #F8EAC1)',
                      borderColor: 'rgba(250, 185, 202, 0.5)',
                      boxShadow: '0 10px 30px rgba(250,185,202,0.3), 0 0 25px rgba(248,234,193,0.4)',
                    }}
                  >
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-2xl opacity-40 blur-xl -z-10" style={{ background: 'linear-gradient(to bottom right, #FAB9CA, #F8EAC1)' }} />
                    <div className="flex justify-center mb-3">
                      <RewardIcon type="rare" size="lg" animate={true} />
                    </div>
                    <div className="font-black text-xl text-gray-800 mb-1">Rare Node</div>
                    <div className="text-sm text-gray-700 font-semibold mb-1">80% or more</div>
                    <div className="text-lg text-gray-800 font-bold bg-white/50 rounded-lg px-3 py-1 inline-block">12-15 XP</div>
                  </div>

                  {/* Legendary Node Card */}
                  <div
                    ref={rewardCard3Ref}
                    onMouseMove={(e) => handleCardMouseMove(e, rewardCard3Ref)}
                    onMouseLeave={() => handleCardMouseLeave(rewardCard3Ref)}
                    className="relative rounded-2xl p-6 border-2 cursor-pointer transition-all hover:scale-105"
                    style={{
                      transformStyle: 'preserve-3d',
                      background: 'linear-gradient(to bottom right, #F58FA8, #FAB9CA)',
                      borderColor: 'rgba(245, 143, 168, 0.5)',
                      boxShadow: '0 10px 30px rgba(245,143,168,0.4), 0 0 30px rgba(250,185,202,0.5)',
                    }}
                  >
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-2xl opacity-40 blur-xl -z-10" style={{ background: 'linear-gradient(to bottom right, #F58FA8, #FAB9CA)' }} />
                    <div className="flex justify-center mb-3">
                      <RewardIcon type="legendary" size="lg" animate={true} />
                    </div>
                    <div className="font-black text-xl text-gray-800 mb-1">Legendary Node</div>
                    <div className="text-sm text-gray-700 font-semibold mb-1">100% correct</div>
                    <div className="text-lg text-gray-800 font-bold bg-white/50 rounded-lg px-3 py-1 inline-block">25-30 XP</div>
                  </div>
                </div>

                {/* Quiz Action Buttons */}
                <div className="flex flex-col gap-4 items-center w-full max-w-md mx-auto">
                  {/* Show Continue Quiz button if there's a saved quiz */}
                  {hasSavedQuiz && (
                    <button
                      onClick={() => loadSavedQuiz()}
                      className="relative overflow-hidden w-full px-8 py-4 text-lg font-black rounded-2xl transition-all hover:scale-105 flex-shrink-0"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
                        color: 'rgba(30, 64, 175, 1)',
                        minHeight: '60px'
                      }}
                    >
                      Continue Quiz 🔄
                    </button>
                  )}

                  <button
                    onClick={() => startQuiz()}
                    className="relative overflow-hidden w-full px-8 py-4 text-lg font-black rounded-2xl transition-all hover:scale-105 flex-shrink-0"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
                      color: 'rgba(30, 64, 175, 1)',
                      minHeight: '60px'
                    }}
                  >
                    {hasSavedQuiz ? 'Start New Quiz 🚀' : 'Start Quiz 🚀'}
                  </button>
                </div>
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
              {/* Back Button */}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
                    saveQuizProgress();
                    setGameState('menu');
                  }
                }}
                className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg glass-button glass-button-light text-gray-700 font-medium hover:bg-white/30 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Menu
              </button>

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
                <h2 className="text-4xl sm:text-6xl font-bold text-blue-600">
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
                    className={`h-20 text-2xl font-bold rounded-2xl transition-all ${
                      selectedAnswer === option
                        ? isCorrect
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-[0_8px_24px_rgba(34,197,94,0.5)] border-2 border-green-400'
                          : 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-[0_8px_24px_rgba(239,68,68,0.5)] border-2 border-red-400'
                        : selectedAnswer !== null && option === answers[currentQuestionIndex]
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-[0_8px_24px_rgba(34,197,94,0.5)] border-2 border-green-400'
                        : 'glass-button glass-button-light hover:scale-105'
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

        {/* RESULT STATE - Show score and button */}
        {gameState === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-2xl mx-auto"
          >
            <PuffyCard color="blue" size="lg" onClick={undefined}>
              <div className="text-center">
                {/* Celebration Header */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  className="mb-6"
                >
                  <h2 className="text-4xl font-black text-blue-900 mb-2">
                    🎉 Quiz Complete! 🎉
                  </h2>
                  <p className="text-xl text-blue-700">
                    Great job! You earned a reward!
                  </p>
                </motion.div>

                {/* Score Summary */}
                <div className="bg-white/50 rounded-2xl p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-3xl font-black text-blue-600">
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

                {/* Node Type Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8"
                >
                  <div className="flex justify-center mb-4">
                    <RewardIcon type={earnedNodeType} size="lg" animate={true} />
                  </div>
                  <p className="text-lg font-semibold text-gray-700 capitalize">
                    You earned a <span className="font-black text-blue-600">{earnedNodeType}</span> node!
                  </p>
                </motion.div>

                {/* Open Node Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                  onClick={openNode}
                  className="relative overflow-hidden px-12 py-5 text-2xl font-black rounded-2xl transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
                    color: 'rgba(30, 64, 175, 1)'
                  }}
                >
                  Open the {earnedNodeType.charAt(0).toUpperCase() + earnedNodeType.slice(1)} Node 🎁
                </motion.button>
              </div>
            </PuffyCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
