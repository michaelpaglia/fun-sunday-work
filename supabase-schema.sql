-- Supabase SQL schema for Solana Snake leaderboard
-- Run this in your Supabase SQL Editor

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  wallet_short TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  snake_count INTEGER NOT NULL DEFAULT 1,
  top_snake TEXT NOT NULL DEFAULT 'SOL',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster score lookups
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the leaderboard
CREATE POLICY "Anyone can read leaderboard" ON leaderboard
  FOR SELECT USING (true);

-- Allow anyone to insert scores (you can restrict this later)
CREATE POLICY "Anyone can submit scores" ON leaderboard
  FOR INSERT WITH CHECK (true);
