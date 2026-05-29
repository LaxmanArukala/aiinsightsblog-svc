CREATE TABLE IF NOT EXISTS reviews (
  review_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id    UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  rating     SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT        NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_blog_id ON reviews(blog_id);
