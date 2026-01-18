import { NextRequest, NextResponse } from 'next/server';
import { getWalletTokens, isValidSolanaAddress } from '@/lib/helius';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Wallet address is required' },
      { status: 400 }
    );
  }

  if (!isValidSolanaAddress(address)) {
    return NextResponse.json(
      { error: 'Invalid Solana address format' },
      { status: 400 }
    );
  }

  try {
    const tokens = await getWalletTokens(address);
    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('Error fetching wallet tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet tokens' },
      { status: 500 }
    );
  }
}
