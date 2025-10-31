'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Calendar, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  status: string;
}

interface CircularTaskGalleryProps {
  userId: string;
}

export default function CircularTaskGallery({ userId }: CircularTaskGalleryProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

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

  // Priority colors matching kanban board
  const getPriorityColor = (priority: string) => {
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

  // Status indicator
  const getStatusEmoji = (status: string) => {
    return status === 'inprogress' ? '🔥' : '📝';
  };

  // Format due date
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  // Rotate gallery
  const handleRotate = (direction: 'left' | 'right') => {
    if (tasks.length === 0) return;

    if (direction === 'left') {
      setSelectedIndex((prev) => (prev - 1 + tasks.length) % tasks.length);
    } else {
      setSelectedIndex((prev) => (prev + 1) % tasks.length);
    }
  };

  // Handle swipe gestures
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;

    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0) {
        handleRotate('left');
      } else {
        handleRotate('right');
      }
    }
  };

  // Calculate card position and style based on index relative to selected
  const getCardStyle = (index: number) => {
    const diff = index - selectedIndex;
    const absDiff = Math.abs(diff);

    if (absDiff === 0) {
      // Center card
      return {
        x: 0,
        scale: 1,
        rotateY: 0,
        opacity: 1,
        zIndex: 10,
      };
    } else if (absDiff === 1) {
      // Adjacent cards
      return {
        x: diff * 220, // Horizontal spacing
        scale: 0.85,
        rotateY: diff * 25, // 3D rotation
        opacity: 0.7,
        zIndex: 5,
      };
    } else {
      // Far cards (hidden)
      return {
        x: diff * 220,
        scale: 0.7,
        rotateY: diff * 35,
        opacity: 0,
        zIndex: 0,
      };
    }
  };

  if (loading) {
    return (
      <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/20 mb-6">
        <div className="text-center text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/20 mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <div className="relative text-center">
          <div className="text-4xl mb-2">✨</div>
          <div className="text-sm font-bold text-gray-600">No active tasks</div>
          <div className="text-xs text-gray-500 mt-1">Create tasks in the Todo tab</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/20 mb-6 overflow-hidden">
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      <div className="relative">
        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-black text-gray-800 flex items-center justify-center gap-2">
            <span>Active Tasks</span>
            <span className="text-sm font-normal bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </h3>
        </div>

        {/* 3D Card Carousel Container */}
        <div className="relative overflow-hidden" style={{ height: '360px', perspective: '1000px' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            {tasks.map((task, index) => {
              const style = getCardStyle(index);
              const isCenter = index === selectedIndex;

              return (
                <motion.div
                  key={task.id}
                  className="absolute"
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                  animate={{
                    x: style.x,
                    scale: style.scale,
                    rotateY: style.rotateY,
                    opacity: style.opacity,
                    zIndex: style.zIndex,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                  }}
                  drag={isCenter ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  onClick={() => !isCenter && setSelectedIndex(index)}
                  whileHover={!isCenter ? { scale: style.scale * 1.05 } : {}}
                  className={isCenter ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                >
                  {/* Task Card - Taller and narrower */}
                  <div
                    className={`relative bg-gradient-to-br ${getPriorityColor(task.priority)} rounded-3xl shadow-2xl`}
                    style={{
                      width: '200px',  // Narrower
                      height: '280px', // Taller (portrait orientation)
                    }}
                  >
                    {/* Status badge */}
                    <div className="absolute -top-2 -right-2 text-2xl z-10">
                      {getStatusEmoji(task.status)}
                    </div>

                    {/* Card content */}
                    <div className="p-5 h-full flex flex-col">
                      {/* Task title */}
                      <h4 className="text-base font-bold text-white mb-3 line-clamp-3">
                        {task.title}
                      </h4>

                      {/* Task description */}
                      {task.description && (
                        <p className="text-xs text-white/90 mb-4 line-clamp-4 flex-grow">
                          {task.description}
                        </p>
                      )}

                      {/* Bottom section with priority and due date */}
                      <div className="space-y-2 mt-auto">
                        {/* Priority indicator */}
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <AlertCircle className="w-3 h-3 text-white" />
                          <span className="text-xs font-bold text-white capitalize">
                            {task.priority}
                          </span>
                        </div>

                        {/* Due date */}
                        {task.dueDate && (
                          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <Calendar className="w-3 h-3 text-white" />
                            <span className="text-xs font-bold text-white">
                              {formatDueDate(task.dueDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <motion.button
            onClick={() => handleRotate('left')}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg font-bold text-gray-700">←</span>
          </motion.button>

          <div className="text-xs font-bold text-gray-600">
            {selectedIndex + 1} / {tasks.length}
          </div>

          <motion.button
            onClick={() => handleRotate('right')}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg font-bold text-gray-700">→</span>
          </motion.button>
        </div>

        {/* Swipe hint text */}
        <div className="text-center mt-3">
          <p className="text-xs text-gray-500">
            Swipe or click cards to navigate
          </p>
        </div>
      </div>
    </div>
  );
}
