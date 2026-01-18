'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import GameCanvas from '@/components/GameCanvas';
import Leaderboard from '@/components/Leaderboard';
import { Token, TokenWithPrice, GameState, Direction } from '@/types';
import { initializeGame, gameLoop, changeDirection, updateSnakeSize } from '@/lib/gameEngine';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;
const GAME_TICK_MS = 16; // ~60fps
const PRICE_UPDATE_MS = 5000; // Update prices every 5 seconds

function GameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const wallet = searchParams.get('wallet');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [tokens, setTokens] = useState<TokenWithPrice[]>([]);

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

        // Fetch initial prices
        const mints = data.tokens.map((t: Token) => t.mint).join(',');
        const priceResponse = await fetch(`/api/prices?mints=${mints}`);
        const priceData = await priceResponse.json();

        // Combine tokens with prices
        const tokensWithPrice: TokenWithPrice[] = data.tokens
          .filter((token: Token) => priceData.prices[token.mint])
          .map((token: Token) => ({
            ...token,
            price: priceData.prices[token.mint] || 0,
            priceAtStart: priceData.prices[token.mint] || 0,
            priceChange: 0,
          }));

        if (tokensWithPrice.length === 0) {
          setError('No priced tokens found');
          return;
        }

        // Store starting prices
        startPricesRef.current = {};
        tokensWithPrice.forEach((t) => {
          startPricesRef.current[t.mint] = t.price;
        });

        setTokens(tokensWithPrice);

        // Initialize game
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

  // Handle direction change
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

  // Handle snake selection
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-zinc-400 text-lg">Loading your tokens...</p>
          <p className="text-zinc-600 text-sm">Summoning snakes from the blockchain</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">💀</div>
          <h2 className="text-2xl font-bold text-white">Oops!</h2>
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) return null;

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <span>←</span> Back
        </button>
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
          Solana Snake
        </h1>
        <p className="text-zinc-500 text-sm font-mono">
          {wallet?.slice(0, 4)}...{wallet?.slice(-4)}
        </p>
      </header>

      {/* Game Area */}
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* Canvas */}
        <div className="flex-shrink-0">
          <GameCanvas
            gameState={gameState}
            onDirectionChange={handleDirectionChange}
          />
          <p className="text-zinc-500 text-sm text-center mt-4">
            Use <kbd className="px-2 py-1 bg-zinc-800 rounded text-xs">Arrow Keys</kbd> or
            <kbd className="px-2 py-1 bg-zinc-800 rounded text-xs ml-1">WASD</kbd> to control your snake
          </p>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-auto">
          <Leaderboard
            snakes={gameState.snakes}
            selectedSnakeId={gameState.selectedSnakeId}
            onSelectSnake={handleSelectSnake}
          />

          {/* Info Card */}
          <div className="mt-4 bg-zinc-900/80 rounded-xl p-4 w-64">
            <h4 className="text-white font-semibold mb-2">How it works</h4>
            <ul className="text-zinc-400 text-sm space-y-1">
              <li>📈 Price up = snake grows</li>
              <li>📉 Price down = snake shrinks</li>
              <li>🎯 Click to control a snake</li>
              <li>🔄 Prices update every 5s</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
