import { NextRequest, NextResponse } from 'next/server';
import { supabase, LeaderboardEntry } from '@/lib/supabase';

// GET - Fetch top scores
export async function GET() {
  if (!supabase) {
    return NextResponse.json({ entries: [], error: 'Leaderboard not configured' });
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    return NextResponse.json({ entries: data || [] });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Submit a score
export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Leaderboard not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { wallet_address, score, snake_count, top_snake } = body;

    if (!wallet_address || typeof score !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const entry: LeaderboardEntry = {
      wallet_address,
      wallet_short: `${wallet_address.slice(0, 4)}...${wallet_address.slice(-4)}`,
      score,
      snake_count: snake_count || 1,
      top_snake: top_snake || 'SOL',
    };

    const { data, error } = await supabase
      .from('leaderboard')
      .insert([entry])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 });
    }

    return NextResponse.json({ entry: data });
  } catch (error) {
    console.error('Score submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
