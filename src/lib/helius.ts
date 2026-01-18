import { Token, HeliusResponse } from '@/types';

const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

export async function getWalletTokens(walletAddress: string): Promise<Token[]> {
  const response = await fetch(HELIUS_RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: '1',
      method: 'getAssetsByOwner',
      params: {
        ownerAddress: walletAddress,
        page: 1,
        limit: 50,
        displayOptions: {
          showFungible: true,
          showNativeBalance: true,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Helius API error: ${response.status}`);
  }

  const data: HeliusResponse = await response.json();

  if (!data.result?.items) {
    return [];
  }

  // Filter for fungible tokens with balance
  const tokens: Token[] = data.result.items
    .filter((asset) => asset.token_info && asset.token_info.balance > 0)
    .map((asset) => ({
      mint: asset.id,
      symbol: asset.content?.metadata?.symbol || 'UNKNOWN',
      name: asset.content?.metadata?.name || 'Unknown Token',
      balance: asset.token_info!.balance / Math.pow(10, asset.token_info!.decimals || 0),
      decimals: asset.token_info!.decimals || 0,
      image: asset.content?.links?.image,
    }));

  return tokens;
}

// Validate Solana address format
export function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58 encoded and 32-44 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}
