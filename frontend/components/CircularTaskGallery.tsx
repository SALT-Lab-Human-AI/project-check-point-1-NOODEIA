'use client';

import { useState, useEffect, useMemo, useCallback, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  onReady?: () => void; // Callback when gallery is fully ready
}

// Texture cache to prevent regeneration
const textureCache = new Map<string, string>();

export default function CircularTaskGallery({ userId, onReady }: CircularTaskGalleryProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [galleryItems, setGalleryItems] = useState<{ image: string; text: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastItemsKeyRef = useRef<string>('');
  const stableItemsCacheRef = useRef<{ image: string; text: string }[]>([]);
  
  // Handle card click - navigate to todo page
  const handleCardSelect = useCallback(() => {
    router.push('/todo');
  }, [router]);
  
  // Create stable items reference with debouncing to reduce blinking
  // Initialize with empty array - will be set synchronously during initial load
  const [debouncedGalleryItems, setDebouncedGalleryItems] = useState<{ image: string; text: string }[]>([]);
  const isInitialLoadRef = useRef(true);
  const skipDebounceRef = useRef(false);
  const hasInitialItemsRef = useRef(false);
  const initialItemsReadyRef = useRef(false);
  
  useEffect(() => {
    // Skip debounce if this was explicitly set as immediate (initial load)
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      // Don't update debouncedGalleryItems here since it was already set synchronously
      return;
    }
    
    // For initial load with items, set immediately without debounce
    if (isInitialLoadRef.current && galleryItems.length > 0) {
      setDebouncedGalleryItems([...galleryItems]);
      isInitialLoadRef.current = false;
      return;
    }
    
    // Skip if we already have initial items set (prevent race condition)
    if (hasInitialItemsRef.current && debouncedGalleryItems.length === galleryItems.length && galleryItems.length > 0) {
      return;
    }
    
    // For subsequent updates, debounce to reduce blinking
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      setDebouncedGalleryItems([...galleryItems]);
    }, 200); // 200ms debounce to batch rapid updates
    
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [galleryItems, debouncedGalleryItems]);
  
  const stableGalleryItems = useMemo(() => {
    // During initial load, if cache is populated but debouncedGalleryItems is empty, return cache
    if (hasInitialItemsRef.current && debouncedGalleryItems.length === 0 && stableItemsCacheRef.current.length > 0) {
      return stableItemsCacheRef.current;
    }
    
    const validItems = debouncedGalleryItems.filter(item => item.image && item.image.trim() !== '' && item.image.startsWith('data:image'));
    
    // Early return if no valid items
    if (validItems.length === 0) {
      // Only clear cache if we're not in initial load
      if (!hasInitialItemsRef.current) {
        stableItemsCacheRef.current = [];
        lastItemsKeyRef.current = '';
      }
      // Return cache if available during initial load
      if (hasInitialItemsRef.current && stableItemsCacheRef.current.length > 0) {
        return stableItemsCacheRef.current;
      }
      return [];
    }
    
    const itemsKey = validItems.map(item => item.image).join('|');
    
    // CRITICAL: Always return the cached reference if items haven't changed
    // This prevents CircularGallery from remounting and causing a blink
    if (itemsKey === lastItemsKeyRef.current && stableItemsCacheRef.current.length > 0) {
      // Verify the items are actually the same (extra safety check)
      const cachedKey = stableItemsCacheRef.current.map(item => item.image).join('|');
      if (cachedKey === itemsKey) {
        return stableItemsCacheRef.current; // Return cached stable reference - SAME REFERENCE
      }
    }
    
    // Items have changed - update cache
    lastItemsKeyRef.current = itemsKey;
    // Create new array only when items actually changed
    stableItemsCacheRef.current = [...validItems];
    return stableItemsCacheRef.current;
  }, [debouncedGalleryItems]);

  useEffect(() => {
    // Reset initial load flag when userId changes
    isInitialLoadRef.current = true;
    skipDebounceRef.current = false;
    hasInitialItemsRef.current = false;
    initialItemsReadyRef.current = false;
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    try {
      const response = await fetch(`/api/kanban/tasks?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Display only TODO and IN PROGRESS tasks (filter out DONE tasks)
        const activeTasks = data.tasks.filter(
          (task: Task) => task.status === 'todo' || task.status === 'inprogress'
        );
        console.log('🎨 CircularTaskGallery: Found', activeTasks.length, 'active tasks');
        setTasks(activeTasks);

        // OPTIMIZED: Generate first 3 cards immediately BEFORE showing page
        // This ensures cards are ready when user sees the page
        const INITIAL_CARDS_COUNT = Math.min(3, activeTasks.length);
        const initialItems: { image: string; text: string }[] = [];
        
        // Generate first 3 cards synchronously (no delays)
        for (let i = 0; i < INITIAL_CARDS_COUNT; i++) {
          try {
            const image = await generateTaskCardImage(activeTasks[i], i);
            if (image && image.trim() !== '' && image.startsWith('data:image')) {
              initialItems.push({ image, text: '' });
            }
          } catch (error) {
            console.error(`Failed to generate initial card for task ${activeTasks[i].id}:`, error);
          }
        }
        
        // Set initial cards and show page only after cards are ready
        if (initialItems.length > 0) {
          // Mark that we have initial items to prevent placeholder flash
          hasInitialItemsRef.current = true;
          // Pre-populate the cache to ensure stableGalleryItems is ready immediately
          const validItems = initialItems.filter(item => item.image && item.image.trim() !== '' && item.image.startsWith('data:image'));
          if (validItems.length > 0) {
            const itemsKey = validItems.map(item => item.image).join('|');
            // CRITICAL: Store the exact same array reference that will be used
            stableItemsCacheRef.current = validItems; // Set cache before state update
            lastItemsKeyRef.current = itemsKey;
          }
          // Set skipDebounceRef BEFORE setting states to prevent useEffect from running
          skipDebounceRef.current = true;
          // Use React's automatic batching - set both states together synchronously
          // This ensures they update in the same render cycle
          setDebouncedGalleryItems(initialItems);
          setGalleryItems(initialItems);
          
          // Mark that initial items are ready
          initialItemsReadyRef.current = true;
          
          // CRITICAL: Wait for React to render CircularGallery with the cached items
          // Then wait for WebGL initialization before starting fade-in
          // The fade-in animation will make the appearance smooth
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                // Wait for WebGL textures to load
                setTimeout(() => {
                  // Start fade-in by removing loading state (gallery will fade in)
                  setLoading(false);
                  // Call onReady after fade-in animation completes (600ms)
                  setTimeout(() => {
                    if (onReady) {
                      onReady(); // Call after fade-in animation completes
                    }
                  }, 600); // Wait for fade-in animation (600ms)
                }, 50); // Short delay for WebGL initialization
              });
            });
          });
        } else {
          setLoading(false);
          if (onReady) {
            onReady();
          }
        }
        
        // Generate remaining cards progressively in background
        if (activeTasks.length > INITIAL_CARDS_COUNT) {
          const generateRemainingCards = async () => {
            const items = [...initialItems];
            const BATCH_UPDATE_SIZE = 3; // Update gallery every 3 cards to reduce blinking
            let pendingBatch: { image: string; text: string }[] = [];
            let batchTimeout: NodeJS.Timeout | null = null;
            
            const flushBatch = () => {
              if (pendingBatch.length > 0) {
                const newItems = [...items, ...pendingBatch];
                items.push(...pendingBatch);
                pendingBatch = [];
                
                // Use startTransition for smooth updates
                startTransition(() => {
                  setGalleryItems([...newItems]);
                });
              }
              if (batchTimeout) {
                clearTimeout(batchTimeout);
                batchTimeout = null;
              }
            };
            
            for (let i = INITIAL_CARDS_COUNT; i < activeTasks.length; i++) {
              try {
                // Use requestIdleCallback to yield to main thread between cards
                await new Promise<void>((resolve) => {
                  if (typeof requestIdleCallback !== 'undefined') {
                    requestIdleCallback(() => {
                      resolve();
                    }, { timeout: 0 });
                  } else {
                    // Fallback for browsers without requestIdleCallback
                    setTimeout(() => resolve(), 0);
                  }
                });
                
                const image = await generateTaskCardImage(activeTasks[i], i);
                if (image && image.trim() !== '' && image.startsWith('data:image')) {
                  pendingBatch.push({ image, text: '' });
                  
                  // Batch updates: flush when batch is full or after delay
                  if (pendingBatch.length >= BATCH_UPDATE_SIZE) {
                    flushBatch();
                  } else {
                    // Debounce: flush after 300ms if batch isn't full
                    if (batchTimeout) clearTimeout(batchTimeout);
                    batchTimeout = setTimeout(flushBatch, 300);
                  }
                }
              } catch (error) {
                console.error(`Failed to generate card for task ${activeTasks[i].id}:`, error);
              }
            }
            
            // Flush any remaining cards
            flushBatch();
          };
          
          // Start generating remaining cards in background (non-blocking)
          generateRemainingCards();
        }
      } else {
        // No tasks or error - show page anyway
        setLoading(false);
        if (onReady) {
          onReady();
        }
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setLoading(false);
      // Still call onReady even if there's an error so page can render
      if (onReady) {
        onReady();
      }
    }
  };

  // Helper function to verify image is valid and loaded
  const verifyImageLoad = (imageDataUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!imageDataUrl || imageDataUrl.trim() === '' || !imageDataUrl.startsWith('data:image')) {
        resolve(false);
        return;
      }
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imageDataUrl;
      // Timeout after 2 seconds
      setTimeout(() => resolve(false), 2000);
    });
  };

  // Generate a canvas-based image for each task card
  const generateTaskCardImage = async (task: Task, colorIndex: number): Promise<string> => {
    // Check cache first - skip verification for cached images (they're already valid)
    const cacheKey = `${task.id ?? ''}|${task.title ?? ''}|${task.description ?? ''}|${task.priority}|${task.status}|${colorIndex}`;
    const cached = textureCache.get(cacheKey);
    if (cached) {
      // Return cached image immediately without verification for better performance
      return cached;
    }

    // OPTIMIZED: Reduced canvas size for much faster rendering
    // Display size is ~382x350px, so we can use smaller canvas and scale up
    // This dramatically reduces rendering time (fewer pixels to process)
    const canvas = document.createElement('canvas');
    canvas.width = 800;  // Reduced from 1400 (43% reduction)
    canvas.height = 1100; // Reduced from 1900 (42% reduction) - maintains aspect ratio
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Failed to get 2d context');
      return '';
    }

    try {

    // 🎨 2025 Glassmorphism Color Palette - Matching feature cards with visible gradients
    const colorPalette = [
      // Purple (AI Tutor Card) - Increased opacity for visibility
      {
        start: 'rgba(216, 180, 254, 0.85)',
        middle: 'rgba(233, 213, 255, 0.75)',
        end: 'rgba(243, 232, 255, 0.65)',
        border: 'rgba(216, 180, 254, 0.6)',
        text: '#581c87',
        textShadow: 'rgba(255, 255, 255, 0.9)'
      },
      // Pink (Group Chat Card)
      {
        start: 'rgba(251, 207, 232, 0.85)',
        middle: 'rgba(252, 231, 243, 0.75)',
        end: 'rgba(253, 242, 248, 0.65)',
        border: 'rgba(251, 207, 232, 0.6)',
        text: '#831843',
        textShadow: 'rgba(255, 255, 255, 0.9)'
      },
      // Blue (Quiz Card)
      {
        start: 'rgba(191, 219, 254, 0.85)',
        middle: 'rgba(219, 234, 254, 0.75)',
        end: 'rgba(239, 246, 255, 0.65)',
        border: 'rgba(191, 219, 254, 0.6)',
        text: '#1e3a8a',
        textShadow: 'rgba(255, 255, 255, 0.9)'
      },
      // Yellow/Green (Games Card)
      {
        start: 'rgba(254, 240, 138, 0.85)',
        middle: 'rgba(254, 249, 195, 0.75)',
        end: 'rgba(254, 252, 232, 0.65)',
        border: 'rgba(254, 240, 138, 0.6)',
        text: '#713f12',
        textShadow: 'rgba(255, 255, 255, 0.9)'
      },
    ];

    // Cycle through colors based on index
    const colors = colorPalette[colorIndex % colorPalette.length];

    // Card dimensions - fill entire canvas to eliminate white spaces during movement
    const cardMargin = 0;  // No margin - card fills entire canvas
    const cardX = cardMargin;
    const cardY = cardMargin;
    const cardWidth = canvas.width - (cardMargin * 2);  // Use canvas.width instead of hardcoded
    const cardHeight = canvas.height - (cardMargin * 2); // Use canvas.height instead of hardcoded
    const cardPadding = 30;  // Reduced padding for smaller canvas

    // Fill entire canvas with white background first
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 🎨 Glass morphism effect - semi-transparent gradient background
    // Draw main card outline with rounded corners - fills entire canvas
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 20);
    ctx.closePath();

    // Apply beautiful gradient background with glass opacity (matching feature cards)
    // Use full canvas dimensions for gradient to ensure no white edges
    const gradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
    gradient.addColorStop(0, colors.start);
    gradient.addColorStop(0.5, colors.middle);
    gradient.addColorStop(1, colors.end);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Add shadow for depth (matching feature cards shadow-[0_4px_12px_rgba(0,0,0,0.1)])
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;

    // 🎨 Glass border (matching feature cards border-white/20)
    // Draw border inside the card to prevent white lines at edges
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX + 1, cardY + 1, cardWidth - 2, cardHeight - 2, 19);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Reset shadow for other elements
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Reset shadow for decorative elements
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 🎨 OPTIMIZED: Add grainy texture overlay
    // Reduced iterations from (width*height)/150 to (width*height)/800 for better performance
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.06;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 20);
    ctx.clip();
    
    // OPTIMIZED: Drastically reduce grain iterations for faster rendering
    // Small grain effect is barely visible but very expensive
    const grainIterations = Math.floor((cardWidth * cardHeight) / 8000); // Much fewer iterations
    ctx.fillStyle = '#000000';
    for (let i = 0; i < grainIterations; i++) {
      const x = cardX + Math.random() * cardWidth;
      const y = cardY + Math.random() * cardHeight;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.restore();

    // OPTIMIZED: Skip decorative elements during initial load for much faster rendering
    // These are expensive and barely visible - skip them entirely for performance
    // Decorative circles and sparkles removed - saves significant rendering time

    // Reset shadow for text
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // IMPORTANT: All decorative elements are complete, clipping is restored
    // Now draw text content - ensure no clipping is active
    // All save/restore pairs from decorative elements are balanced, so we're in a clean state

    // 🎨 CARD LAYOUT: 
    // 1. First Header: Task type (TODO/IN PROGRESS)
    // 2. Second Header: Task title (large font)
    // 3. Description: Same font size as title

    // FIRST HEADER: Task type with emoji at TOP LEFT (inside card)
    const statusEmoji = task.status === 'inprogress' ? '🔥' : '📝';
    const statusText = task.status === 'inprogress' ? 'In Progress' : 'To Do';

    // Set text baseline to top for accurate positioning
    ctx.textBaseline = 'top';
    
    // Draw task type emoji - left aligned, positioned at top within card bounds
    // Task category font size (base size for calculations)
    // Reduced proportionally with canvas size for consistency
    const categoryFontSize = 70; // Reduced from 120 to match smaller canvas (maintains visual proportion)
    ctx.fillStyle = colors.text; // Set color before drawing
    ctx.font = `bold ${categoryFontSize}px Arial`;
    ctx.textAlign = 'left';
    const statusX = cardX + cardPadding;
    const statusY = cardY + cardPadding + 50; // Positioned within card, visible from top
    ctx.fillText(statusEmoji, statusX, statusY);

    // Draw task type text (FIRST HEADER) - right next to emoji, left aligned, fully visible
    ctx.fillStyle = colors.text; // Ensure color is set
    ctx.font = `bold ${categoryFontSize}px Arial`; // Much bigger font
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top'; // Ensure baseline is set
    // Measure emoji width and position text right next to it
    const emojiMetrics = ctx.measureText(statusEmoji);
    const statusTextX = statusX + emojiMetrics.width + 35;
    // Always draw the full text - it should fit easily ("In Progress" or "To Do")
    ctx.fillText(statusText, statusTextX, statusY);

    // SECOND HEADER: Task title - 1.5x bigger than category font
    ctx.textBaseline = 'top'; // Set baseline for title
    const titleFontSize = Math.round(categoryFontSize * 1.5); // 1.5x bigger than category
    const titleY = statusY + categoryFontSize + 60; // Start title below status header with proper spacing
    ctx.fillStyle = colors.text;
    ctx.font = `bold ${titleFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.globalAlpha = 1.0;
    const titleLines = wrapText(ctx, task.title, cardWidth - 120);
    let centerTextY = titleY;
    titleLines.forEach((line, i) => {
      if (i < 3) { // Max 3 lines for title
        ctx.fillText(line, cardX + cardWidth / 2, centerTextY);
        centerTextY += titleFontSize * 1.2; // Line height based on font size
      }
    });

    // Description - 1.3x bigger than category font
    ctx.textBaseline = 'top'; // Set baseline for description
    const descriptionFontSize = Math.round(categoryFontSize * 1.3); // 1.3x bigger than category
    const descriptionY = centerTextY + 60;
    if (task.description) {
      ctx.font = `400 ${descriptionFontSize}px Arial`;
      ctx.fillStyle = colors.text;
      ctx.globalAlpha = 0.9;
      ctx.textAlign = 'center';
      const descLines = wrapText(ctx, task.description, cardWidth - 120);
      let descTextY = descriptionY;
      descLines.forEach((line, i) => {
        if (i < 4) { // Max 4 lines for description
          ctx.fillText(line, cardX + cardWidth / 2, descTextY);
          descTextY += descriptionFontSize * 1.2; // Line height based on font size
        }
      });
      ctx.globalAlpha = 1.0;
    }

    // Priority indicator at bottom LEFT (inside card)
    const priorityEmoji = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
    const priorityLabels: Record<string, string> = {
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    };
    const priorityText = `Priority: ${priorityLabels[task.priority] || task.priority}`;

    // Set text baseline to bottom for accurate bottom positioning
    ctx.textBaseline = 'bottom';
    
    // Draw priority emoji - left aligned at bottom, positioned within card bounds
    // Priority font size matches category font size
    const priorityFontSize = categoryFontSize; // Same size as category
    ctx.font = `bold ${priorityFontSize}px Arial`; // Much bigger font
    ctx.textAlign = 'left';
    const priorityX = cardX + cardPadding;
    const priorityY = cardY + cardHeight - cardPadding - 70; // Positioned within card, visible from bottom
    ctx.fillText(priorityEmoji, priorityX, priorityY);

    // Draw priority text - right next to emoji, left aligned, fully visible within card
    ctx.fillStyle = colors.text;
    ctx.font = `bold ${priorityFontSize}px Arial`; // Much bigger font
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom'; // Ensure baseline is set for bottom alignment
    // Measure emoji width and position text right next to it
    const priorityEmojiMetrics = ctx.measureText(priorityEmoji);
    const priorityTextX = priorityX + priorityEmojiMetrics.width + 30;
    // Always draw the full text - "Priority: High/Medium/Low" should fit easily
    ctx.fillText(priorityText, priorityTextX, priorityY);

    // OPTIMIZED: Use PNG but with smaller canvas (already optimized above)
    // PNG supports transparency needed for glassmorphism effect
    const dataUrl = canvas.toDataURL('image/png');
    
    // Verify the data URL is valid before caching
    if (!dataUrl || dataUrl.trim() === '' || !dataUrl.startsWith('data:image')) {
      console.error('Invalid canvas data URL generated');
      return '';
    }
    
    // Cache the valid image
    textureCache.set(cacheKey, dataUrl);
    return dataUrl;
    } catch (error) {
      console.error('Error generating task card image:', error);
      return '';
    }
  };

  // OPTIMIZED: Helper to wrap text with limit on measureText calls
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    if (!text || text.trim() === '') return [];
    
    // Quick check: if entire text fits, return it immediately (single measureText call)
    const fullMetrics = ctx.measureText(text);
    if (fullMetrics.width <= maxWidth) {
      return [text];
    }
    
    // Limit text length to avoid excessive processing
    const maxChars = 200; // Reasonable limit for card display
    const truncatedText = text.length > maxChars ? text.substring(0, maxChars) + '...' : text;
    
    const words = truncatedText.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    // Limit iterations to prevent expensive measureText loops
    const maxIterations = 50; // Prevent infinite loops
    let iterations = 0;

    for (const word of words) {
      if (iterations++ > maxIterations) break;
      
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

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

  // Handle empty tasks - call onReady immediately when loading completes
  // This hook MUST be called before any early returns (Rules of Hooks)
  useEffect(() => {
    if (!loading && tasks.length === 0 && onReady) {
      // Call immediately, no delay
      onReady();
    }
  }, [loading, tasks.length, onReady]);

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
    <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-2 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-white/20 mb-6 overflow-visible">
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      <div className="relative">
        {/* CircularGallery Container - Fixed height to prevent layout shifts */}
        {/* Always render container with fixed height, show placeholder when empty */}
        <div style={{ height: '350px', position: 'relative', width: '100%', overflow: 'visible', minHeight: '350px' }}>
          {/* Render CircularGallery with smooth fade-in animation */}
          {(() => {
            // CRITICAL: Only render CircularGallery when cache is populated
            // This prevents mounting with empty items then remounting (which causes blink)
            const cacheReady = hasInitialItemsRef.current && stableItemsCacheRef.current.length > 0;
            
            if (!cacheReady && stableGalleryItems.length === 0) {
              return (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl mb-2 animate-pulse">✨</div>
                    <div className="text-sm text-gray-500">Loading cards...</div>
                  </div>
                </div>
              );
            }
            
            // ALWAYS use cache reference when available - it's the source of truth
            // This ensures CircularGallery gets the EXACT SAME array reference every time
            const itemsToRender = stableItemsCacheRef.current.length > 0
              ? stableItemsCacheRef.current  // ALWAYS use cache - same reference prevents remount
              : stableGalleryItems.length > 0 
                  ? stableGalleryItems 
                  : [];
            
            if (itemsToRender.length === 0) {
              return (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl mb-2 animate-pulse">✨</div>
                    <div className="text-sm text-gray-500">Loading cards...</div>
                  </div>
                </div>
              );
            }
            
            // Use a completely stable key that never changes for initial items
            // CircularGallery now compares by content, so key is mainly for React reconciliation
            const stableKey = lastItemsKeyRef.current || 'gallery-initial';
            
            return (
              <div
                key={stableKey}
                className="gallery-fade-in"
                style={{
                  width: '100%',
                  height: '100%'
                }}
              >
                <CircularGallery
                  items={itemsToRender}
                  bend={2}
                  textColor="#ffffff"
                  borderRadius={0.08}
                  scrollSpeed={3}
                  scrollEase={0.08}
                  onSelect={handleCardSelect}
                />
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
