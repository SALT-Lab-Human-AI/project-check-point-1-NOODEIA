'use client';

import { useState, useEffect } from 'react';
import CircularGallery from './CircularGallery';

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
  const [galleryItems, setGalleryItems] = useState<{ image: string; text: string }[]>([]);
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

        // Generate gallery items
        const items = await Promise.all(
          activeTasks.map(async (task: Task) => ({
            image: await generateTaskCardImage(task),
            text: task.title
          }))
        );
        setGalleryItems(items);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate a canvas-based image for each task card
  const generateTaskCardImage = async (task: Task): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 560; // Portrait orientation
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    // Get priority gradient colors
    const gradients = {
      high: { start: '#f87171', end: '#ef4444' },
      medium: { start: '#fbbf24', end: '#f97316' },
      low: { start: '#4ade80', end: '#10b981' },
    };
    const colors = gradients[task.priority] || { start: '#9ca3af', end: '#6b7280' };

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 400, 560);
    gradient.addColorStop(0, colors.start);
    gradient.addColorStop(1, colors.end);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 560);

    // Status emoji in top right
    ctx.font = 'bold 48px Arial';
    ctx.fillText(task.status === 'inprogress' ? '🔥' : '📝', 330, 60);

    // Task title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'left';
    const titleLines = wrapText(ctx, task.title, 360);
    let y = 100;
    titleLines.forEach((line, i) => {
      if (i < 3) { // Max 3 lines
        ctx.fillText(line, 20, y);
        y += 40;
      }
    });

    // Task description
    if (task.description) {
      ctx.font = '24px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      y += 20;
      const descLines = wrapText(ctx, task.description, 360);
      descLines.forEach((line, i) => {
        if (i < 4 && y < 420) { // Max 4 lines and stay in bounds
          ctx.fillText(line, 20, y);
          y += 32;
        }
      });
    }

    // Priority badge (bottom section)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    roundRect(ctx, 20, 460, 160, 40, 20);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`⚠️ ${task.priority.toUpperCase()}`, 100, 488);

    // Due date badge
    if (task.dueDate) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      roundRect(ctx, 20, 510, 200, 40, 20);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      const dueText = formatDueDate(task.dueDate);
      ctx.fillText(`📅 ${dueText}`, 120, 538);
    }

    return canvas.toDataURL('image/png');
  };

  // Helper to wrap text
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  // Helper to draw rounded rectangles
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Format due date
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
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

        {/* CircularGallery Container */}
        <div style={{ height: '600px', position: 'relative' }}>
          <CircularGallery
            items={galleryItems}
            bend={3}
            textColor="#ffffff"
            borderRadius={0.05}
            scrollEase={0.02}
          />
        </div>

        {/* Swipe hint text */}
        <div className="text-center mt-3">
          <p className="text-xs text-gray-500">
            Drag or scroll to browse tasks
          </p>
        </div>
      </div>
    </div>
  );
}
