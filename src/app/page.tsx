import WalletInput from '@/components/WalletInput';

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-6 max-w-2xl text-center">
        {/* Retro Title */}
        <div className="space-y-4">
          <h1 className="text-xl md:text-2xl font-arcade text-green-500 tracking-wider">
            SOLANA SNAKE
          </h1>
          <p className="text-[10px] text-green-600 font-arcade">
            YOUR TOKENS. YOUR SNAKES.
          </p>
        </div>

        {/* Description Box */}
        <div className="bg-black border-2 border-green-500 p-4 space-y-3 max-w-md">
          <p className="text-green-400 font-arcade text-[8px] leading-relaxed">
            ENTER YOUR SOLANA WALLET ADDRESS
            AND WATCH YOUR TOKENS COME ALIVE
          </p>
          <div className="text-green-600 font-arcade text-[8px] space-y-1">
            <p>PRICE UP = SNAKE GROWS</p>
            <p>PRICE DOWN = SNAKE SHRINKS</p>
            <p>EAT FOOD + SMALLER SNAKES</p>
          </div>
        </div>

        {/* Wallet Input */}
        <WalletInput />

        {/* Controls */}
        <div className="border border-green-800 p-3">
          <p className="text-green-800 font-arcade text-[8px]">
            CONTROLS: ARROWS OR WASD
          </p>
        </div>

        {/* Footer */}
        <p className="text-green-900 text-[8px] font-arcade mt-4">
          INSERT COIN TO PLAY
        </p>
      </main>
    </div>
  );
}
