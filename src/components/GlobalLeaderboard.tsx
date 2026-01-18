'use client';

import { useState, useEffect } from 'react';
import { LeaderboardEntry } from '@/lib/supabase';

interface GlobalLeaderboardProps {
  onClose: () => void;
  currentScore?: number;
  walletAddress?: string;
  snakeCount?: number;
  topSnake?: string;
}

export default function GlobalLeaderboard({
  onClose,
  currentScore = 0,
  walletAddress,
  snakeCount = 1,
  topSnake = 'SOL',
}: GlobalLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      if (data.entries) {
        setEntries(data.entries);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitScore = async () => {
    if (!walletAddress || currentScore <= 0) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          score: currentScore,
          snake_count: snakeCount,
          top_snake: topSnake,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        fetchLeaderboard(); // Refresh to show new entry
      } else {
        setError('SUBMIT FAILED');
      }
    } catch {
      setError('NETWORK ERROR');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-black border-2 border-green-500 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-green-500 font-arcade text-xl">GLOBAL RANKINGS</h2>
          <button
            onClick={onClose}
            className="text-green-500 hover:text-green-400 font-arcade"
          >
            [X]
          </button>
        </div>

        {/* Submit Score Section */}
        {currentScore > 0 && walletAddress && !submitted && (
          <div className="mb-4 p-3 border border-green-700 rounded">
            <div className="flex items-center justify-between">
              <div className="font-arcade text-green-500">
                <div className="text-xs text-green-700">YOUR SCORE</div>
                <div className="text-2xl">{currentScore}</div>
              </div>
              <button
                onClick={submitScore}
                disabled={submitting}
                className="px-4 py-2 bg-green-500 text-black font-arcade font-bold rounded hover:bg-green-400 disabled:opacity-50"
              >
                {submitting ? 'SUBMITTING...' : 'SUBMIT'}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-2 font-arcade">{error}</p>}
          </div>
        )}

        {submitted && (
          <div className="mb-4 p-3 border border-green-500 rounded bg-green-500/10">
            <p className="text-green-500 font-arcade text-center">SCORE SUBMITTED!</p>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-green-500 font-arcade text-center py-8">LOADING...</div>
          ) : entries.length === 0 ? (
            <div className="text-green-700 font-arcade text-center py-8">NO SCORES YET</div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div
                  key={entry.id || index}
                  className={`flex items-center gap-3 p-2 rounded font-arcade text-sm ${
                    index < 3 ? 'border border-green-500' : 'border border-green-900'
                  }`}
                >
                  <span className={`w-8 text-center font-bold ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-orange-400' :
                    'text-green-700'
                  }`}>
                    {index + 1}.
                  </span>
                  <span className="flex-1 text-green-500 truncate">
                    {entry.wallet_short}
                  </span>
                  <span className="text-green-400 font-bold">
                    {entry.score}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-green-900">
          <p className="text-green-900 text-xs font-arcade text-center">
            TOP 50 PLAYERS
          </p>
        </div>
      </div>
    </div>
  );
}
