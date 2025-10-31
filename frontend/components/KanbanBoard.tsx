"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  GripVertical,
  Plus,
  Trash2,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Calendar,
  Flag,
  CheckCircle2,
  Circle,
  Home,
  LayoutGrid,
  Trophy,
  User
} from 'lucide-react';
import ThemeCycleButton from './ThemeCycleButton';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  icon: string;
  emoji: string;
  tasks: Task[];
}

interface KanbanBoardProps {
  userId: string;
  userName: string;
}

export default function KanbanBoard({ userId, userName }: KanbanBoardProps) {
  const router = useRouter();
  const [themeName, setThemeName] = useState('cream');
  const [showNavBar, setShowNavBar] = useState(false);

  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      color: 'from-blue-400 to-blue-500',
      icon: '📋',
      emoji: '📝',
      tasks: []
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      color: 'from-amber-400 to-orange-500',
      icon: '⚙️',
      emoji: '🔥',
      tasks: []
    },
    {
      id: 'done',
      title: 'Done',
      color: 'from-green-400 to-emerald-500',
      icon: '✅',
      emoji: '🎉',
      tasks: []
    }
  ]);

  const [draggedItem, setDraggedItem] = useState<{ taskId: string; sourceColumnId: string; taskIndex: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ columnId: string; index: number } | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [xpGain, setXpGain] = useState<number>(0);
  const [showXpAnimation, setShowXpAnimation] = useState(false);

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeName');
    if (savedTheme) {
      setThemeName(savedTheme);
    }
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', themeName);
    document.documentElement.style.colorScheme = 'light';
    localStorage.setItem('themeName', themeName);
  }, [themeName]);

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

      setShowNavBar(isScrollable && Math.abs(distanceFromBottom) <= 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Load tasks from API
  useEffect(() => {
    if (userId) {
      loadTasks();
    }
  }, [userId]);

  const loadTasks = async () => {
    try {
      const response = await fetch(`/api/kanban/tasks?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Organize tasks by column
        const columnMap: { [key: string]: Task[] } = {
          todo: [],
          inprogress: [],
          done: []
        };

        data.tasks.forEach((task: any) => {
          const columnId = task.status || 'todo';
          if (columnMap[columnId]) {
            columnMap[columnId].push(task);
          }
        });

        setColumns(prevColumns =>
          prevColumns.map(col => ({
            ...col,
            tasks: columnMap[col.id] || []
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const handleDragStart = (taskId: string, sourceColumnId: string, taskIndex: number) => {
    setDraggedItem({ taskId, sourceColumnId, taskIndex });
  };

  const handleDragOver = (e: React.DragEvent, columnId: string, overIndex: number) => {
    e.preventDefault();
    if (draggedItem) {
      setDropTarget({ columnId, index: overIndex });
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleDrop = async (targetColumnId: string, dropIndex: number) => {
    if (!draggedItem) return;

    const { taskId, sourceColumnId, taskIndex } = draggedItem;

    // Optimistic update
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const sourceCol = newColumns.find(c => c.id === sourceColumnId);
      const targetCol = newColumns.find(c => c.id === targetColumnId);

      if (!sourceCol || !targetCol) return prevColumns;

      const taskIndexInSource = sourceCol.tasks.findIndex(t => t.id === taskId);
      if (taskIndexInSource === -1) return prevColumns;

      const [task] = sourceCol.tasks.splice(taskIndexInSource, 1);

      // Insert at specific position
      if (sourceColumnId === targetColumnId) {
        // Reordering within same column
        let insertIndex = dropIndex;
        if (taskIndex < dropIndex) {
          insertIndex--; // Adjust for removal
        }
        targetCol.tasks.splice(insertIndex, 0, task);
      } else {
        // Moving to different column
        targetCol.tasks.splice(dropIndex, 0, task);
      }

      return newColumns;
    });

    // Update on server
    try {
      if (sourceColumnId !== targetColumnId) {
        await fetch(`/api/kanban/tasks/${taskId}/move`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: targetColumnId, userId })
        });

        // Award XP if moved to done
        if (targetColumnId === 'done') {
          await handleTaskComplete();
        }
      }
    } catch (error) {
      console.error('Failed to move task:', error);
      // Revert on error
      loadTasks();
    }

    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleTaskComplete = async () => {
    const xpEarned = Math.random() * 0.74 + 1.01; // 1.01-1.75 XP
    setXpGain(xpEarned);
    setShowXpAnimation(true);

    // Confetti celebration
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFD700', '#FFA500', '#FF69B4']
    });

    setTimeout(() => setShowXpAnimation(false), 2000);

    // Award XP via API
    try {
      await fetch('/api/user/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, xpGained: xpEarned })
      });
    } catch (error) {
      console.error('Failed to award XP:', error);
    }
  };

  const handleDeleteTask = async (columnId: string, taskId: string) => {
    // Optimistic delete
    setColumns(prevColumns =>
      prevColumns.map(col =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
          : col
      )
    );

    try {
      await fetch(`/api/kanban/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      loadTasks();
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newTask: Task = {
      id: tempId,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      priority: newTaskPriority,
      createdAt: new Date().toISOString()
    };

    // Optimistic add to "To Do" column
    setColumns(prevColumns =>
      prevColumns.map(col =>
        col.id === 'todo'
          ? { ...col, tasks: [...col.tasks, newTask] }
          : col
      )
    );

    // Clear form
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');

    try {
      const response = await fetch('/api/kanban/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: newTask.title,
          description: newTask.description,
          status: 'todo',
          priority: newTask.priority
        })
      });

      if (response.ok) {
        const { task } = await response.json();
        // Replace temp task with real task
        setColumns(prevColumns =>
          prevColumns.map(col =>
            col.id === 'todo'
              ? { ...col, tasks: col.tasks.map(t => t.id === tempId ? task : t) }
              : col
          )
        );
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      // Remove temp task on error
      setColumns(prevColumns =>
        prevColumns.map(col =>
          col.id === 'todo'
            ? { ...col, tasks: col.tasks.filter(t => t.id !== tempId) }
            : col
        )
      );
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100/80 text-red-700 border-red-300/50';
      case 'medium':
        return 'bg-amber-100/80 text-amber-700 border-amber-300/50';
      case 'low':
        return 'bg-green-100/80 text-green-700 border-green-300/50';
      default:
        return 'bg-gray-100/80 text-gray-700 border-gray-300/50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Flag className="w-3 h-3" fill="currentColor" />;
      case 'medium':
        return <Flag className="w-3 h-3" />;
      case 'low':
        return <Circle className="w-3 h-3" />;
      default:
        return <Circle className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-0)] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[var(--surface-2)] border-b border-[var(--surface-2-border)] backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/home')}
                className="p-2 rounded-xl hover:bg-black/5 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">✓</span>
                  To Do List
                </h1>
                <p className="text-sm text-gray-600">Hey {userName}! Organize your day</p>
              </div>
            </div>

            <ThemeCycleButton
              currentTheme={themeName}
              onThemeChange={setThemeName}
            />
          </div>
        </div>
      </div>

      {/* Main Content - Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Kanban Columns */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column, index) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-96"
            >
              {/* Column Container */}
              <div className="flex flex-col h-[calc(100vh-320px)] bg-[var(--surface-1)] rounded-3xl shadow-lg border border-[var(--surface-2-border)] overflow-hidden">
                {/* Column Header */}
                <div className={`bg-gradient-to-r ${column.color} p-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{column.icon}</span>
                    <div>
                      <h2 className="text-lg font-black text-white">{column.title}</h2>
                      <p className="text-xs text-white/80">
                        {column.tasks.length} task{column.tasks.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl">{column.emoji}</span>
                </div>

                {/* Task List */}
                <div className="flex-1 overflow-y-auto p-3">
                  <AnimatePresence>
                    {column.tasks.length === 0 && !draggedItem && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 text-gray-400"
                      >
                        <span className="text-4xl mb-2">{column.emoji}</span>
                        <p className="text-sm text-center px-4">
                          {column.id === 'todo' ? 'Create a task using the form below!' : 'No tasks yet.'}
                        </p>
                      </motion.div>
                    )}

                    {column.tasks.map((task, taskIndex) => {
                      const isDone = column.id === 'done';
                      const isDropTarget = dropTarget?.columnId === column.id && dropTarget?.index === taskIndex;

                      return (
                        <div key={task.id} className="relative">
                          {/* Drop indicator line */}
                          {isDropTarget && (
                            <div className="absolute -top-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full z-10" />
                          )}

                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: taskIndex * 0.05 }}
                            draggable={!isDone}
                            onDragStart={() => !isDone && handleDragStart(task.id, column.id, taskIndex)}
                            onDragOver={(e) => !isDone && handleDragOver(e, column.id, taskIndex)}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleDrop(column.id, taskIndex);
                            }}
                            onDragEnd={handleDragEnd}
                            className={`group bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-3 mb-2 transition-all transform ${
                              isDone
                                ? 'opacity-70 cursor-default'
                                : 'cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-lg hover:scale-102'
                            }`}
                          >
                            <div className="flex items-start gap-2 mb-2">
                              {!isDone && (
                                <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-gray-800 text-sm leading-tight break-words ${
                                  isDone ? 'line-through text-gray-500' : ''
                                }`}>
                                  {task.title}
                                </h3>
                              </div>
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <button
                                  onClick={() => handleDeleteTask(column.id, task.id)}
                                  className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            {task.description && (
                              <p className={`text-xs text-gray-600 mb-2 line-clamp-2 ${
                                isDone ? 'line-through text-gray-400' : ''
                              }`}>
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${getPriorityColor(task.priority)}`}>
                                {getPriorityIcon(task.priority)}
                                {task.priority}
                              </span>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}

                    {/* Drop zone at the end */}
                    {column.tasks.length > 0 && (
                      <div
                        onDragOver={(e) => handleDragOver(e, column.id, column.tasks.length)}
                        onDrop={() => handleDrop(column.id, column.tasks.length)}
                        className={`h-12 rounded-xl border-2 border-dashed transition-all ${
                          dropTarget?.columnId === column.id && dropTarget?.index === column.tasks.length
                            ? 'border-purple-400 bg-purple-50/50'
                            : 'border-transparent'
                        }`}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create Task Bar - Horizontal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--surface-1)] rounded-3xl shadow-lg border border-[var(--surface-2-border)] overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-400 to-pink-500 px-6 py-3">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-white" />
              <h2 className="text-lg font-black text-white">Create New Task</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="flex gap-4 items-end">
              {/* Task Title */}
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleAddTask()}
                  placeholder="What needs to be done?"
                  className="w-full bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent"
                />
              </div>

              {/* Task Description */}
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newTaskDescription}
                  onChange={e => setNewTaskDescription(e.target.value)}
                  placeholder="Add details..."
                  className="w-full bg-white/60 backdrop-blur-sm border border-white/60 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent"
                />
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Priority
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewTaskPriority('low')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      newTaskPriority === 'low'
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-white/60 text-green-700 border border-green-300 hover:bg-green-50'
                    }`}
                    title="Low Priority"
                  >
                    <Circle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setNewTaskPriority('medium')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      newTaskPriority === 'medium'
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'bg-white/60 text-amber-700 border border-amber-300 hover:bg-amber-50'
                    }`}
                    title="Medium Priority"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setNewTaskPriority('high')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      newTaskPriority === 'high'
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-white/60 text-red-700 border border-red-300 hover:bg-red-50'
                    }`}
                    title="High Priority"
                  >
                    <Flag className="w-4 h-4" fill="currentColor" />
                  </button>
                </div>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add Task
              </button>
            </div>
          </div>
        </motion.div>

        {/* Helpful Tips */}
        <div className="text-center pb-4">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Drag tasks up/down to reorder • Drag between columns • Complete tasks to earn XP!
          </p>
        </div>
      </div>

      {/* XP Gain Animation */}
      <AnimatePresence>
        {showXpAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -40 }}
            exit={{ opacity: 0, scale: 0.3, y: -80 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div
              className="flex items-center gap-2 px-4 py-2 text-white rounded-full shadow-2xl"
              style={{
                background: 'linear-gradient(to right, #F6B3DC, #F8C8E2)',
              }}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="font-black text-sm">+{xpGain.toFixed(2)} XP</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 pb-safe z-50 transition-all duration-300 ${
          showNavBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="max-w-md mx-auto px-4 pb-4">
          <div className="relative bg-white/15 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.3)] border border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5 pointer-events-none" />

            <div className="relative flex items-center justify-around px-4 py-2.5">
              <button
                onClick={() => router.push('/home')}
                className="relative flex flex-col items-center gap-1 transition-all duration-300 group"
              >
                <div className="relative p-2 rounded-xl transform group-active:scale-95 transition-all group-hover:bg-gray-100/50">
                  <Home size={18} className="text-gray-500 group-active:text-gray-700 transition-colors" />
                </div>
                <span className="text-[9px] font-medium text-gray-500">Home</span>
              </button>

              <button
                onClick={() => router.push('/todo')}
                className="relative flex flex-col items-center gap-1 transition-all duration-300 group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-100/40 to-pink-200/40 rounded-xl blur-md opacity-50 group-active:opacity-70 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-pink-100/60 to-pink-200/60 p-2 rounded-xl shadow-md transform group-active:scale-95 transition-transform backdrop-blur-sm">
                    <LayoutGrid size={18} className="text-pink-400" strokeWidth={2.5} />
                  </div>
                </div>
                <span className="text-[9px] font-bold text-pink-400">To Do</span>
              </button>

              <button
                onClick={() => router.push('/achievements')}
                className="relative flex flex-col items-center gap-1 transition-all duration-300 group"
              >
                <div className="relative p-2 rounded-xl transform group-active:scale-95 transition-all group-hover:bg-gray-100/50">
                  <Trophy size={18} className="text-gray-500 group-active:text-gray-700 transition-colors" />
                </div>
                <span className="text-[9px] font-medium text-gray-500">Achievements</span>
              </button>

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
