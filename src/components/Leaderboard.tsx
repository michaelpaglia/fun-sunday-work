'use client';

import { Snake } from '@/types';

interface LeaderboardProps {
  snakes: Snake[];
  selectedSnakeId: string | null;
  onSelectSnake: (id: string) => void;
}

export default function Leaderboard({ snakes, selectedSnakeId, onSelectSnake }: LeaderboardProps) {
  // Sort by price change (best performers first)
  const sortedSnakes = [...snakes].sort(
    (a, b) => b.token.priceChange - a.token.priceChange
  );

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-4 w-64 max-h-[400px] overflow-y-auto">
      <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
        <span className="text-2xl">🏆</span> Leaderboard
      </h3>

      <div className="space-y-2">
        {sortedSnakes.map((snake, index) => {
          const isSelected = snake.id === selectedSnakeId;
          const priceChange = snake.token.priceChange;
          const isUp = priceChange >= 0;

          return (
            <button
              key={snake.id}
              onClick={() => onSelectSnake(snake.id)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all
                ${isSelected
                  ? 'bg-green-500/20 border border-green-500'
                  : 'bg-zinc-800/50 hover:bg-zinc-700/50 border border-transparent'
                }`}
            >
              <span className="text-zinc-500 font-mono w-6">#{index + 1}</span>

              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: snake.color }}
              />

              <div className="flex-1 text-left">
                <p className="text-white text-sm font-medium truncate">
                  {snake.token.symbol}
                </p>
              </div>

              <span
                className={`text-sm font-mono ${
                  isUp ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isUp ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>

      {snakes.length === 0 && (
        <p className="text-zinc-500 text-sm text-center py-4">No snakes yet...</p>
      )}
    </div>
  );
}
