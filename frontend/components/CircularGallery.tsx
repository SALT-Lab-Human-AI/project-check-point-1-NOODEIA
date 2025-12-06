'use client';

import { useEffect, useRef } from 'react';
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';

type GL = Renderer['gl'];

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: number;
  return function (this: any, ...args: Parameters<T>) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: any): void {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function getFontSize(font: string): number {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 30;
}

function createTextTexture(
  gl: GL,
  text: string,
  font: string = 'bold 30px monospace',
  color: string = 'black'
): { texture: Texture; width: number; height: number } {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2d context');

  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const fontSize = getFontSize(font);
  const textHeight = Math.ceil(fontSize * 1.2);

  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;

  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

interface TitleProps {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor?: string;
  font?: string;
}

class Title {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor: string;
  font: string;
  mesh!: Mesh;

  constructor({ gl, plane, renderer, text, textColor = '#545050', font = '30px sans-serif' }: TitleProps) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }

  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeightScaled = this.plane.scale.y * 0.15;
    const textWidthScaled = textHeightScaled * aspect;
    this.mesh.scale.set(textWidthScaled, textHeightScaled, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeightScaled * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
}

interface ScreenSize {
  width: number;
  height: number;
}

interface Viewport {
  width: number;
  height: number;
}

interface GalleryItem {
  image: string;
  text: string;
  payload?: unknown;
}

interface MediaProps {
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  text: string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius?: number;
  font?: string;
  baseIndex: number;
}

class Media {
  extra: number = 0;
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  text: string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius: number;
  font?: string;
  baseIndex: number;
  program!: Program;
  plane!: Mesh;
  title!: Title;
  scale!: number;
  padding!: number;
  width!: number;
  widthTotal!: number;
  x!: number;
  speed: number = 0;
  isBefore: boolean = false;
  isAfter: boolean = false;

  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font,
    baseIndex
  }: MediaProps) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.baseIndex = baseIndex;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }

  createShader() {
    // Disable mipmaps for better performance with data URLs (they're already optimized)
    const texture = new Texture(this.gl, {
      generateMipmaps: false
    });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          
          // Smooth antialiasing for edges
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
    
    // Handle empty image strings - don't try to load them
    // This should never happen if filtering is done correctly, but add safeguard
    if (!this.image || this.image.trim() === '') {
      // Create a white/light colored placeholder canvas instead of transparent (less jarring than black)
      const placeholderCanvas = document.createElement('canvas');
      placeholderCanvas.width = 800; // Match optimized card dimensions
      placeholderCanvas.height = 1100;
      const placeholderCtx = placeholderCanvas.getContext('2d');
      if (placeholderCtx) {
        // Fill with a light gradient background similar to card backgrounds
        const gradient = placeholderCtx.createLinearGradient(0, 0, 800, 1100);
        gradient.addColorStop(0, 'rgba(243, 232, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(233, 213, 255, 0.3)');
        placeholderCtx.fillStyle = gradient;
        placeholderCtx.fillRect(0, 0, 800, 1100);
      }
      texture.image = placeholderCanvas;
      this.program.uniforms.uImageSizes.value = [800, 1100];
      return;
    }
    
    // CRITICAL: Initialize texture immediately with light placeholder to prevent black cards
    // This ensures the texture is never uninitialized during image loading
    const createLightPlaceholder = () => {
      const placeholderCanvas = document.createElement('canvas');
      placeholderCanvas.width = 800; // Match optimized card dimensions
      placeholderCanvas.height = 1100;
      const placeholderCtx = placeholderCanvas.getContext('2d');
      if (placeholderCtx) {
        const gradient = placeholderCtx.createLinearGradient(0, 0, 800, 1100);
        gradient.addColorStop(0, 'rgba(243, 232, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(233, 213, 255, 0.3)');
        placeholderCtx.fillStyle = gradient;
        placeholderCtx.fillRect(0, 0, 800, 1100);
      }
      return placeholderCanvas;
    };
    
    // Set placeholder immediately so texture is never uninitialized
    texture.image = createLightPlaceholder();
    this.program.uniforms.uImageSizes.value = [800, 1100];
    
    // Now load the actual image and swap it in when ready
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    // Set up timeout to prevent hanging on failed loads
    const timeout = setTimeout(() => {
      console.warn(`Image load timeout for: ${this.image.substring(0, 50)}...`);
      // Keep the placeholder if timeout occurs
      // texture.image is already set to placeholder above
    }, 10000); // 10 second timeout
    
    img.onload = () => {
      clearTimeout(timeout);
      try {
        // Verify image dimensions are valid before swapping in the actual image
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          // Swap placeholder with actual image
          texture.image = img;
          this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
        } else {
          console.warn('Image loaded but has invalid dimensions, keeping placeholder');
          // Keep the placeholder (already set above)
        }
      } catch (error) {
        console.error('Error setting texture image:', error);
        // Keep the placeholder (already set above)
      }
    };
    
    img.onerror = (error) => {
      clearTimeout(timeout);
      console.error(`Failed to load image: ${this.image.substring(0, 50)}...`, error);
      // Placeholder is already set above, so we just keep it
      // No need to set it again
    };
    
    img.src = this.image;
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font
    });
  }

  update(scroll: { current: number; last: number }, direction: 'right' | 'left') {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    
    // Infinite scrolling - wrap around when cards go off screen
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    // For infinite scroll, widthTotal should be based on the original item count
    // This ensures repositioning wraps correctly
    this.widthTotal = this.width * this.length;
    // Position items based on their index in the duplicated array
    // This creates the illusion of infinite scrolling
    this.x = this.width * this.index;
  }
}

