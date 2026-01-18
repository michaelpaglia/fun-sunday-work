'use client';

import { useRef, useEffect, useCallback } from 'react';
import { GameState, Direction } from '@/types';

interface GameCanvasProps {
  gameState: GameState;
  onDirectionChange: (direction: Direction) => void;
}

export default function GameCanvas({ gameState, onDirectionChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          onDirectionChange('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          onDirectionChange('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onDirectionChange('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onDirectionChange('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDirectionChange]);

  // Draw game
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { snakes, canvasWidth, canvasHeight, selectedSnakeId } = gameState;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y < canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // Draw snakes
    snakes.forEach((snake) => {
      const isSelected = snake.id === selectedSnakeId;

      // Draw segments (body)
      snake.segments.forEach((segment, index) => {
        const size = snake.currentSize * (1 - index * 0.05);
        const alpha = 1 - index * 0.08;

        ctx.beginPath();
        ctx.arc(segment.x, segment.y, Math.max(size / 2, 4), 0, Math.PI * 2);
        ctx.fillStyle = snake.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Glow effect for selected snake
        if (isSelected && index === 0) {
          ctx.shadowColor = snake.color;
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(segment.x, segment.y, size / 2 + 2, 0, Math.PI * 2);
          ctx.strokeStyle = snake.color;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      });

      // Draw head with eyes
      if (snake.segments.length > 0) {
        const head = snake.segments[0];
        const headSize = snake.currentSize / 2;

        // Eyes
        ctx.fillStyle = '#fff';
        const eyeOffset = headSize * 0.4;
        const eyeSize = headSize * 0.25;

        let eye1X = head.x, eye1Y = head.y;
        let eye2X = head.x, eye2Y = head.y;

        switch (snake.direction) {
          case 'UP':
            eye1X = head.x - eyeOffset;
            eye1Y = head.y - eyeOffset * 0.5;
            eye2X = head.x + eyeOffset;
            eye2Y = head.y - eyeOffset * 0.5;
            break;
          case 'DOWN':
            eye1X = head.x - eyeOffset;
            eye1Y = head.y + eyeOffset * 0.5;
            eye2X = head.x + eyeOffset;
            eye2Y = head.y + eyeOffset * 0.5;
            break;
          case 'LEFT':
            eye1X = head.x - eyeOffset * 0.5;
            eye1Y = head.y - eyeOffset;
            eye2X = head.x - eyeOffset * 0.5;
            eye2Y = head.y + eyeOffset;
            break;
          case 'RIGHT':
            eye1X = head.x + eyeOffset * 0.5;
            eye1Y = head.y - eyeOffset;
            eye2X = head.x + eyeOffset * 0.5;
            eye2Y = head.y + eyeOffset;
            break;
        }

        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, eyeSize * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Token symbol above head
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.max(10, snake.currentSize * 0.6)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(snake.token.symbol, head.x, head.y - headSize - 8);

        // Price change indicator
        const priceChange = snake.token.priceChange;
        const changeColor = priceChange >= 0 ? '#22c55e' : '#ef4444';
        ctx.fillStyle = changeColor;
        ctx.font = `${Math.max(8, snake.currentSize * 0.4)}px monospace`;
        ctx.fillText(
          `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(1)}%`,
          head.x,
          head.y - headSize - 20
        );
      }
    });

  }, [gameState]);

  // Animation loop
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={gameState.canvasWidth}
      height={gameState.canvasHeight}
      className="rounded-xl border border-zinc-800 shadow-2xl"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}
