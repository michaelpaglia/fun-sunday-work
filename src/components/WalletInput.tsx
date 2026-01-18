'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WalletInput() {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    // Basic validation for Solana address
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!base58Regex.test(address.trim())) {
      setError('Invalid Solana address format');
      return;
    }

    setLoading(true);

    try {
      // Verify wallet has tokens
      const response = await fetch(`/api/wallet?address=${address.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch wallet');
        return;
      }

      if (!data.tokens || data.tokens.length === 0) {
        setError('No tokens found in this wallet');
        return;
      }

      // Navigate to game with wallet address
      router.push(`/game?wallet=${address.trim()}`);
    } catch {
      setError('Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4">
      <div className="relative">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter Solana wallet address..."
          className="w-full px-6 py-4 text-lg bg-zinc-800/50 border border-zinc-700 rounded-2xl
                     text-white placeholder-zinc-500 focus:outline-none focus:border-green-500
                     focus:ring-2 focus:ring-green-500/20 transition-all"
          disabled={loading}
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600
                   rounded-2xl text-white hover:from-green-400 hover:to-emerald-500
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all
                   shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading wallet...
          </span>
        ) : (
          'Start Game'
        )}
      </button>

      <p className="text-zinc-500 text-sm text-center">
        Your tokens will become snakes in the arena!
      </p>
    </form>
  );
}
