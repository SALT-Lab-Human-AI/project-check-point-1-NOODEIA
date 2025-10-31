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

const PRIORITY_GRADIENTS: Record<Task['priority'], { start: string; end: string; accent: string }> = {
  high: { start: '#ff3d71', end: '#ff9a44', accent: '#ffe4d6' },
  medium: { start: '#4facfe', end: '#00f2fe', accent: '#d6ecff' },
  low: { start: '#43e97b', end: '#38f9d7', accent: '#d5fff1' }
};

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  inprogress: 'In Progress'
};

const textureCache = new Map<string, string>();

const capitalize = (value: string) => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const drawBadge = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  background: string,
  color: string
) => {
  const font = '600 26px "Figtree", "Segoe UI", sans-serif';
  const paddingX = 24;
  const badgeHeight = 50;
  ctx.font = font;
  const textWidth = ctx.measureText(text).width;
  const badgeWidth = textWidth + paddingX * 2;
  drawRoundedRect(ctx, x, y, badgeWidth, badgeHeight, badgeHeight / 2);
  ctx.fillStyle = background;
  ctx.fill();
  ctx.fillStyle = color;
  const previousBaseline = ctx.textBaseline;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + paddingX, y + badgeHeight / 2);
  ctx.textBaseline = previousBaseline;
  return badgeWidth;
};

const drawWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) => {
  const previousBaseline = ctx.textBaseline;
  ctx.textBaseline = 'alphabetic';
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    ctx.textBaseline = previousBaseline;
    return y;
  }

  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  });
  if (currentLine) {
    lines.push(currentLine);
  }

  let limited = lines;
  if (lines.length > maxLines) {
    limited = lines.slice(0, maxLines);
    const lastIndex = limited.length - 1;
    let lastLine = limited[lastIndex];
    while (ctx.measureText(`${lastLine}…`).width > maxWidth && lastLine.length > 0) {
      lastLine = lastLine.slice(0, -1);
    }
    limited[lastIndex] = `${lastLine}…`;
  }

  limited.forEach(line => {
    ctx.fillText(line, x, y);
    y += lineHeight;
  });

  ctx.textBaseline = previousBaseline;
  return y;
};

const createTaskTexture = (task: Task, index: number): string => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return '';
  }

  const key = `${task.id ?? index}|${task.title ?? ''}|${task.description ?? ''}|${task.priority}|${task.status}`;
  const cached = textureCache.get(key);
  if (cached) {
    return cached;
  }

  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 600;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }

  const gradientPreset = PRIORITY_GRADIENTS[task.priority] ?? PRIORITY_GRADIENTS.medium;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, gradientPreset.start);
  gradient.addColorStop(1, gradientPreset.end);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const overlay = ctx.createLinearGradient(0, 0, width, height);
  overlay.addColorStop(0, 'rgba(10, 12, 28, 0.35)');
  overlay.addColorStop(1, 'rgba(10, 12, 28, 0.55)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);

  const padding = 60;
  drawRoundedRect(ctx, padding, padding, width - padding * 2, height - padding * 2, 44);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fill();

  const innerX = padding + 36;
  const usableWidth = width - innerX - padding;
  const badgeY = padding + 36;
  const statusLabel = STATUS_LABELS[task.status] ?? 'Task';
  const priorityLabel = `Priority: ${capitalize(task.priority ?? '') || 'Unknown'}`;

  const statusBadgeWidth = drawBadge(ctx, statusLabel, innerX, badgeY, 'rgba(255, 255, 255, 0.92)', '#1a1a1a');
  drawBadge(ctx, priorityLabel, innerX + statusBadgeWidth + 18, badgeY, gradientPreset.accent, '#1a1a1a');

  let cursorY = badgeY + 90;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.font = '700 52px "Figtree", "Segoe UI", sans-serif';
  cursorY = drawWrappedText(ctx, task.title || 'Untitled Task', innerX, cursorY, usableWidth, 60, 2);

  if (task.description) {
    cursorY += 16;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '400 30px "Figtree", "Segoe UI", sans-serif';
    cursorY = drawWrappedText(ctx, task.description, innerX, cursorY, usableWidth, 42, 3);
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '500 26px "Figtree", "Segoe UI", sans-serif';
  const footerText = `Status: ${statusLabel}`;
  ctx.fillText(footerText, innerX, height - padding - 24);

  const dataUrl = canvas.toDataURL('image/png');
  textureCache.set(key, dataUrl);
  return dataUrl;
};

const buildGalleryItems = (tasks: Task[]) =>
  tasks.map((task, index) => ({
    image: createTaskTexture(task, index),
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
            <div className="h-[260px] w-full rounded-3xl overflow-hidden">
              <CircularGallery
                items={galleryItems}
                bend={2.2}
                textColor="#f5f5f5"
                font="600 22px Figtree"
                sizeFactor={0.5}
                scrollSpeed={1.6}
              />
            </div>
            <div className="mt-3 text-center text-xs text-gray-500">
              Hover over the gallery to drag or scroll through tasks
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
