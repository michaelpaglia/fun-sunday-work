import WalletInput from '@/components/WalletInput';

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 max-w-2xl text-center">
        {/* Retro Title */}
        <div className="space-y-4">
          <div className="text-green-500 text-6xl mb-4">🐍</div>
          <h1 className="text-3xl md:text-5xl font-mono text-green-500 tracking-wider animate-pulse">
            SOLANA SNAKE
          </h1>
          <p className="text-lg md:text-xl text-green-600 font-mono">
            YOUR TOKENS. YOUR SNAKES.
          </p>
        </div>

        {/* Description Box */}
        <div className="bg-black border-2 border-green-500 rounded p-6 space-y-3 max-w-md">
          <p className="text-green-400 font-mono text-sm leading-relaxed">
            ENTER YOUR SOLANA WALLET ADDRESS AND WATCH YOUR TOKENS COME ALIVE AS SNAKES.
          </p>
          <p className="text-green-600 font-mono text-xs">
            PRICE UP = SNAKE GROWS<br/>
            PRICE DOWN = SNAKE SHRINKS<br/>
            EAT FOOD & SMALLER SNAKES!
          </p>
        </div>

        {/* Wallet Input */}
        <WalletInput />

        {/* Controls */}
        <div className="bg-black border-2 border-green-700 rounded p-4 mt-4">
          <p className="text-green-700 font-mono text-xs">
            CONTROLS: [↑][↓][←][→] OR [W][A][S][D]
          </p>
        </div>

        {/* Footer */}
        <p className="text-green-900 text-xs font-mono mt-8">
          INSERT WALLET TO PLAY
        </p>
      </main>
    </div>
  );
}
