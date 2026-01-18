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
    <div className="bg-black border-2 border-green-500 rounded p-4 w-64 max-h-[400px] overflow-y-auto">
      <h3 className="text-green-500 font-mono font-bold text-lg mb-3">
        LEADERBOARD
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
              className={`w-full flex items-center gap-3 p-2 rounded transition-all font-mono text-sm
                ${isSelected
                  ? 'bg-green-500 text-black'
                  : 'bg-black border border-green-700 hover:border-green-500 text-green-500'
                }`}
            >
              <span className={`font-bold w-6 ${isSelected ? 'text-black' : 'text-green-700'}`}>
                {index + 1}.
              </span>

              <div
                className="w-3 h-3 flex-shrink-0"
                style={{ backgroundColor: snake.color }}
              />

              <div className="flex-1 text-left truncate">
                {snake.token.symbol}
              </div>

              <span className={isSelected ? 'text-black font-bold' : isUp ? 'text-green-400' : 'text-red-500'}>
                {isUp ? '+' : ''}{priceChange.toFixed(1)}%
              </span>
            </button>
          );
        })}
      </div>

      {snakes.length === 0 && (
        <p className="text-green-700 text-sm text-center py-4 font-mono">NO SNAKES...</p>
      )}
    </div>
  );
}
