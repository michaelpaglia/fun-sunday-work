import { Snake, Point, Direction, TokenWithPrice, GameState } from '@/types';

// Color palette for snakes
const SNAKE_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Gold
  '#BB8FCE', // Purple
  '#85C1E9', // Light Blue
];

const BASE_SNAKE_SIZE = 15;
const MIN_SNAKE_SIZE = 8;
const MAX_SNAKE_SIZE = 40;
const BASE_SPEED = 2;
const SEGMENT_GAP = 0.8;

export function createSnake(
  token: TokenWithPrice,
  canvasWidth: number,
  canvasHeight: number,
  index: number,
  isPlayer: boolean = false
): Snake {
  // Random starting position
  const startX = Math.random() * (canvasWidth - 100) + 50;
  const startY = Math.random() * (canvasHeight - 100) + 50;

  // Random starting direction
  const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const direction = directions[Math.floor(Math.random() * directions.length)];

  // Initial segments
  const segments: Point[] = [];
  const segmentCount = 5;
  for (let i = 0; i < segmentCount; i++) {
    segments.push({
      x: startX - i * BASE_SNAKE_SIZE * SEGMENT_GAP * (direction === 'RIGHT' ? -1 : direction === 'LEFT' ? 1 : 0),
      y: startY - i * BASE_SNAKE_SIZE * SEGMENT_GAP * (direction === 'DOWN' ? -1 : direction === 'UP' ? 1 : 0),
    });
  }

  return {
    id: token.mint,
    token,
    segments,
    direction,
    speed: BASE_SPEED,
    baseSize: BASE_SNAKE_SIZE,
    currentSize: BASE_SNAKE_SIZE,
    color: SNAKE_COLORS[index % SNAKE_COLORS.length],
    isPlayer,
  };
}

export function updateSnakeSize(snake: Snake, priceChange: number): Snake {
  // Size scales with price change: +10% = +5 size, -10% = -5 size
  const sizeMultiplier = 0.5;
  const newSize = BASE_SNAKE_SIZE + priceChange * sizeMultiplier;
  const clampedSize = Math.max(MIN_SNAKE_SIZE, Math.min(MAX_SNAKE_SIZE, newSize));

  // Add/remove segments based on size
  const targetSegments = Math.max(3, Math.floor(clampedSize / 3));
  const segments = [...snake.segments];

  while (segments.length < targetSegments) {
    const lastSegment = segments[segments.length - 1];
    segments.push({ ...lastSegment });
  }
  while (segments.length > targetSegments) {
    segments.pop();
  }

  return {
    ...snake,
    currentSize: clampedSize,
    segments,
    token: {
      ...snake.token,
      priceChange,
    },
  };
}

export function moveSnake(
  snake: Snake,
  canvasWidth: number,
  canvasHeight: number
): Snake {
  const head = snake.segments[0];
  let newHead: Point;

  const speed = snake.speed * (snake.currentSize / BASE_SNAKE_SIZE);

  switch (snake.direction) {
    case 'UP':
      newHead = { x: head.x, y: head.y - speed };
      break;
    case 'DOWN':
      newHead = { x: head.x, y: head.y + speed };
      break;
    case 'LEFT':
      newHead = { x: head.x - speed, y: head.y };
      break;
    case 'RIGHT':
      newHead = { x: head.x + speed, y: head.y };
      break;
  }

  // Wrap around edges
  if (newHead.x < 0) newHead.x = canvasWidth;
  if (newHead.x > canvasWidth) newHead.x = 0;
  if (newHead.y < 0) newHead.y = canvasHeight;
  if (newHead.y > canvasHeight) newHead.y = 0;

  // Move segments (follow the leader)
  const newSegments = [newHead];
  for (let i = 1; i < snake.segments.length; i++) {
    const prev = newSegments[i - 1];
    const curr = snake.segments[i - 1];
    const dx = prev.x - curr.x;
    const dy = prev.y - curr.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const targetDist = snake.currentSize * SEGMENT_GAP;

    if (dist > targetDist) {
      newSegments.push({
        x: curr.x + (dx / dist) * (dist - targetDist),
        y: curr.y + (dy / dist) * (dist - targetDist),
      });
    } else {
      newSegments.push({ ...curr });
    }
  }

  return {
    ...snake,
    segments: newSegments,
  };
}

export function updateAIDirection(snake: Snake, canvasWidth: number, canvasHeight: number): Snake {
  // AI snakes randomly change direction occasionally
  if (Math.random() < 0.02) {
    const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    // Don't reverse direction
    const validDirections = directions.filter((d) => d !== opposites[snake.direction]);
    const newDirection = validDirections[Math.floor(Math.random() * validDirections.length)];

    return { ...snake, direction: newDirection };
  }

  return snake;
}

export function changeDirection(snake: Snake, newDirection: Direction): Snake {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };

  // Prevent reversing
  if (newDirection === opposites[snake.direction]) {
    return snake;
  }

  return { ...snake, direction: newDirection };
}

export function initializeGame(
  tokens: TokenWithPrice[],
  canvasWidth: number,
  canvasHeight: number
): GameState {
  const snakes = tokens.slice(0, 10).map((token, index) =>
    createSnake(token, canvasWidth, canvasHeight, index, index === 0)
  );

  return {
    snakes,
    canvasWidth,
    canvasHeight,
    isRunning: true,
    selectedSnakeId: snakes.length > 0 ? snakes[0].id : null,
  };
}

export function gameLoop(state: GameState): GameState {
  if (!state.isRunning) return state;

  const updatedSnakes = state.snakes.map((snake) => {
    let updated = snake;

    // AI movement for non-player snakes
    if (!snake.isPlayer || snake.id !== state.selectedSnakeId) {
      updated = updateAIDirection(updated, state.canvasWidth, state.canvasHeight);
    }

    // Move all snakes
    updated = moveSnake(updated, state.canvasWidth, state.canvasHeight);

    return updated;
  });

  return {
    ...state,
    snakes: updatedSnakes,
  };
}
