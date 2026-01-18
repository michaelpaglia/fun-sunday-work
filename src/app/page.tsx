import WalletInput from '@/components/WalletInput';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 flex flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 max-w-2xl text-center">
        {/* Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400">
            Solana Snake
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400">
            Your tokens. Your snakes. Real-time chaos.
          </p>
        </div>

        {/* Description */}
        <div className="bg-zinc-800/30 rounded-2xl p-6 border border-zinc-700/50 space-y-3">
          <p className="text-zinc-300 leading-relaxed">
            Enter your Solana wallet address and watch your tokens come alive as
            snakes in a live arena. As prices go <span className="text-green-400 font-semibold">up</span>,
            your snakes <span className="text-green-400 font-semibold">grow</span>.
            As prices go <span className="text-red-400 font-semibold">down</span>,
            they <span className="text-red-400 font-semibold">shrink</span>.
          </p>
          <p className="text-zinc-500 text-sm">
            Use arrow keys or WASD to control your selected snake!
          </p>
        </div>

        {/* Wallet Input */}
        <WalletInput />

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 w-full mt-4">
          <div className="bg-zinc-800/20 rounded-xl p-4 border border-zinc-700/30">
            <div className="text-3xl mb-2">🐍</div>
            <p className="text-zinc-400 text-sm">Multi-snake arena</p>
          </div>
          <div className="bg-zinc-800/20 rounded-xl p-4 border border-zinc-700/30">
            <div className="text-3xl mb-2">📈</div>
            <p className="text-zinc-400 text-sm">Real-time prices</p>
          </div>
          <div className="bg-zinc-800/20 rounded-xl p-4 border border-zinc-700/30">
            <div className="text-3xl mb-2">🎮</div>
            <p className="text-zinc-400 text-sm">Playable controls</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-zinc-600 text-xs mt-8">
          Built for fun. Not financial advice. Just vibes.
        </p>
      </main>
    </div>
  );
}
