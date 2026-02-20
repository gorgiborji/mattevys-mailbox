-- Add priority and expiration date columns to ideas table
-- Run this in Supabase SQL Editor or via supabase db push

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal'
    CHECK (priority IN ('normal', 'urgent')),
  ADD COLUMN IF NOT EXISTS expires_at DATE;

-- Index for the daily expiry reminder cron query
CREATE INDEX IF NOT EXISTS idx_ideas_expires_at
  ON ideas (expires_at)
  WHERE expires_at IS NOT NULL AND done = false AND (deleted IS NULL OR deleted = false);

-- Optional: comment for documentation
COMMENT ON COLUMN ideas.priority IS 'normal or urgent — urgent triggers immediate SMS notification';
COMMENT ON COLUMN ideas.expires_at IS 'Optional expiration date (DATE, no time). Null = never expires.';
