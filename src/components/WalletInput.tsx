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
      setError('ENTER WALLET ADDRESS');
      return;
    }

    // Basic validation for Solana address
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!base58Regex.test(address.trim())) {
      setError('INVALID ADDRESS FORMAT');
      return;
    }

    setLoading(true);

    try {
      // Verify wallet has tokens
      const response = await fetch(`/api/wallet?address=${address.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.toUpperCase() || 'FETCH FAILED');
        return;
      }

      if (!data.tokens || data.tokens.length === 0) {
        setError('NO TOKENS FOUND');
        return;
      }

      // Navigate to game with wallet address
      router.push(`/game?wallet=${address.trim()}`);
    } catch {
      setError('CONNECTION FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3">
      <div className="relative">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="WALLET ADDRESS..."
          className="w-full px-3 py-3 text-[10px] bg-black border-2 border-green-500
                     text-green-500 placeholder-green-700 focus:outline-none focus:border-green-400
                     focus:shadow-[0_0_10px_#00ff00] transition-all font-arcade uppercase"
          disabled={loading}
        />
      </div>

      {error && (
        <p className="text-red-500 text-[8px] text-center font-arcade">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 text-[10px] font-arcade bg-green-500 border-2 border-green-400
                   text-black hover:bg-green-400 hover:shadow-[0_0_20px_#00ff00]
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <span className="animate-pulse">LOADING...</span>
        ) : (
          'START GAME'
        )}
      </button>
    </form>
  );
}