interface AppConfig {
  items?: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  onSelect?: (item: GalleryItem, index: number) => void;
}

class App {
  container: HTMLElement;
  scrollSpeed: number;
  scroll: {
    ease: number;
    current: number;
    target: number;
    last: number;
    position?: number;
  };
  onCheckDebounce: (...args: any[]) => void;
  renderer!: Renderer;
  gl!: GL;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;
  medias: Media[] = [];
  mediasImages: GalleryItem[] = [];
  baseItems: GalleryItem[] = [];
  screen!: { width: number; height: number };
  viewport!: { width: number; height: number };
  raf: number = 0;
  isHovered: boolean = false;
  onSelect?: (item: GalleryItem, index: number) => void;
  activeMedia: Media | null = null;
  hasDrag: boolean = false;

  boundOnResize!: () => void;
  boundOnWheel!: (e: Event) => void;
  boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp!: (e: MouseEvent | TouchEvent) => void;
  boundOnMouseEnter!: () => void;
  boundOnMouseLeave!: () => void;

  isDown: boolean = false;
  start: number = 0;
  startY: number = 0; // Track Y position to detect vertical scrolling

  constructor(
    container: HTMLElement,
    {
      items,
      bend = 1,
      textColor = '#ffffff',
      borderRadius = 0,
      font = 'bold 30px Figtree',
      scrollSpeed = 2,
      scrollEase = 0.05,
      onSelect
    }: AppConfig
  ) {
    document.documentElement.classList.remove('no-js');
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onSelect = onSelect;
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    
    // Initialize scroll position to the middle set of items for infinite scrolling
    // This allows scrolling in both directions seamlessly
    if (this.medias && this.medias.length > 0 && this.baseItems.length > 0) {
      const width = this.medias[0].width;
      const totalWidth = width * this.baseItems.length;
      // Start at the beginning of the middle set (one full cycle to the left)
      this.scroll.current = -totalWidth;
      this.scroll.target = -totalWidth;
      this.scroll.last = -totalWidth;
    }
    
    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    // Reduced geometry segments for better performance (50x100 -> 20x40)
    // This reduces vertex count from 5,000 to 800, significantly improving render performance
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 20,
      widthSegments: 40
    });
  }

  createMedias(
    items: GalleryItem[] | undefined,
    bend: number = 1,
    textColor: string,
    borderRadius: number,
    font: string
  ) {
    const defaultItems: GalleryItem[] = [
      {
        image: `https://picsum.photos/seed/1/800/600?grayscale`,
        text: 'Bridge'
      },
      {
        image: `https://picsum.photos/seed/2/800/600?grayscale`,
        text: 'Desk Setup'
      },
      {
        image: `https://picsum.photos/seed/3/800/600?grayscale`,
        text: 'Waterfall'
      },
      {
        image: `https://picsum.photos/seed/4/800/600?grayscale`,
        text: 'Strawberries'
      },
      {
        image: `https://picsum.photos/seed/5/800/600?grayscale`,
        text: 'Deep Diving'
      },
      {
        image: `https://picsum.photos/seed/16/800/600?grayscale`,
        text: 'Train Track'
      },
      {
        image: `https://picsum.photos/seed/17/800/600?grayscale`,
        text: 'Santorini'
      },
      {
        image: `https://picsum.photos/seed/8/800/600?grayscale`,
        text: 'Blurry Lights'
      },
      {
        image: `https://picsum.photos/seed/9/800/600?grayscale`,
        text: 'New York'
      },
      {
        image: `https://picsum.photos/seed/10/800/600?grayscale`,
        text: 'Good Boy'
      },
      {
        image: `https://picsum.photos/seed/21/800/600?grayscale`,
        text: 'Coastline'
      },
      {
        image: `https://picsum.photos/seed/12/800/600?grayscale`,
        text: 'Palm Trees'
      }
    ];
    const galleryItems = items && items.length ? items : defaultItems;
    this.baseItems = galleryItems;
    // Duplicate items for infinite scrolling (3 copies: before, current, after)
    // This ensures seamless wrapping in both directions
    this.mediasImages = [...galleryItems, ...galleryItems, ...galleryItems];
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: galleryItems.length, // Use original length for positioning calculations
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
        baseIndex: index % galleryItems.length
      });
    });
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.isHovered = true;
    this.hasDrag = false;
    this.scroll.position = this.scroll.current;
    const touch = 'touches' in e ? e.touches[0] : e;
    this.start = touch.clientX;
    this.startY = touch.clientY; // Track Y position for vertical scroll detection
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    if ('touches' in e) {
      if (e.touches.length === 0) return;
    }
    const touch = 'touches' in e ? e.touches[0] : e;
    const x = touch.clientX;
    const y = touch.clientY;
    
    // Calculate horizontal and vertical distances
    const deltaX = Math.abs(this.start - x);
    const deltaY = Math.abs(this.startY - y);
    
    // If user is scrolling vertically (page scroll), don't interfere
    // Only prevent default and handle gallery scroll if movement is primarily horizontal
    if (deltaX > deltaY && deltaX > 5) {
      // Primarily horizontal movement - handle gallery scroll
      if ('touches' in e) {
        e.preventDefault(); // Only prevent default for horizontal scrolling
      }
      const distance = (this.start - x) * (this.scrollSpeed * 0.025);
      this.scroll.target = (this.scroll.position ?? 0) + distance;
      if (Math.abs(distance) > 0.01) {
        this.hasDrag = true;
      }
    } else if (deltaY > deltaX && deltaY > 10) {
      // Primarily vertical movement - let page scroll, cancel gallery interaction
      this.hasDrag = true; // Mark as drag to prevent click
      this.isDown = false; // Cancel the interaction
      this.isHovered = false;
    }
  }

  onTouchUp(e?: MouseEvent | TouchEvent) {
    const wasDown = this.isDown;
    const hadDrag = this.hasDrag;
    
    this.isDown = false;
    this.onCheck();
    
    if (e && 'touches' in e) {
      this.isHovered = false;
    }
    
    // Only trigger onSelect if:
    // 1. Touch was actually down (wasDown)
    // 2. There was no drag (hadDrag is false)
    // 3. The touch was very short (tap, not scroll)
    // 4. Active media exists
    if (wasDown && !hadDrag && this.onSelect && this.activeMedia) {
      // Additional check: verify this was a true tap by checking movement distance
      const touch = e && 'touches' in e ? e.changedTouches?.[0] : e;
      if (touch) {
        const finalX = touch.clientX;
        const finalY = touch.clientY;
        const totalDeltaX = Math.abs(this.start - finalX);
        const totalDeltaY = Math.abs(this.startY - finalY);
        
        // Only trigger if movement was minimal (true tap, not scroll)
        // Threshold: less than 10px movement in either direction
        if (totalDeltaX < 10 && totalDeltaY < 10) {
          const baseIndex = this.activeMedia.baseIndex % this.baseItems.length;
          const item = this.baseItems[baseIndex];
          if (item) {
            this.onSelect(item, baseIndex);
          }
        }
      }
    }
    
    // Reset drag state for next interaction
    this.hasDrag = false;
  }

  onWheel(e: Event) {
    if (!this.isHovered) return;
    const wheelEvent = e as WheelEvent;
    if (wheelEvent.cancelable) {
      wheelEvent.preventDefault();
    }
    wheelEvent.stopPropagation();
    const delta = wheelEvent.deltaY || (wheelEvent as any).wheelDelta || (wheelEvent as any).detail;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const baseLength = this.baseItems.length;
    const totalWidth = width * baseLength;
    
    // For infinite scroll, we don't clamp - let it scroll freely
    // The repositioning logic in update() handles wrapping when cards go off-screen
    // Just snap to nearest item position for smooth scrolling
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }

  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      this.medias.forEach(media => media.update(this.scroll, direction));
      let closest: Media | null = null;
      let minDistance = Infinity;
      this.medias.forEach(media => {
        const distance = Math.abs(media.plane.position.x);
        if (distance < minDistance) {
          minDistance = distance;
          closest = media;
        }
      });
      this.activeMedia = closest;
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    this.boundOnMouseEnter = () => {
      this.isHovered = true;
    };
    this.boundOnMouseLeave = () => {
      this.isHovered = false;
      if (!this.isDown) this.onCheck();
    };
    window.addEventListener('resize', this.boundOnResize);
    this.container.addEventListener('wheel', this.boundOnWheel, { passive: false });
    this.container.addEventListener('mousedown', this.boundOnTouchDown);
    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    this.container.addEventListener('mouseenter', this.boundOnMouseEnter);
    this.container.addEventListener('mouseleave', this.boundOnMouseLeave);
    this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: true });
    window.addEventListener('touchmove', this.boundOnTouchMove, { passive: false });
    window.addEventListener('touchend', this.boundOnTouchUp);
    window.addEventListener('touchcancel', this.boundOnTouchUp);
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundOnResize);
    this.container.removeEventListener('wheel', this.boundOnWheel);
    this.container.removeEventListener('mousedown', this.boundOnTouchDown);
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    this.container.removeEventListener('mouseenter', this.boundOnMouseEnter);
    this.container.removeEventListener('mouseleave', this.boundOnMouseLeave);
    this.container.removeEventListener('touchstart', this.boundOnTouchDown);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    window.removeEventListener('touchend', this.boundOnTouchUp);
    window.removeEventListener('touchcancel', this.boundOnTouchUp);
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas as HTMLCanvasElement);
    }
  }
}

