"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import VocabularyGame from '@/components/VocabularyGame';
import { Home } from 'lucide-react';

export default function GamesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGameActive, setIsGameActive] = useState(false); // Track if user is playing a game

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
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-100/60 via-purple-100 to-purple-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/home')}
            className="glass-button glass-button-light flex items-center gap-2 px-4 py-2 rounded-full"
          >
            <Home size={20} />
            <span className="font-semibold">{isGameActive ? 'Go back to the Game page' : 'Homepage'}</span>
          </button>

          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Learning Games 🎮
          </h1>

          <div className="w-32" />
        </div>

        {/* Games Content */}
        <VocabularyGame onGameStateChange={setIsGameActive} />
      </div>
    </div>
  );
}
