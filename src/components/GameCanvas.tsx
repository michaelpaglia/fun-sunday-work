'use client';

import { useRef, useEffect, useCallback } from 'react';
import { GameState, Direction } from '@/types';

interface GameCanvasProps {
  gameState: GameState;
  onDirectionChange: (direction: Direction) => void;
  onEatFood: (foodIndex: number) => void;
  onEatSnake: (eatenSnakeId: string) => void;
}

const CELL_SIZE = 16;

export default function GameCanvas({ gameState, onDirectionChange, onEatFood, onEatSnake }: GameCanvasProps) {
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

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { snakes, food, canvasWidth, canvasHeight, selectedSnakeId, score } = gameState;

    // Clear with black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Subtle grid
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvasWidth; x += CELL_SIZE * 2) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= canvasHeight; y += CELL_SIZE * 2) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, canvasWidth - 2, canvasHeight - 2);

    // Draw food
    if (food) {
      food.forEach((f) => {
        ctx.fillStyle = '#f00';
        ctx.fillRect(f.x - CELL_SIZE/2, f.y - CELL_SIZE/2, CELL_SIZE, CELL_SIZE);

        // Inner glow
        ctx.fillStyle = '#f66';
        ctx.fillRect(f.x - CELL_SIZE/4, f.y - CELL_SIZE/4, CELL_SIZE/2, CELL_SIZE/2);
      });
    }

    // Draw snakes
    snakes.forEach((snake) => {
      if (snake.segments.length === 0) return;

      const isSelected = snake.id === selectedSnakeId;
      const size = Math.max(CELL_SIZE, Math.min(CELL_SIZE * 2, snake.currentSize * 0.8));

      // Draw body segments as connected rectangles
      for (let i = snake.segments.length - 1; i >= 0; i--) {
        const seg = snake.segments[i];
        const segSize = size - (i * 0.5);

        ctx.fillStyle = snake.color;
        ctx.fillRect(
          seg.x - segSize/2,
          seg.y - segSize/2,
          segSize,
          segSize
        );
      }

      // Head with highlight if selected
      const head = snake.segments[0];
      if (isSelected) {
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(head.x - size/2 - 2, head.y - size/2 - 2, size + 4, size + 4);
      }

      // Eyes on head
      ctx.fillStyle = '#fff';
      const eyeSize = Math.max(3, size / 6);
      const eyeOffset = size / 4;

      let e1x = head.x - eyeOffset, e1y = head.y - eyeOffset;
      let e2x = head.x + eyeOffset, e2y = head.y - eyeOffset;

      if (snake.direction === 'DOWN') { e1y = head.y + eyeOffset; e2y = head.y + eyeOffset; }
      else if (snake.direction === 'LEFT') { e1x = head.x - eyeOffset; e1y = head.y - eyeOffset; e2x = head.x - eyeOffset; e2y = head.y + eyeOffset; }
      else if (snake.direction === 'RIGHT') { e1x = head.x + eyeOffset; e1y = head.y - eyeOffset; e2x = head.x + eyeOffset; e2y = head.y + eyeOffset; }

      ctx.fillRect(e1x - eyeSize/2, e1y - eyeSize/2, eyeSize, eyeSize);
      ctx.fillRect(e2x - eyeSize/2, e2y - eyeSize/2, eyeSize, eyeSize);

      // Label (only symbol, small)
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(snake.token.symbol.slice(0, 6), head.x, head.y - size/2 - 6);

      // Price % (tiny, colored)
      const pct = snake.token.priceChange;
      ctx.font = '8px monospace';
      ctx.fillStyle = pct >= 0 ? '#0f0' : '#f00';
      ctx.fillText(`${pct >= 0 ? '+' : ''}${pct.toFixed(0)}%`, head.x, head.y - size/2 - 16);
    });

    // HUD - Score (top left)
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 12, 24);

  }, [gameState]);

  // Collision detection
  useEffect(() => {
    const { snakes, food, selectedSnakeId } = gameState;
    const player = snakes.find(s => s.id === selectedSnakeId);
    if (!player || player.segments.length === 0) return;

    const head = player.segments[0];
    const hitRadius = Math.max(25, player.currentSize);

    // Food collision
    if (food) {
      food.forEach((f, i) => {
        const d = Math.hypot(head.x - f.x, head.y - f.y);
        if (d < hitRadius) onEatFood(i);
      });
    }

    // Snake collision
    snakes.forEach((other) => {
      if (other.id === selectedSnakeId || other.segments.length === 0) return;
      const otherHead = other.segments[0];
      const d = Math.hypot(head.x - otherHead.x, head.y - otherHead.y);
      if (d < hitRadius && player.currentSize > other.currentSize * 1.1) {
        onEatSnake(other.id);
      }
    });
  }, [gameState, onEatFood, onEatSnake]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={gameState.canvasWidth}
      height={gameState.canvasHeight}
      style={{
        border: '3px solid #0f0',
        borderRadius: '4px',
        boxShadow: '0 0 20px rgba(0,255,0,0.3)',
      }}
    />
  );
}