interface CircularGalleryProps {
  items?: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  onSelect?: (item: GalleryItem, index: number) => void;
}

// Helper function to compare items by content (image URLs) instead of reference
function itemsEqual(items1: GalleryItem[], items2: GalleryItem[]): boolean {
  if (items1.length !== items2.length) return false;
  return items1.every((item1, index) => {
    const item2 = items2[index];
    return item1.image === item2.image && item1.text === item2.text;
  });
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px Figtree',
  scrollSpeed = 2,
  scrollEase = 0.05,
  onSelect
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<App | null>(null);
  const previousItemsRef = useRef<GalleryItem[]>([]);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Only create new App if items actually changed (by content, not reference)
    // This prevents unnecessary remounts when items array reference changes but content is the same
    if (appRef.current && itemsEqual(previousItemsRef.current, items)) {
      // Items haven't changed by content - don't remount
      return;
    }
    
    // Items changed or first mount - create/recreate App
    if (appRef.current) {
      appRef.current.destroy();
      appRef.current = null;
    }
    
    const app = new App(containerRef.current, {
      items,
      bend,
      textColor,
      borderRadius,
      font,
      scrollSpeed,
      scrollEase,
      onSelect
    });
    
    appRef.current = app;
    previousItemsRef.current = items;
    
    return () => {
      if (appRef.current) {
        appRef.current.destroy();
        appRef.current = null;
      }
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, onSelect]);
  
  return <div className="w-full h-full overflow-visible cursor-grab active:cursor-grabbing" ref={containerRef} />;
}

