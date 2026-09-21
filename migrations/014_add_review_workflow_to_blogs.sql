-- Human approval workflow for AI-written articles.
--   status         published (live) | pending_review (new, awaiting approval) | rejected
--   quality_scores JSONB from the cron quality gate (SEO, quality, plagiarism, tone, active voice)
--   revision       JSONB rewrite of a LIVE article waiting for approval; the live copy stays untouched
-- Every existing row stays live via the 'published' default.
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS status         VARCHAR(20) NOT NULL DEFAULT 'published';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS quality_scores JSONB;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS revision       JSONB;
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs (status);
