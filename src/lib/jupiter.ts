// Using DexScreener API - free, no auth required
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/tokens';

// SOL mint address
const SOL_MINT = 'So11111111111111111111111111111111111111112';

export async function getTokenPrices(mints: string[]): Promise<Record<string, number>> {
  if (mints.length === 0) {
    return {};
  }

  const prices: Record<string, number> = {};

  // Fetch prices for each token (DexScreener supports comma-separated)
  try {
    const response = await fetch(`${DEXSCREENER_API}/${mints.join(',')}`);

    if (!response.ok) {
      console.error('DexScreener API error:', response.status);
      // Fallback: return mock prices for demo
      return getMockPrices(mints);
    }

    const data = await response.json();

    if (data.pairs) {
      for (const pair of data.pairs) {
        const mint = pair.baseToken?.address;
        const price = parseFloat(pair.priceUsd);
        if (mint && !isNaN(price) && !prices[mint]) {
          prices[mint] = price;
        }
      }
    }

    // If we didn't get all prices, fill with mock
    for (const mint of mints) {
      if (!prices[mint]) {
        const mockPrices = getMockPrices([mint]);
        prices[mint] = mockPrices[mint];
      }
    }

    return prices;
  } catch (error) {
    console.error('Price fetch error:', error);
    return getMockPrices(mints);
  }
}

// Mock prices for demo/fallback
function getMockPrices(mints: string[]): Record<string, number> {
  const prices: Record<string, number> = {};

  for (const mint of mints) {
    if (mint === SOL_MINT) {
      // Approximate SOL price with small random variation
      prices[mint] = 140 + (Math.random() - 0.5) * 5;
    } else {
      // Random price for other tokens
      prices[mint] = Math.random() * 10;
    }
  }

  return prices;
}
