CREATE TABLE IF NOT EXISTS comments (
  comment_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id      UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  comment_text TEXT         NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_blog_id ON comments(blog_id);
