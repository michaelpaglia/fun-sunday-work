const JUPITER_PRICE_API = 'https://api.jup.ag/price/v2';

export async function getTokenPrices(mints: string[]): Promise<Record<string, number>> {
  if (mints.length === 0) {
    return {};
  }

  const ids = mints.join(',');
  const response = await fetch(`${JUPITER_PRICE_API}?ids=${ids}`);

  if (!response.ok) {
    throw new Error(`Jupiter API error: ${response.status}`);
  }

  const data = await response.json();

  const prices: Record<string, number> = {};

  if (data.data) {
    for (const [mint, priceData] of Object.entries(data.data)) {
      const price = (priceData as { price: number })?.price;
      if (price) {
        prices[mint] = price;
      }
    }
  }

  return prices;
}
