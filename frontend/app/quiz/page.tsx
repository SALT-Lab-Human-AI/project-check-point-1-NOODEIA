"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PuffyCard, PuffyButton } from '@/components/PuffyComponents';
import { ClipboardCheck, ArrowLeft } from 'lucide-react';

export default function QuizPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-purple-100 flex items-center justify-center">
        <div className="text-blue-900 text-xl font-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-purple-100 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <PuffyCard color="blue" size="lg" className="text-center">
          <div className="mb-6">
            <ClipboardCheck size={80} className="text-blue-600 mx-auto mb-4" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-blue-900 mb-4">
            Quiz Feature
          </h1>

          <p className="text-xl text-blue-700 font-bold mb-8">
            Coming Soon! 🎯
          </p>

          <p className="text-blue-600 font-semibold mb-8 max-w-md mx-auto">
            We're working hard to bring you interactive quizzes and challenges to test your knowledge. Stay tuned!
          </p>

          <PuffyButton
            variant="white"
            size="lg"
            icon={<ArrowLeft size={20} />}
            onClick={() => router.push('/home')}
          >
            Back to Dashboard
          </PuffyButton>
        </PuffyCard>
      </div>
    </div>
  );
}
