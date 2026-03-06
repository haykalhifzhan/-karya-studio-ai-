'use client';

import { useEffect, useRef } from 'react';
import './LiquidEther.css';

interface LiquidEtherProps {
  colors?: string[];
  color0?: string;
  color1?: string;
  color2?: string;
  resolution?: number;
  mouseForce?: number;
  cursorSize?: number;
  dissipation?: number;
  style?: React.CSSProperties;
  className?: string;
  autoDemo?: boolean;
}

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetRadius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export default function LiquidEther({
  colors = ['#7c3aed', '#9333ea', '#a855f7', '#6d28d9', '#c026d3'],
  mouseForce = 1,
  cursorSize = 220,
  dissipation = 0.985,
  style = {},
  className = '',
  autoDemo = false,
}: LiquidEtherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const blobsRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999, prevX: -9999, prevY: -9999 });
  const colorIdxRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Setup offscreen canvas for accumulation (temporal blending)
    const offscreen = document.createElement('canvas');
    offscreenRef.current = offscreen;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      offscreen.width = window.innerWidth;
      offscreen.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d')!;
    const offCtx = offscreen.getContext('2d')!;

    const spawnBlob = (x: number, y: number, vx: number, vy: number) => {
      const color = colors[colorIdxRef.current % colors.length];
      colorIdxRef.current++;
      const maxLife = 80 + Math.random() * 40;
      blobsRef.current.push({
        x, y, vx, vy,
        radius: cursorSize * 0.3,
        targetRadius: cursorSize * (0.8 + Math.random() * 0.4),
        color,
        alpha: 0,
        life: 0,
        maxLife,
      });
      // Cap blobs to prevent memory issues
      if (blobsRef.current.length > 60) {
        blobsRef.current.shift();
      }
    };

    // Mouse listener on window to bypass pointer-events-none
    const onMouseMove = (e: MouseEvent) => {
      const { x: px, y: py } = mouseRef.current;
      const nx = e.clientX;
      const ny = e.clientY;
      const dx = nx - px;
      const dy = ny - py;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 4) {
        spawnBlob(nx, ny, dx * 0.12, dy * 0.12);
        mouseRef.current.prevX = px;
        mouseRef.current.prevY = py;
        mouseRef.current.x = nx;
        mouseRef.current.y = ny;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const nx = t.clientX;
      const ny = t.clientY;
      const { x: px, y: py } = mouseRef.current;
      const dx = nx - px;
      const dy = ny - py;
      spawnBlob(nx, ny, dx * 0.12, dy * 0.12);
      mouseRef.current.x = nx;
      mouseRef.current.y = ny;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    let lastTime = 0;

    const render = (time: number) => {
      animFrameRef.current = requestAnimationFrame(render);
      const dt = Math.min(time - lastTime, 32);
      lastTime = time;

      // --- Offscreen: apply global fade (dissipation) ---
      offCtx.globalCompositeOperation = 'source-over';
      offCtx.globalAlpha = 1 - dissipation; // e.g. 0.015 fade per frame
      offCtx.fillStyle = '#000000';
      offCtx.fillRect(0, 0, offscreen.width, offscreen.height);
      offCtx.globalAlpha = 1;

      // --- Update and draw blobs onto offscreen ---
      offCtx.globalCompositeOperation = 'screen'; // Additive blending for glowing effect

      blobsRef.current = blobsRef.current.filter(blob => blob.life < blob.maxLife);

      for (const blob of blobsRef.current) {
        blob.life += 1;
        const t = blob.life / blob.maxLife;

        // Smooth fade in then fade out (bell curve)
        const fadeIn = Math.min(blob.life / 15, 1);
        const fadeOut = t > 0.6 ? 1 - ((t - 0.6) / 0.4) : 1;
        blob.alpha = fadeIn * fadeOut * 0.05;

        // Grow radius smoothly
        blob.radius += (blob.targetRadius - blob.radius) * 0.05;

        // Move with damping
        blob.x += blob.vx * (1 - t);
        blob.y += blob.vy * (1 - t);
        blob.vx *= 0.97;
        blob.vy *= 0.97;

        if (blob.alpha <= 0.001) continue;

        // Draw radial gradient blob
        const grad = offCtx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        );
        grad.addColorStop(0, blob.color + Math.round(blob.alpha * 255).toString(16).padStart(2, '0'));
        grad.addColorStop(0.4, blob.color + Math.round(blob.alpha * 120).toString(16).padStart(2, '0'));
        grad.addColorStop(1, blob.color + '00');

        offCtx.beginPath();
        offCtx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        offCtx.fillStyle = grad;
        offCtx.fill();
      }

      // --- Blit offscreen to main canvas with blur ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'blur(45px) saturate(60%)';
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(offscreen, 0, 0);
      ctx.filter = 'none';
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', resize);
    };
  }, [colors, cursorSize, dissipation]);

  return (
    <canvas
      ref={canvasRef}
      className={`liquid-ether-container ${className}`}
      style={{ display: 'block', ...style }}
    />
  );
}
