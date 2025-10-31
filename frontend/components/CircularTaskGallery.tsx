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
        console.log('🎨 CircularTaskGallery: Found', activeTasks.length, 'active tasks');
        setTasks(activeTasks);

        // Generate gallery items with color index
        const items = await Promise.all(
          activeTasks.map(async (task: Task, index: number) => {
            console.log(`🎨 Generating card ${index} for task:`, task.title, 'with color index:', index % 4);
            return {
              image: await generateTaskCardImage(task, index),
              text: task.title
            };
          })
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
  const generateTaskCardImage = async (task: Task, colorIndex: number): Promise<string> => {
    const canvas = document.createElement('canvas');
    // Library expects 700x900 dimensions for proper scaling
    canvas.width = 700;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    // Color palette matching the 4 home page feature cards
    const colorPalette = [
      // Purple (AI Tutor Card)
      { start: '#d8b4fe', middle: '#e9d5ff', end: '#f3e8ff', text: '#581c87' },
      // Pink (Group Chat Card)
      { start: '#fbcfe8', middle: '#fce7f3', end: '#fdf2f8', text: '#831843' },
      // Blue (Quiz Card)
      { start: '#bfdbfe', middle: '#dbeafe', end: '#eff6ff', text: '#1e3a8a' },
      // Yellow (Games Card)
      { start: '#fef08a', middle: '#fef9c3', end: '#fefce8', text: '#713f12' },
    ];

    // Cycle through colors based on index
    const colors = colorPalette[colorIndex % colorPalette.length];
    console.log(`🎨 Card ${colorIndex}: Using color scheme`, ['Purple', 'Pink', 'Blue', 'Yellow'][colorIndex % 4], colors);

    // Create gradient background - draw a horizontal card appearance within the vertical canvas
    // Draw the "card" in the middle of the canvas to look horizontal
    const cardY = 300;  // Position the horizontal card in middle of vertical canvas
    const cardHeight = 300;  // Height of the visible card area

    // Fill entire canvas with transparent/subtle background first
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, 700, 900);

    // Add subtle shadow for the card
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;

    // Create rounded rectangle for card background
    const cardMargin = 30;
    ctx.beginPath();
    ctx.roundRect(cardMargin, cardY, 700 - (cardMargin * 2), cardHeight, 25);
    ctx.closePath();

    // Create gradient for the main card area
    const gradient = ctx.createLinearGradient(0, cardY, 0, cardY + cardHeight);
    gradient.addColorStop(0, colors.start);
    gradient.addColorStop(0.5, colors.middle);
    gradient.addColorStop(1, colors.end);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Reset shadow for text
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Position all content within the horizontal card area (y: 300-600)
    const contentY = cardY + 80; // Start content 80px from top of card

    // Status emoji on the left
    ctx.font = 'bold 70px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(task.status === 'inprogress' ? '🔥' : '📝', 50, contentY);

    // Task title - centered in the card
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'left';
    const titleLines = wrapText(ctx, task.title, 480);
    let textY = contentY - 10;
    titleLines.forEach((line, i) => {
      if (i < 2) { // Max 2 lines for title
        ctx.fillText(line, 150, textY);
        textY += 50;
      }
    });

    // Task description - below title
    if (task.description) {
      ctx.font = '26px Arial';
      ctx.fillStyle = colors.text;
      ctx.globalAlpha = 0.85;
      ctx.textAlign = 'left';
      const descLines = wrapText(ctx, task.description, 480);
      descLines.forEach((line, i) => {
        if (i < 2) { // Max 2 lines for description in horizontal layout
          ctx.fillText(line, 150, textY);
          textY += 35;
        }
      });
      ctx.globalAlpha = 1.0;
    }

    // Priority badge - bottom right of card
    const badgeX = 450;
    const badgeY = cardY + cardHeight - 80;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    roundRect(ctx, badgeX, badgeY, 200, 45, 22);
    ctx.fill();

    ctx.fillStyle = colors.text;
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    const priorityEmoji = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
    ctx.fillText(`${priorityEmoji} ${task.priority.toUpperCase()}`, badgeX + 100, badgeY + 30);

    // Due date badge if present - bottom left of card
    if (task.dueDate) {
      const dueDateX = 50;
      const dueDateY = cardY + cardHeight - 80;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      roundRect(ctx, dueDateX, dueDateY, 180, 45, 22);
      ctx.fill();

      ctx.fillStyle = colors.text;
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      const dueText = formatDueDate(task.dueDate);
      ctx.fillText(`📅 ${dueText}`, dueDateX + 90, dueDateY + 30);
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

        {/* CircularGallery Container - landscape cards with tilt scrolling */}
        <div style={{ height: '300px', position: 'relative', width: '100%' }}>
          <CircularGallery
            items={galleryItems}
            bend={2}
            textColor="#ffffff"
            borderRadius={0.08}
            scrollSpeed={3}
            scrollEase={0.08}
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
