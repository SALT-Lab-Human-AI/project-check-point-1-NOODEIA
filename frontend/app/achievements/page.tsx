"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PuffyCard } from '@/components/PuffyComponents';
import { ArrowLeft, Trophy, Flame, Zap, Award, Target, Star } from 'lucide-react';

interface QuizStats {
  totalQuizzes: number;
  bestStreak: number;
  totalXPFromQuiz: number;
  commonCompleted: number;
  rareCompleted: number;
  legendaryCompleted: number;
  currentXP: number;
  currentLevel: number;
}

interface RecentSession {
  id: string;
  nodeType: string;
  score: number;
  totalQuestions: number;
  streak: number;
  xpEarned: number;
  completedAt: any;
}

export default function AchievementsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      await fetchAchievements(session.user.id);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async (userId: string) => {
    try {
      const response = await fetch(`/api/achievements?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentSessions(data.recentSessions);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100/60 via-purple-100 to-purple-100 flex items-center justify-center">
        <div className="text-purple-900 text-xl font-black">Loading...</div>
      </div>
    );
  }

  const nodeIcons = {
    common: '⭐',
    rare: '💎',
    legendary: '👑'
  };

  const nodeColors = {
    common: 'from-gray-300 to-gray-500',
    rare: 'from-blue-400 to-blue-600',
    legendary: 'from-yellow-400 to-red-600'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100/60 via-purple-100 to-purple-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/home')}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back</span>
          </button>

          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-600" />
            Achievements
          </h1>

          <div className="w-20" />
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Level */}
          <PuffyCard color="purple" size="sm" onClick={undefined}>
            <div className="text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-3xl font-black text-purple-900">{stats?.currentLevel || 1}</div>
              <div className="text-xs font-bold text-purple-700">Level</div>
            </div>
          </PuffyCard>

          {/* Total XP */}
          <PuffyCard color="yellow" size="sm" onClick={undefined}>
            <div className="text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-3xl font-black text-yellow-900">{Math.round(stats?.currentXP || 0)}</div>
              <div className="text-xs font-bold text-yellow-700">Total XP</div>
            </div>
          </PuffyCard>

          {/* Best Streak */}
          <PuffyCard color="orange" size="sm" onClick={undefined}>
            <div className="text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-3xl font-black text-orange-900">{stats?.bestStreak || 0}</div>
              <div className="text-xs font-bold text-orange-700">Best Streak</div>
            </div>
          </PuffyCard>

          {/* Total Quizzes */}
          <PuffyCard color="green" size="sm" onClick={undefined}>
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-3xl font-black text-green-900">{stats?.totalQuizzes || 0}</div>
              <div className="text-xs font-bold text-green-700">Quizzes</div>
            </div>
          </PuffyCard>
        </div>

        {/* Quiz XP Breakdown */}
        <PuffyCard color="pink" size="md" className="mb-8" onClick={undefined}>
          <h2 className="text-2xl font-black text-pink-900 mb-4 flex items-center gap-2">
            <Star className="w-6 h-6" />
            Quiz XP Earned
          </h2>
          <div className="text-center mb-6">
            <div className="text-5xl font-black text-pink-600">{stats?.totalXPFromQuiz || 0} XP</div>
            <div className="text-sm text-pink-700 mt-2">From completing quizzes</div>
          </div>
        </PuffyCard>

        {/* Node Completions */}
        <PuffyCard color="blue" size="md" className="mb-8" onClick={undefined}>
          <h2 className="text-2xl font-black text-blue-900 mb-6">Nodes Completed</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Common */}
            <div className="text-center p-4 bg-white/50 rounded-2xl">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br ${nodeColors.common} shadow-lg flex items-center justify-center`}>
                <span className="text-4xl">{nodeIcons.common}</span>
              </div>
              <div className="text-sm font-bold text-gray-700">Common</div>
              <div className="text-3xl font-black text-gray-900">{stats?.commonCompleted || 0}</div>
            </div>

            {/* Rare */}
            <div className="text-center p-4 bg-white/50 rounded-2xl">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br ${nodeColors.rare} shadow-lg flex items-center justify-center`}>
                <span className="text-4xl">{nodeIcons.rare}</span>
              </div>
              <div className="text-sm font-bold text-blue-700">Rare</div>
              <div className="text-3xl font-black text-blue-900">{stats?.rareCompleted || 0}</div>
            </div>

            {/* Legendary */}
            <div className="text-center p-4 bg-white/50 rounded-2xl">
              <div className={`w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br ${nodeColors.legendary} shadow-lg flex items-center justify-center`}>
                <span className="text-4xl">{nodeIcons.legendary}</span>
              </div>
              <div className="text-sm font-bold text-yellow-700">Legendary</div>
              <div className="text-3xl font-black text-yellow-900">{stats?.legendaryCompleted || 0}</div>
            </div>
          </div>
        </PuffyCard>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <PuffyCard color="purple" size="md" onClick={undefined}>
            <h2 className="text-2xl font-black text-purple-900 mb-6">Recent Quizzes</h2>

            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-white/60 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${nodeColors[session.nodeType as keyof typeof nodeColors]} shadow-md flex items-center justify-center`}>
                      <span className="text-2xl">{nodeIcons[session.nodeType as keyof typeof nodeIcons]}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 capitalize">{session.nodeType} Node</div>
                      <div className="text-sm text-gray-600">
                        {session.score}/{session.totalQuestions} Correct · {session.streak} Streak
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-yellow-600">+{session.xpEarned} XP</div>
                    <div className="text-xs text-gray-500">
                      {((session.score / session.totalQuestions) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PuffyCard>
        )}

        {/* Empty State */}
        {stats?.totalQuizzes === 0 && (
          <PuffyCard color="purple" size="lg" onClick={undefined}>
            <div className="text-center py-12">
              <Trophy className="w-20 h-20 mx-auto mb-4 text-purple-400" />
              <h3 className="text-2xl font-black text-purple-900 mb-2">No Quizzes Yet!</h3>
              <p className="text-purple-700 mb-6">Complete your first quiz to start earning achievements.</p>
              <button
                onClick={() => router.push('/quiz')}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                Start First Quiz
              </button>
            </div>
          </PuffyCard>
        )}
      </div>
    </div>
  );
}
