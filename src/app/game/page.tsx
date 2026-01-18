'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GameCanvas from '@/components/GameCanvas';
import GlobalLeaderboard from '@/components/GlobalLeaderboard';
import { Token, TokenWithPrice, GameState, Direction, Snake } from '@/types';
import { initializeGame, gameLoop, changeDirection, updateSnakeSize, spawnFood } from '@/lib/gameEngine';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 550;
const PRICE_UPDATE_MS = 5000;

function GameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const wallet = searchParams.get('wallet');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [tokens, setTokens] = useState<TokenWithPrice[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showGlobalLeaderboard, setShowGlobalLeaderboard] = useState(false);

  const startPricesRef = useRef<Record<string, number>>({});
  const gameLoopRef = useRef<number | null>(null);
  const priceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch wallet tokens
  useEffect(() => {
    if (!wallet) {
      router.push('/');
      return;
    }

    const fetchTokens = async () => {
      try {
        const response = await fetch(`/api/wallet?address=${wallet}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to fetch wallet');
          return;
        }

        if (!data.tokens || data.tokens.length === 0) {
          setError('No tokens found in wallet');
          return;
        }

        const mints = data.tokens.map((t: Token) => t.mint).join(',');
        const priceResponse = await fetch(`/api/prices?mints=${mints}`);
        const priceData = await priceResponse.json();
        const prices = priceData.prices || {};

        const tokensWithPrice: TokenWithPrice[] = data.tokens
          .filter((token: Token) => prices[token.mint])
          .map((token: Token) => ({
            ...token,
            price: prices[token.mint] || 0,
            priceAtStart: prices[token.mint] || 0,
            priceChange: 0,
          }));

        if (tokensWithPrice.length === 0) {
          setError('No priced tokens found');
          return;
        }

        startPricesRef.current = {};
        tokensWithPrice.forEach((t) => {
          startPricesRef.current[t.mint] = t.price;
        });

        setTokens(tokensWithPrice);
        const initialState = initializeGame(tokensWithPrice, CANVAS_WIDTH, CANVAS_HEIGHT);
        setGameState(initialState);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load wallet data');
      }
    };

    fetchTokens();
  }, [wallet, router]);

  // Game loop
  useEffect(() => {
    if (!gameState || !gameState.isRunning) return;

    const tick = () => {
      setGameState((prev) => (prev ? gameLoop(prev) : prev));
      gameLoopRef.current = requestAnimationFrame(tick);
    };

    gameLoopRef.current = requestAnimationFrame(tick);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState?.isRunning]);

  // Price update loop
  useEffect(() => {
    if (!gameState || tokens.length === 0) return;

    const updatePrices = async () => {
      try {
        const mints = tokens.map((t) => t.mint).join(',');
        const response = await fetch(`/api/prices?mints=${mints}`);
        const data = await response.json();

        if (data.prices) {
          setGameState((prev) => {
            if (!prev) return prev;

            const updatedSnakes = prev.snakes.map((snake) => {
              const newPrice = data.prices[snake.token.mint];
              if (!newPrice) return snake;

              const startPrice = startPricesRef.current[snake.token.mint] || newPrice;
              const priceChange = ((newPrice - startPrice) / startPrice) * 100;

              return updateSnakeSize(snake, priceChange);
            });

            return { ...prev, snakes: updatedSnakes };
          });
        }
      } catch (err) {
        console.error('Price update failed:', err);
      }
    };

    priceIntervalRef.current = setInterval(updatePrices, PRICE_UPDATE_MS);

    return () => {
      if (priceIntervalRef.current) {
        clearInterval(priceIntervalRef.current);
      }
    };
  }, [tokens]);

  const handleDirectionChange = useCallback((direction: Direction) => {
    setGameState((prev) => {
      if (!prev || !prev.selectedSnakeId) return prev;

      const updatedSnakes = prev.snakes.map((snake) => {
        if (snake.id === prev.selectedSnakeId) {
          return changeDirection(snake, direction);
        }
        return snake;
      });

      return { ...prev, snakes: updatedSnakes };
    });
  }, []);

  const handleSelectSnake = useCallback((id: string) => {
    setGameState((prev) => {
      if (!prev) return prev;

      const updatedSnakes = prev.snakes.map((snake) => ({
        ...snake,
        isPlayer: snake.id === id,
      }));

      return { ...prev, snakes: updatedSnakes, selectedSnakeId: id };
    });
  }, []);

  const handleEatFood = useCallback((foodIndex: number) => {
    setGameState((prev) => {
      if (!prev) return prev;

      const eatenFood = prev.food[foodIndex];
      if (!eatenFood) return prev;

      const newFood = [...prev.food];
      newFood.splice(foodIndex, 1);
      newFood.push(...spawnFood(prev.canvasWidth, prev.canvasHeight, 1));

      const updatedSnakes = prev.snakes.map((snake) => {
        if (snake.id === prev.selectedSnakeId) {
          const newSegments = [...snake.segments];
          for (let i = 0; i < 2; i++) {
            const lastSeg = newSegments[newSegments.length - 1];
            newSegments.push({ x: lastSeg.x, y: lastSeg.y });
          }
          return {
            ...snake,
            segments: newSegments,
            bonusSize: snake.bonusSize + 3, // Permanent growth
            currentSize: snake.currentSize + 3,
          };
        }
        return snake;
      });

      return {
        ...prev,
        food: newFood,
        snakes: updatedSnakes,
        score: prev.score + eatenFood.value,
      };
    });
  }, []);

  const handleEatSnake = useCallback((eatenSnakeId: string) => {
    setGameState((prev) => {
      if (!prev) return prev;

      const eatenSnake = prev.snakes.find(s => s.id === eatenSnakeId);
      if (!eatenSnake) return prev;

      const remainingSnakes = prev.snakes.filter(s => s.id !== eatenSnakeId);

      const updatedSnakes = remainingSnakes.map((snake) => {
        if (snake.id === prev.selectedSnakeId) {
          const newSegments = [...snake.segments];
          for (let i = 0; i < Math.min(5, eatenSnake.segments.length); i++) {
            newSegments.push({ ...snake.segments[snake.segments.length - 1] });
          }
          const sizeGain = Math.floor(eatenSnake.currentSize / 2);
          return {
            ...snake,
            segments: newSegments,
            bonusSize: snake.bonusSize + sizeGain, // Permanent growth
            currentSize: snake.currentSize + sizeGain,
          };
        }
        return snake;
      });

      const bonusScore = Math.floor(eatenSnake.currentSize * 10);

      return {
        ...prev,
        snakes: updatedSnakes,
        score: prev.score + bonusScore,
      };
    });
  }, []);

  // Sort snakes by performance
  const sortedSnakes = gameState ? [...gameState.snakes].sort(
    (a, b) => b.token.priceChange - a.token.priceChange
  ) : [];

  // Get the currently selected/player snake
  const playerSnake = gameState?.snakes.find(s => s.id === gameState.selectedSnakeId);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-pulse">🐍</div>
          <p className="text-green-500 text-lg font-mono">LOADING...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">💀</div>
          <h2 className="text-2xl font-bold text-red-500 font-mono">GAME OVER</h2>
          <p className="text-red-400 font-mono">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-green-600 text-black font-bold rounded hover:bg-green-500 transition-colors font-mono"
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) return null;

  return (
    <div className="min-h-screen bg-black p-4 flex flex-col items-center">
      {/* Header with controls */}
      <header className="w-full max-w-[900px] mb-3 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="text-green-600 hover:text-green-400 transition-colors font-mono text-xs"
        >
          ← EXIT
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="px-2 py-1 text-green-600 font-mono text-xs hover:text-green-400 transition-colors"
          >
            [{showLeaderboard ? 'HIDE' : 'SNAKES'}]
          </button>
          <button
            onClick={() => setShowGlobalLeaderboard(true)}
            className="px-2 py-1 text-yellow-600 font-mono text-xs hover:text-yellow-400 transition-colors"
          >
            [LEADERBOARD]
          </button>
        </div>

        <span className="text-green-800 text-xs font-mono">
          {wallet?.slice(0, 4)}...{wallet?.slice(-4)}
        </span>
      </header>

      {/* Snake selector (expandable) */}
      {showLeaderboard && (
        <div className="w-full max-w-[900px] mb-2 flex flex-wrap gap-1 justify-center">
          {sortedSnakes.slice(0, 10).map((snake: Snake) => (
            <button
              key={snake.id}
              onClick={() => handleSelectSnake(snake.id)}
              className={`px-2 py-1 rounded font-mono text-xs transition-all ${
                snake.id === gameState.selectedSnakeId
                  ? 'bg-green-500 text-black'
                  : 'text-green-600 hover:text-green-400'
              }`}
            >
              {snake.token.symbol}
            </button>
          ))}
        </div>
      )}

      {/* Game Canvas */}
      <GameCanvas
        gameState={gameState}
        onDirectionChange={handleDirectionChange}
        onEatFood={handleEatFood}
        onEatSnake={handleEatSnake}
      />

      {/* Minimal footer */}
      <p className="text-green-900 text-[10px] font-mono mt-2">
        [ARROWS] MOVE • EAT FOOD • EAT SMALLER SNAKES
      </p>

      {/* Global Leaderboard Modal */}
      {showGlobalLeaderboard && (
        <GlobalLeaderboard
          onClose={() => setShowGlobalLeaderboard(false)}
          currentScore={gameState.score}
          walletAddress={wallet || undefined}
          snakeCount={gameState.snakes.length}
          topSnake={playerSnake?.token.symbol || 'SOL'}
        />
      )}
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-6xl animate-pulse">🐍</div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
