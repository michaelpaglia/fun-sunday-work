import { NextRequest, NextResponse } from 'next/server';
import { getTokenPrices } from '@/lib/jupiter';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mints = searchParams.get('mints');

  if (!mints) {
    return NextResponse.json(
      { error: 'Token mints are required' },
      { status: 400 }
    );
  }

  const mintArray = mints.split(',').filter(Boolean);

  if (mintArray.length === 0) {
    return NextResponse.json(
      { error: 'At least one token mint is required' },
      { status: 400 }
    );
  }

  try {
    const prices = await getTokenPrices(mintArray);
    return NextResponse.json({ prices });
  } catch (error) {
    console.error('Error fetching token prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token prices' },
      { status: 500 }
    );
  }
}
