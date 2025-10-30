"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  PuffyCard,
  PuffyButton,
  PuffyProgressCircle,
  PuffyBadge
} from '@/components/PuffyComponents';
import {
  Brain,
  Users,
  ClipboardCheck,
  BookOpen,
  Sparkles,
  MessageSquare,
  PenTool,
  Trophy,
  Home,
  LayoutGrid,
  User
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNavBar, setShowNavBar] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Scroll detection for bottom nav bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      const hasScrollableContent = scrollHeight > clientHeight;
      const isAtBottom = distanceFromBottom < 5;

      // Show nav bar if: no scrollable content OR user is at/near bottom
      setShowNavBar(!hasScrollableContent || isAtBottom);
    };

    window.addEventListener('scroll', handleScroll);
    // Check initial position immediately
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      // Fetch user's XP and level
      await fetchUserStats(session.user.id);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (userId) => {
    try {
      const response = await fetch(`/api/user/xp?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserLevel(data.level || 1);
        setUserXP(data.xp || 0);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
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
      {/* Header */}
      <div className="max-w-md mx-auto px-6 pt-8 mb-6">
        <div className="pl-4">
          <p className="font-semibold mb-1" style={{ color: '#E48B41' }}>Hello {user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'},</p>
          <h1 className="text-4xl font-black mb-6" style={{
            color: 'rgba(255, 255, 255, 0.85)',
            textShadow: '0 4px 12px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.2)'
          }}>
            Continue Learning!
          </h1>
        </div>

        {/* Stats Card - Glass Morphism matching GamificationBar */}
        <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/20 mb-6 overflow-hidden">
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

          <div className="relative grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-orange-600">{userLevel}</div>
              <div className="text-xs font-bold text-gray-600">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-orange-600">{Math.round(userXP)}</div>
              <div className="text-xs font-bold text-gray-600">XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-orange-600">0</div>
              <div className="text-xs font-bold text-gray-600">Quizzes</div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="mb-4">
          <h2 className="text-xl font-black text-gray-800">Features</h2>
        </div>
      </div>

      {/* Dashboard Grid - Narrower cards */}
      <div className="max-w-md mx-auto px-6 grid grid-cols-2 gap-4">

        {/* AI Tutor Card */}
        <div className="animate-float">
          <PuffyCard
            color="purple"
            size="md"
            onClick={() => router.push('/ai')}
            className="aspect-square"
          >
            <div className="flex flex-col items-center justify-center h-full">
              {/* Progress Circle */}
              <div className="mb-4">
                <PuffyProgressCircle
                  progress={0}
                  size={64}
                  color="purple"
                >
                  <Brain size={28} className="text-purple-600" />
                </PuffyProgressCircle>
              </div>

              {/* Title */}
              <h3 className="text-lg font-black text-purple-900 mb-1">
                Ask Noodeia
              </h3>

              {/* Progress Text */}
              <p className="text-xs font-bold text-purple-700">
                Start learning
              </p>
            </div>
          </PuffyCard>
        </div>

        {/* Group Chat Card */}
        <div className="animate-float" style={{ animationDelay: '0.2s' }}>
          <PuffyCard
            color="pink"
            size="md"
            onClick={() => router.push('/groupchat')}
            className="aspect-square"
          >
            <div className="flex flex-col items-center justify-center h-full">
              {/* Progress Circle */}
              <div className="mb-4">
                <PuffyProgressCircle
                  progress={0}
                  size={64}
                  color="pink"
                >
                  <Users size={28} className="text-pink-600" />
                </PuffyProgressCircle>
              </div>

              {/* Title */}
              <h3 className="text-lg font-black text-pink-900 mb-1">
                Group Chat
              </h3>

              {/* Progress Text */}
              <p className="text-xs font-bold text-pink-700">
                Study together
              </p>
            </div>
          </PuffyCard>
        </div>

        {/* Quiz Card */}
        <div className="animate-float" style={{ animationDelay: '0.4s' }}>
          <PuffyCard
            color="blue"
            size="md"
            onClick={() => router.push('/quiz')}
            className="aspect-square"
          >
            <div className="flex flex-col items-center justify-center h-full">
              {/* Progress Circle */}
              <div className="mb-4">
                <PuffyProgressCircle
                  progress={0}
                  size={64}
                  color="blue"
                >
                  <ClipboardCheck size={28} className="text-blue-600" />
                </PuffyProgressCircle>
              </div>

              {/* Title */}
              <h3 className="text-lg font-black text-blue-900 mb-1">
                Quiz Time
              </h3>

              {/* Progress Text */}
              <p className="text-xs font-bold text-blue-700">
                Test yourself
              </p>
            </div>
          </PuffyCard>
        </div>

        {/* Notes Card */}
        <div className="animate-float" style={{ animationDelay: '0.6s' }}>
          <PuffyCard
            color="yellow"
            size="md"
            onClick={() => router.push('/notes')}
            className="aspect-square"
          >
            <div className="flex flex-col items-center justify-center h-full">
              {/* Progress Circle */}
              <div className="mb-4">
                <PuffyProgressCircle
                  progress={0}
                  size={64}
                  color="green"
                >
                  <BookOpen size={28} className="text-green-600" />
                </PuffyProgressCircle>
              </div>

              {/* Title */}
              <h3 className="text-lg font-black text-yellow-900 mb-1">
                Notes
              </h3>

              {/* Progress Text */}
              <p className="text-xs font-bold text-yellow-800">
                Coming soon
              </p>
            </div>
          </PuffyCard>
        </div>

      </div>

      {/* Bottom Navigation Bar - Animated Liquid Glass (appears on scroll to bottom) */}
      <div
        className={`fixed bottom-0 left-0 right-0 pb-safe transition-all duration-300 ${
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
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-100/40 to-pink-200/40 rounded-xl blur-md opacity-50 group-active:opacity-70 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-pink-100/60 to-pink-200/60 p-2 rounded-xl shadow-md transform group-active:scale-95 transition-transform backdrop-blur-sm">
                    <Home size={18} className="text-pink-400" strokeWidth={2.5} />
                  </div>
                </div>
                <span className="text-[9px] font-bold text-pink-400">Home</span>
              </button>

              {/* Grid/Dashboard */}
              <button
                onClick={() => router.push('/home')}
                className="relative flex flex-col items-center gap-1 transition-all duration-300 group"
              >
                <div className="relative p-2 rounded-xl transform group-active:scale-95 transition-all group-hover:bg-gray-100/50">
                  <LayoutGrid size={18} className="text-gray-500 group-active:text-gray-700 transition-colors" />
                </div>
                <span className="text-[9px] font-medium text-gray-500">Menu</span>
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
