'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Circle, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
}

interface ActiveTasksListProps {
  userId: string;
}

export default function ActiveTasksList({ userId }: ActiveTasksListProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    try {
      const response = await fetch(`/api/kanban/tasks?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Filter for only TODO and IN_PROGRESS tasks (limit to 3 for display)
        const activeTasks = data.tasks
          .filter((task: Task) => task.status === 'todo' || task.status === 'inprogress')
          .slice(0, 3);
        setTasks(activeTasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Priority dot color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    if (status === 'inprogress') {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
          <Flame className="w-3 h-3 text-orange-600" />
          <span className="text-xs font-bold text-orange-700">In Progress</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full">
        <Circle className="w-3 h-3 text-blue-600" />
        <span className="text-xs font-bold text-blue-700">To Do</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/20 mb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <div className="relative text-center text-gray-600 text-sm">Loading tasks...</div>
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

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">✨</div>
            <div className="text-xs font-bold text-gray-600">No active tasks</div>
            <div className="text-xs text-gray-500 mt-1">Create tasks in the Todo tab</div>
          </div>
        ) : (
          <div className="space-y-2 mb-3">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 border border-white/40 hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Priority dot */}
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getPriorityColor(task.priority)}`} />

                  {/* Task content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-bold text-gray-800 line-clamp-1">
                        {task.title}
                      </h4>
                      {getStatusBadge(task.status)}
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Check out todo list button */}
        <motion.button
          onClick={() => router.push('/todo')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Check out to do list</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
