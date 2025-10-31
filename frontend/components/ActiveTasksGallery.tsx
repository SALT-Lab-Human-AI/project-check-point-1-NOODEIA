'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowRight, Circle, Flame, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export default function ActiveTasksGallery({ userId }: ActiveTasksGalleryProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    try {
      const response = await fetch(`/api/kanban/tasks?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Filter for only TODO and IN_PROGRESS tasks
        const activeTasks = data.tasks.filter(
          (task: Task) => task.status === 'todo' || task.status === 'inprogress'
        );
        setTasks(activeTasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Priority gradient colors
  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'from-red-400 to-red-500';
      case 'medium':
        return 'from-amber-400 to-orange-500';
      case 'low':
        return 'from-green-400 to-emerald-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'inprogress') {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-white/30 backdrop-blur-sm rounded-full">
          <Flame className="w-3 h-3 text-white" />
          <span className="text-xs font-bold text-white">In Progress</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-white/30 backdrop-blur-sm rounded-full">
        <Circle className="w-3 h-3 text-white" />
        <span className="text-xs font-bold text-white">To Do</span>
      </div>
    );
  };

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
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-gray-800">Active Tasks</h3>
          {tasks.length > 0 && (
            <span className="text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          )}
        </div>

        {/* Scrollable Gallery */}
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">✨</div>
            <div className="text-xs font-bold text-gray-600">No active tasks</div>
            <div className="text-xs text-gray-500 mt-1">Create tasks in the Todo tab</div>
            <motion.button
              onClick={() => router.push('/todo')}
              className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Create your first task</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        ) : (
          <>
            {/* Horizontal scroll container */}
            <div
              ref={containerRef}
              className="relative overflow-hidden cursor-grab active:cursor-grabbing"
              style={{ height: '200px' }}
            >
              <motion.div
                drag="x"
                dragConstraints={containerRef}
                dragElastic={0.1}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => {
                  setIsDragging(false);
                  // Snap to nearest card
                  const currentX = x.get();
                  const cardWidth = 280; // Card width + gap
                  const snapIndex = Math.round(-currentX / cardWidth);
                  const snapX = -snapIndex * cardWidth;
                  animate(x, snapX, {
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  });
                }}
                style={{ x }}
                className="flex gap-4 h-full"
              >
                {/* Task Cards */}
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    className={`relative flex-shrink-0 w-64 bg-gradient-to-br ${getPriorityGradient(
                      task.priority
                    )} rounded-2xl p-4 shadow-xl select-none`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Priority badge (top left) */}
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-1 bg-white/30 backdrop-blur-sm px-2 py-1 rounded-full">
                        <AlertCircle className="w-3 h-3 text-white" />
                        <span className="text-xs font-bold text-white capitalize">
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    {/* Status badge (top right) */}
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={task.status} />
                    </div>

                    {/* Task content */}
                    <div className="mt-12 space-y-2">
                      <h4 className="text-base font-bold text-white line-clamp-2 min-h-[2.5rem]">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-sm text-white/90 line-clamp-3 min-h-[3.75rem]">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Card index indicator */}
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                      <div className="flex items-center gap-1">
                        {tasks.map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              i === index
                                ? 'bg-white w-4'
                                : 'bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Check out todo list card */}
                <motion.div
                  className="relative flex-shrink-0 w-64 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center select-none cursor-pointer"
                  onClick={(e) => {
                    if (!isDragging) {
                      router.push('/todo');
                    }
                  }}
                  whileHover={{ scale: isDragging ? 1 : 1.05 }}
                  whileTap={{ scale: isDragging ? 1 : 0.95 }}
                >
                  <div className="text-4xl mb-3">📋</div>
                  <h4 className="text-lg font-black text-white mb-2">
                    View All Tasks
                  </h4>
                  <p className="text-sm text-white/90 mb-4">
                    Manage your complete to-do list
                  </p>
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span>Check out to do list</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Scroll hint */}
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
              <span>←</span>
              <span>Swipe to browse</span>
              <span>→</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
