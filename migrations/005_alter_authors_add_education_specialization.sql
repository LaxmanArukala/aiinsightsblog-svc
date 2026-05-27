ALTER TABLE authors
  ADD COLUMN IF NOT EXISTS education      TEXT,
  ADD COLUMN IF NOT EXISTS specialization TEXT;
