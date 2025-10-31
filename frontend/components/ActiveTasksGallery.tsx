'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CircularGallery from '@/components/CircularGallery';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
}

interface ActiveTasksGalleryProps {
  userId: string;
}

const BASE_IMAGE_URL = 'https://picsum.photos';

const buildGalleryItems = (tasks: Task[]) =>
  tasks.map((task, index) => ({
    image: `${BASE_IMAGE_URL}/seed/${encodeURIComponent(task.id || String(index))}/800/600?grayscale`,
    text: task.title || 'Untitled Task'
  }));

export default function ActiveTasksGallery({ userId }: ActiveTasksGalleryProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadTasks = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/kanban/tasks?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to load tasks: ${response.status}`);
        }
        const data = await response.json();
        const activeTasks = data.tasks.filter(
          (task: Task) => task.status === 'todo' || task.status === 'inprogress'
        );
        setTasks(activeTasks);
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [userId]);

  const galleryItems = useMemo(() => buildGalleryItems(tasks), [tasks]);

  if (loading) {
    return (
      <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/20 mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <div className="relative text-center text-gray-600 text-sm py-8">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/20 mb-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-gray-800">Active Tasks</h3>
          {tasks.length > 0 && (
            <span className="text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-3xl mb-2">✨</div>
            <div className="text-xs font-bold text-gray-600">No active tasks</div>
            <div className="text-xs text-gray-500 mt-1">Create tasks in the Todo tab</div>
            <button
              onClick={() => router.push('/todo')}
              className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-sm shadow-md transition-transform hover:scale-[1.02]"
            >
              <span>Create your first task</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative w-full">
            <div className="h-[320px] w-full rounded-3xl overflow-hidden">
              <CircularGallery items={galleryItems} />
            </div>
            <div className="mt-4 text-center text-xs text-gray-500">Drag or scroll to explore your tasks</div>
          </div>
        )}
      </div>
    </div>
  );
}
