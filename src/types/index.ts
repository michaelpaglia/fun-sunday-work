// Token data from wallet
export interface Token {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  image?: string;
}

// Price data from Jupiter
export interface TokenPrice {
  mint: string;
  price: number;
  priceChange24h?: number;
}

// Combined token with price info
export interface TokenWithPrice extends Token {
  price: number;
  priceAtStart: number;
  priceChange: number; // percentage change since game started
}

// Snake entity in the game
export interface Snake {
  id: string;
  token: TokenWithPrice;
  segments: Point[];
  direction: Direction;
  speed: number;
  baseSize: number;
  currentSize: number;
  bonusSize: number; // Growth from eating food/snakes
  color: string;
  isPlayer: boolean;
  targetDirection?: Direction;
}

export interface Point {
  x: number;
  y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

// Food pellet
export interface Food {
  x: number;
  y: number;
  value: number;
}

// Game state
export interface GameState {
  snakes: Snake[];
  food: Food[];
  canvasWidth: number;
  canvasHeight: number;
  isRunning: boolean;
  selectedSnakeId: string | null;
  score: number;
}

// API responses
export interface WalletResponse {
  tokens: Token[];
  error?: string;
}

export interface PriceResponse {
  prices: Record<string, number>;
  error?: string;
}

// Helius DAS API types
export interface HeliusAsset {
  id: string;
  content: {
    metadata: {
      name: string;
      symbol: string;
    };
    links?: {
      image?: string;
    };
  };
  token_info?: {
    balance: number;
    decimals: number;
    price_info?: {
      price_per_token: number;
    };
  };
}

export interface HeliusResponse {
  result: {
    items: HeliusAsset[];
    total: number;
  };
}
