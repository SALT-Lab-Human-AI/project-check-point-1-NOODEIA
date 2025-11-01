"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PuffyCard, PuffyButton } from '@/components/PuffyComponents';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function NotesPage() {
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
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-green-100 to-blue-100 flex items-center justify-center">
        <div className="text-green-900 text-xl font-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-green-100 to-blue-100 p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <PuffyCard color="green" size="lg" className="text-center">
          <div className="mb-6">
            <BookOpen size={80} className="text-green-600 mx-auto mb-4" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-green-900 mb-4">
            Notes Feature
          </h1>

          <p className="text-xl text-green-700 font-bold mb-8">
            Coming Soon! 📝
          </p>

          <p className="text-green-600 font-semibold mb-8 max-w-md mx-auto">
            We're building smart note-taking with mind maps and markdown support. Get ready to organize your learning like never before!
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
