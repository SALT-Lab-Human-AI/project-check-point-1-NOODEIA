'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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

type TaskPriority = Task['priority'];

const PRIORITY_THEMES: Record<TaskPriority, { gradient: [string, string]; accent: string; glow: string }> = {
  high: {
    gradient: ['#ff4d6d', '#ff9f68'],
    accent: '#ffe3dd',
    glow: 'rgba(255, 77, 109, 0.35)'
  },
  medium: {
    gradient: ['#4facfe', '#00f2fe'],
    accent: '#d6ecff',
    glow: 'rgba(79, 172, 254, 0.35)'
  },
  low: {
    gradient: ['#43e97b', '#38f9d7'],
    accent: '#d4fff1',
    glow: 'rgba(67, 233, 123, 0.35)'
  }
};

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  inprogress: 'In Progress'
};

const FALLBACK_THEME: (typeof PRIORITY_THEMES)[TaskPriority] = PRIORITY_THEMES.medium;

const textureCache = new Map<string, string>();

const clampLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  lineHeight: number,
  maxLines: number
) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return y;

  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const joined = current ? `${current} ${word}` : word;
    if (ctx.measureText(joined).width > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = joined;
    }
  }
  if (current) lines.push(current);

  const limited = lines.slice(0, maxLines);
  if (limited.length < lines.length) {
    let last = limited[limited.length - 1];
    while (ctx.measureText(`${last}…`).width > width && last.length > 0) {
      last = last.slice(0, -1);
    }
    limited[limited.length - 1] = `${last}…`;
  }

  limited.forEach(line => {
    ctx.fillText(line, x, y);
    y += lineHeight;
  });
  return y;
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
  const font = '600 28px "Figtree", "Segoe UI", system-ui';
  ctx.font = font;
  const paddingX = 32;
  const height = 60;
  const width = ctx.measureText(text).width + paddingX * 2;

  drawRoundedRect(ctx, x, y, width, height, height / 2);
  ctx.fillStyle = background;
  ctx.fill();

  const prevBaseline = ctx.textBaseline;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, x + paddingX, y + height / 2);
  ctx.textBaseline = prevBaseline;

  return width;
};

const drawSoftCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
) => {
  const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
};

const createTaskTexture = (task: Task, index: number): string => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return '';

  const key = `${task.id ?? index}|${task.title ?? ''}|${task.description ?? ''}|${task.priority}|${task.status}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 600;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const theme = PRIORITY_THEMES[task.priority] ?? FALLBACK_THEME;

  // Base gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, theme.gradient[0]);
  gradient.addColorStop(1, theme.gradient[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Overlay shapes for depth
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSoftCircle(ctx, width * 0.2, height * 0.25, 220, theme.glow);
  drawSoftCircle(ctx, width * 0.75, height * 0.35, 260, 'rgba(255,255,255,0.25)');
  drawSoftCircle(ctx, width * 0.6, height * 0.75, 200, 'rgba(255,255,255,0.18)');
  ctx.restore();

  // Frosted glass panel
  const panelPadding = 48;
  drawRoundedRect(ctx, panelPadding, panelPadding, width - panelPadding * 2, height - panelPadding * 2, 40);
  ctx.fillStyle = 'rgba(15, 20, 40, 0.35)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const contentX = panelPadding + 36;
  const contentWidth = width - contentX - panelPadding;

  // Badges
  const badgeY = panelPadding + 36;
  const statusText = STATUS_LABELS[task.status] ?? 'Task';
  const priorityText = `Priority: ${task.priority.toUpperCase()}`;

  const statusBadgeWidth = drawBadge(ctx, statusText, contentX, badgeY, 'rgba(255,255,255,0.9)', '#1a1a1a');
  drawBadge(ctx, priorityText, contentX + statusBadgeWidth + 20, badgeY, theme.accent, '#1a1a1a');

  // Title
  let cursorY = badgeY + 100;
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 60px "Figtree", "Segoe UI", system-ui';
  cursorY = clampLines(ctx, task.title || 'Untitled Task', contentX, cursorY, contentWidth, 68, 2);

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(contentX, cursorY + 20);
  ctx.lineTo(contentX + contentWidth, cursorY + 20);
  ctx.stroke();
  cursorY += 50;

  // Description
  const description = task.description || 'No additional notes yet. Add more context in the Todo tab!';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '400 30px "Figtree", "Segoe UI", system-ui';
  cursorY = clampLines(ctx, description, contentX, cursorY, contentWidth, 44, 3);

  // Footer hint
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '600 26px "Figtree", "Segoe UI", system-ui';
  const footer = 'Drag to explore • Click to manage in Todo list';
  ctx.fillText(footer, contentX, height - panelPadding - 20);

  const dataUrl = canvas.toDataURL('image/png');
  textureCache.set(key, dataUrl);
  return dataUrl;
};

const buildGalleryItems = (tasks: Task[]) =>
  tasks.map((task, index) => ({
    image: createTaskTexture(task, index),
    text: task.title || 'Untitled Task',
    payload: task
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
  const handleCardSelect = useCallback(() => {
    router.push('/todo');
  }, [router]);

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
              <CircularGallery
                items={galleryItems}
                bend={3}
                textColor="#ffffff"
                font="bold 30px Figtree"
                scrollSpeed={2}
                onSelect={handleCardSelect}
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
