'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, AlertCircle, Circle } from 'lucide-react';

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

  // Circular positioning calculation
  const getCardPosition = (index: number, total: number) => {
    const radius = 140; // Distance from center
    const centerX = 0;
    const centerY = 0;

    // Calculate angle for this card
    const angleStep = (2 * Math.PI) / Math.max(total, 3); // At least 3 positions
    const angle = index * angleStep - Math.PI / 2; // Start from top

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    return { x, y, angle };
  };

  // Handle card selection
  const handleCardClick = (index: number) => {
    setSelectedIndex(index);
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

  const selectedTask = tasks[selectedIndex];

  return (
    <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/20 mb-6 overflow-hidden">
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      <div className="relative">
        {/* Title */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-black text-gray-800 flex items-center justify-center gap-2">
            <span>Active Tasks</span>
            <span className="text-sm font-normal bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </h3>
        </div>

        {/* Circular Gallery Container */}
        <div className="relative" style={{ height: '320px' }}>
          {/* Center display area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-[280px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTask.id}
                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="relative"
                >
                  {/* Selected Task Card */}
                  <div className={`relative bg-gradient-to-br ${getPriorityColor(selectedTask.priority)} rounded-2xl p-4 shadow-2xl`}>
                    {/* Status badge */}
                    <div className="absolute -top-2 -right-2 text-2xl">
                      {getStatusEmoji(selectedTask.status)}
                    </div>

                    {/* Task content */}
                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-white line-clamp-2">
                        {selectedTask.title}
                      </h4>

                      {selectedTask.description && (
                        <p className="text-xs text-white/90 line-clamp-2">
                          {selectedTask.description}
                        </p>
                      )}

                      {/* Priority indicator */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                          <AlertCircle className="w-3 h-3 text-white" />
                          <span className="text-xs font-bold text-white capitalize">
                            {selectedTask.priority}
                          </span>
                        </div>

                        {/* Due date */}
                        {selectedTask.dueDate && (
                          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                            <Calendar className="w-3 h-3 text-white" />
                            <span className="text-xs font-bold text-white">
                              {formatDueDate(selectedTask.dueDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Circular task indicators */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {tasks.map((task, index) => {
              const { x, y } = getCardPosition(index, tasks.length);
              const isSelected = index === selectedIndex;

              return (
                <motion.button
                  key={task.id}
                  className="absolute pointer-events-auto"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: x - 12, // Offset for button size
                    y: y - 12,
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  onClick={() => handleCardClick(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className={`w-6 h-6 rounded-full transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg ring-2 ring-white'
                      : 'bg-white/40 backdrop-blur-sm hover:bg-white/60'
                  }`}>
                    {isSelected && (
                      <Circle className="w-6 h-6 text-white fill-current" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
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
      </div>
    </div>
  );
}
