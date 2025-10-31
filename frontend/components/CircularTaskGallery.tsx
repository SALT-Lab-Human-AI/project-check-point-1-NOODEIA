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

    // 🎨 2025 Glassmorphism Color Palette - Transparent backgrounds with high contrast text
    const colorPalette = [
      // Purple (AI Tutor Card) - 25% opacity for glassmorphism
      {
        start: 'rgba(216, 180, 254, 0.25)',
        middle: 'rgba(233, 213, 255, 0.20)',
        end: 'rgba(243, 232, 255, 0.15)',
        border: 'rgba(216, 180, 254, 0.4)',
        text: '#581c87',
        textShadow: 'rgba(255, 255, 255, 0.9)'
      },
      // Pink (Group Chat Card)
      {
        start: 'rgba(251, 207, 232, 0.25)',
        middle: 'rgba(252, 231, 243, 0.20)',
        end: 'rgba(253, 242, 248, 0.15)',
        border: 'rgba(251, 207, 232, 0.4)',
        text: '#831843',
        textShadow: 'rgba(255, 255, 255, 0.9)'
      },
      // Blue (Quiz Card)
      {
        start: 'rgba(191, 219, 254, 0.25)',
        middle: 'rgba(219, 234, 254, 0.20)',
        end: 'rgba(239, 246, 255, 0.15)',
        border: 'rgba(191, 219, 254, 0.4)',
        text: '#1e3a8a',
        textShadow: 'rgba(255, 255, 255, 0.9)'
      },
      // Yellow (Games Card)
      {
        start: 'rgba(254, 240, 138, 0.25)',
        middle: 'rgba(254, 249, 195, 0.20)',
        end: 'rgba(254, 252, 232, 0.15)',
        border: 'rgba(254, 240, 138, 0.4)',
        text: '#713f12',
        textShadow: 'rgba(255, 255, 255, 0.9)'
      },
    ];

    // Cycle through colors based on index
    const colors = colorPalette[colorIndex % colorPalette.length];

    // Card dimensions - horizontal card centered in vertical canvas
    const cardY = 300;  // Position in middle of 900px canvas
    const cardHeight = 300;  // Height of the card
    const cardMargin = 40;  // Increased margin for better spacing
    const cardWidth = 700 - (cardMargin * 2);
    const cardPadding = 25;  // Internal padding for content

    // Fill entire canvas with transparent background
    ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    ctx.fillRect(0, 0, 700, 900);

    // 🎨 Layer 1: Outer glow shadow for depth (glassmorphism effect)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 15;

    // Draw main card background with transparent gradient
    ctx.beginPath();
    ctx.roundRect(cardMargin, cardY, cardWidth, cardHeight, 24);
    ctx.closePath();

    // 🎨 Layer 2: Transparent gradient background (glassmorphism)
    const gradient = ctx.createLinearGradient(cardMargin, cardY, cardMargin + cardWidth, cardY + cardHeight);
    gradient.addColorStop(0, colors.start);
    gradient.addColorStop(0.5, colors.middle);
    gradient.addColorStop(1, colors.end);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Reset shadow for border
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 🎨 Layer 3: Subtle border glow (glassmorphism trend)
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Reset shadow for decorative elements
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 🎨 NEW: Add grainy texture overlay (2025 trend)
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.06;
    ctx.beginPath();
    ctx.roundRect(cardMargin, cardY, cardWidth, cardHeight, 30);
    ctx.clip();
    for (let i = 0; i < (cardWidth * cardHeight) / 150; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      const x = cardMargin + Math.random() * cardWidth;
      const y = cardY + Math.random() * cardHeight;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.restore();

    // 🎨 NEW: Add cute floating circles
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardMargin, cardY, cardWidth, cardHeight, 30);
    ctx.clip();

    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.12;
    // Draw soft decorative circles
    const drawSoftCircle = (x: number, y: number, radius: number) => {
      const radGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    drawSoftCircle(cardMargin + cardWidth * 0.2, cardY + cardHeight * 0.25, 80);
    drawSoftCircle(cardMargin + cardWidth * 0.8, cardY + cardHeight * 0.7, 100);
    drawSoftCircle(cardMargin + cardWidth * 0.5, cardY + cardHeight * 0.5, 60);

    ctx.restore();

    // 🎨 NEW: Add sparkle decorations
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardMargin, cardY, cardWidth, cardHeight, 30);
    ctx.clip();

    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#ffffff';
    // Draw small star sparkles
    for (let i = 0; i < 5; i++) {
      const x = cardMargin + Math.random() * cardWidth;
      const y = cardY + Math.random() * cardHeight;
      const size = 3 + Math.random() * 5;
      // Draw diamond shape
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size / 2, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size / 2, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

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
