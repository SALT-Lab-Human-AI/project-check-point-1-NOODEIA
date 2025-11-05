"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PuffyCard } from '@/components/PuffyComponents';
import { Trophy, Medal, Award, Home, LayoutGrid, User, ArrowLeft, Zap, Target } from 'lucide-react';
import Top3Card from '@/components/Top3Card';
import AnimatedRank from '@/components/AnimatedRank';

interface LeaderboardRank {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  level: number;
  attempts?: number; // Quiz attempts in the selected timeframe
  iconType?: string;
  iconEmoji?: string;
  iconColor?: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState<LeaderboardRank[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardRank | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [showNavBar, setShowNavBar] = useState(false);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('all-time');
  const [leaderboardType, setLeaderboardType] = useState<'xp' | 'attempts'>('xp');

  useEffect(() => {
    checkAuth();
  }, []);

  // Refetch leaderboard when timeframe or type changes
  useEffect(() => {
    if (user?.id) {
      fetchLeaderboard(user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, leaderboardType, user?.id]);

  // Scroll detection for bottom nav
  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const body = document.body;

      const scrollTop = Math.ceil(window.scrollY ?? window.pageYOffset ?? doc.scrollTop ?? body.scrollTop ?? 0);
      const scrollHeight = Math.max(doc.scrollHeight, body.scrollHeight);
      const clientHeight = doc.clientHeight || window.innerHeight;

      const isScrollable = scrollHeight > clientHeight + 20;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      // Only show nav bar if page is scrollable AND user is at the bottom
      setShowNavBar(isScrollable && Math.abs(distanceFromBottom) <= 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      await fetchLeaderboard(session.user.id);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (userId: string) => {
    try {
      const response = await fetch(`/api/leaderboard?userId=${userId}&timeframe=${timeframe}&type=${leaderboardType}`);
      if (response.ok) {
        const data = await response.json();
        setRankings(data.rankings);
        setUserRank(data.userRank);
        setTotalUsers(data.totalUsers);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-200 to-blue-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100/60 via-purple-100 to-purple-100 flex items-center justify-center">
        <div className="text-purple-900 text-xl font-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100/60 via-purple-100 to-purple-100 pb-24">
      <div className="max-w-md mx-auto px-6 pt-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push('/achievements');
            }}
            className="relative z-10 p-2 rounded-xl bg-white/50 hover:bg-white/70 transition-colors cursor-pointer active:scale-95 touch-manipulation"
            style={{ pointerEvents: 'auto', WebkitTapHighlightColor: 'transparent' }}
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 pointer-events-none" />
          </button>
          <h1 className="text-3xl font-black text-purple-900 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-600" />
            Leaderboard
          </h1>
        </div>

        {/* Star Players Heading and Leaderboard Type Selector */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-black text-purple-900 flex items-center gap-2">
            <Medal className="w-6 h-6" />
            Star Players
          </h2>
          
          {/* Leaderboard Type Selector */}
          <div className="flex gap-1 bg-white/50 backdrop-blur-sm rounded-xl p-1">
            <button
              onClick={() => setLeaderboardType('xp')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                leaderboardType === 'xp'
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Zap className="w-3 h-3" />
              XP
            </button>
            <button
              onClick={() => setLeaderboardType('attempts')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1 ${
                leaderboardType === 'attempts'
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Target className="w-3 h-3" />
              Attempts
            </button>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="mb-6">
          <div className="flex gap-2 bg-white/50 backdrop-blur-sm rounded-2xl p-1.5">
            {(['daily', 'weekly', 'monthly', 'all-time'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  timeframe === tf
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                {tf === 'all-time' ? 'All Time' : tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Cards */}
        {rankings.length > 0 && rankings.filter(r => r.rank <= 3).length > 0 && (
          <div className="mt-32 mb-8">
            <div className="flex items-end justify-center gap-3">
              {(() => {
                const top3 = rankings
                  .filter(r => r.rank <= 3)
                  .sort((a, b) => a.rank - b.rank);
                
                // Reorder: 2nd, 1st, 3rd (so 1st is in the middle)
                const ordered = [
                  top3.find(r => r.rank === 2),
                  top3.find(r => r.rank === 1),
                  top3.find(r => r.rank === 3)
                ].filter(Boolean); // Remove undefined entries if a rank is missing
                
                return ordered.map((rankEntry) => (
                  <Top3Card
                    key={rankEntry.userId}
                    rank={rankEntry.rank}
                    userId={rankEntry.userId}
                    name={rankEntry.name}
                    xp={rankEntry.xp}
                    level={rankEntry.level}
                    attempts={rankEntry.attempts}
                    iconType={rankEntry.iconType}
                    iconEmoji={rankEntry.iconEmoji}
                    iconColor={rankEntry.iconColor}
                    isCurrentUser={rankEntry.userId === user?.id}
                    displayType={leaderboardType}
                  />
                ));
              })()}
            </div>
          </div>
        )}

        {/* Remaining Rankings List */}
        {rankings.filter(r => r.rank > 3 && !rankings.filter(t => t.rank <= 3).some(t => t.userId === r.userId)).length > 0 && (
          <PuffyCard color="blue" size="lg" className="mb-8" onClick={undefined}>
            <h2 className="text-2xl font-black text-blue-900 mb-6 flex items-center gap-2">
              <Medal className="w-6 h-6" />
              Top Players
            </h2>

            <div className="space-y-3">
              {rankings
                .filter(r => {
                  // Exclude top 3 from this list
                  const top3UserIds = rankings.filter(t => t.rank <= 3).map(t => t.userId)
                  return r.rank > 3 && !top3UserIds.includes(r.userId)
                })
                .sort((a, b) => a.rank - b.rank) // Ensure proper sorting by rank
                .slice(0, 20) // Limit to maximum 20 players
                .map((rankEntry, index) => {
                  // Calculate display rank: start from 4 (after top 3)
                  const displayRank = index + 4;
                  const isCurrentUser = rankEntry.userId === user?.id;
                  const rankIcon = getRankIcon(displayRank);
                  const rankColor = getRankColor(displayRank);

                  return (
                    <div
                      key={rankEntry.userId}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 shadow-lg'
                          : 'bg-white/60'
                      }`}
                    >
                      {/* Rank Number */}
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${rankColor} shadow-md flex items-center justify-center flex-shrink-0`}>
                        {rankIcon ? (
                          <span className="text-2xl">{rankIcon}</span>
                        ) : (
                          <span className="text-lg font-black text-white">{displayRank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      {rankEntry.iconEmoji && rankEntry.iconEmoji.trim() ? (
                        <div className="text-2xl">
                          {rankEntry.iconEmoji}
                        </div>
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white"
                          style={{
                            backgroundColor: rankEntry.iconColor || (() => {
                              const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
                              if (rankEntry.userId) {
                                const hash = rankEntry.userId.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
                                return colors[Math.abs(hash) % colors.length];
                              }
                              return colors[0];
                            })()
                          }}
                        >
                          {(() => {
                            if (!rankEntry.name) return '?';
                            const names = rankEntry.name.trim().split(' ');
                            if (names.length >= 2) {
                              return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
                            }
                            return rankEntry.name.substring(0, 2).toUpperCase();
                          })()}
                        </div>
                      )}

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`font-bold text-gray-900 truncate ${isCurrentUser ? 'text-purple-900' : ''}`}>
                            {rankEntry.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Level {rankEntry.level} · {
                            leaderboardType === 'attempts' && rankEntry.attempts !== undefined
                              ? `${rankEntry.attempts} Attempt${rankEntry.attempts === 1 ? '' : 's'}`
                              : `${Math.round(rankEntry.xp).toLocaleString()} XP`
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </PuffyCard>
        )}

        {/* User's Rank Card - Always shown at bottom */}
        {userRank ? (
          <PuffyCard color="purple" size="md" className="mb-8">
            <div className="text-center">
              <div className="text-sm font-bold text-purple-700 mb-2">Your Rank</div>
              <div className="mb-2">
                <AnimatedRank rank={userRank.rank} className="text-6xl" />
              </div>
              <div className="text-lg font-bold text-purple-900 mb-1">{userRank.name}</div>
              <div className="text-xs text-purple-600">
                {leaderboardType === 'attempts' && userRank.attempts !== undefined
                  ? `${userRank.attempts} Attempt${userRank.attempts === 1 ? '' : 's'} · Level ${userRank.level}`
                  : `${Math.round(userRank.xp).toLocaleString()} XP · Level ${userRank.level}`
                }
              </div>
              <div className="text-xs text-purple-500 mt-2">
                Out of {totalUsers} players
              </div>
            </div>
          </PuffyCard>
        ) : (
          <PuffyCard color="purple" size="md" className="mb-8">
            <div className="text-center">
              <div className="text-sm font-bold text-purple-700 mb-2">Your Rank</div>
              <AnimatedRank rank={null} className="text-2xl" />
              <div className="text-xs text-purple-500 mt-2">
                Complete quizzes to appear on the leaderboard
              </div>
            </div>
          </PuffyCard>
        )}

        {/* Empty State */}
        {rankings.length === 0 && (
          <PuffyCard color="blue" size="lg" onClick={undefined}>
            <div className="text-center py-12">
              <Trophy className="w-20 h-20 mx-auto mb-4 text-blue-400" />
              <h3 className="text-2xl font-black text-blue-900 mb-2">No Rankings Yet!</h3>
              <p className="text-blue-700">Complete quizzes to climb the leaderboard.</p>
            </div>
          </PuffyCard>
        )}
      </div>

      {/* Bottom Navigation Bar - Animated Liquid Glass (appears on scroll to bottom) */}
      <div
        className={`fixed bottom-0 left-0 right-0 pb-safe z-50 transition-all duration-300 ${
          showNavBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="max-w-md mx-auto px-4 pb-4">
          <div className="relative bg-white/15 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.3)] border border-white/20 overflow-hidden">
            {/* Glass morphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5 pointer-events-none" />

            <div className="relative flex items-center justify-around px-4 py-2.5">
              {/* Home */}
              <button
                onClick={() => router.push('/home')}
                className="relative flex flex-col items-center gap-1 transition-all duration-300 group"
              >
                <div className="relative p-2 rounded-xl transform group-active:scale-95 transition-all group-hover:bg-gray-100/50">
                  <Home size={18} className="text-gray-500 group-active:text-gray-700 transition-colors" />
                </div>
                <span className="text-[9px] font-medium text-gray-500">Home</span>
              </button>

              {/* Grid/Dashboard */}
              <button
                onClick={() => router.push('/todo')}
                className="relative flex flex-col items-center gap-1 transition-all duration-300 group"
              >
                <div className="relative p-2 rounded-xl transform group-active:scale-95 transition-all group-hover:bg-gray-100/50">
                  <LayoutGrid size={18} className="text-gray-500 group-active:text-gray-700 transition-colors" />
                </div>
                <span className="text-[9px] font-medium text-gray-500">To Do</span>
              </button>

              {/* Achievements */}
              <button
                onClick={() => router.push('/achievements')}
                className="relative flex flex-col items-center gap-1 transition-all duration-300 group"
              >
                <div className="relative p-2 rounded-xl transform group-active:scale-95 transition-all group-hover:bg-gray-100/50">
                  <Trophy size={18} className="text-gray-500 group-active:text-gray-700 transition-colors" />
                </div>
                <span className="text-[9px] font-medium text-gray-500">Achievements</span>
              </button>

              {/* Profile */}
              <button
                onClick={() => router.push('/settings')}
                className="relative flex flex-col items-center gap-1 transition-all duration-300 group"
              >
                <div className="relative p-2 rounded-xl transform group-active:scale-95 transition-all group-hover:bg-gray-100/50">
                  <User size={18} className="text-gray-500 group-active:text-gray-700 transition-colors" />
                </div>
                <span className="text-[9px] font-medium text-gray-500">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
