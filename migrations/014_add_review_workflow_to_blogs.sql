-- Human approval workflow for AI-written articles.
--   status              published (live) | pending_review (new, awaiting approval) | rejected
--   quality_scores      JSONB from the cron quality gate (SEO, quality, plagiarism, AI tone, active voice)
--   revision            JSONB rewrite of a LIVE article waiting for approval; the live copy stays untouched
--   rewritten           true once an approved rewrite is live — the flag to filter on in the admin
--   rewrite_reviewed_at set on approve OR reject, so a decided article is never queued for rewrite again
-- Every existing row stays live via the 'published' default.
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS status              VARCHAR(20)  NOT NULL DEFAULT 'published';
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS quality_scores      JSONB;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS revision            JSONB;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS rewritten           BOOLEAN      NOT NULL DEFAULT false;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS rewrite_reviewed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_blogs_status    ON blogs (status);
-- Serves the rewrite queue lookup (not rewritten, nothing pending, never decided).
CREATE INDEX IF NOT EXISTS idx_blogs_rewritten ON blogs (rewritten, rewrite_reviewed_at);

/*
 * Backfill for the 6 articles the 2026-09-22 00:00 UTC cron rewrote in place, before
 * this approval workflow existed. Their new content is already live and was never
 * reviewed, so mark them rewritten (they must not be queued a second time) and restore
 * the gate scores from that run's log so the admin shows what they actually scored.
 */
UPDATE blogs SET
  rewritten           = true,
  rewrite_reviewed_at = NOW(),
  quality_scores      = v.scores
FROM (VALUES
  ('43769fbf-6e67-43d9-a35d-c2b56819d3a9'::uuid, '{"scores":{"overall":94,"seo":93,"originality":98,"tone":96,"activeVoice":100},"minScore":85}'::jsonb),
  ('e5b9d539-4b93-4e64-9712-74ceb19c1443'::uuid, '{"scores":{"overall":93,"seo":93,"originality":99,"tone":88,"activeVoice":100},"minScore":85}'::jsonb),
  ('de534924-ea98-4365-bd7a-e87dc75bc45f'::uuid, '{"scores":{"overall":95,"seo":90,"originality":98,"tone":86,"activeVoice":100},"minScore":85}'::jsonb),
  ('0162c687-2776-4148-a0e1-99c2cd3bd3ab'::uuid, '{"scores":{"overall":97,"seo":93,"originality":96,"tone":86,"activeVoice":100},"minScore":85}'::jsonb),
  ('d1ae0256-041e-4f05-8d85-ca95eb2cefe0'::uuid, '{"scores":{"overall":98,"seo":90,"originality":98,"tone":85,"activeVoice":100},"minScore":85}'::jsonb),
  ('b25835a9-ff29-4568-9e44-615a37cab5d0'::uuid, '{"scores":{"overall":88,"seo":94,"originality":98,"tone":90,"activeVoice":100},"minScore":85}'::jsonb)
) AS v(id, scores)
WHERE blogs.id = v.id;
