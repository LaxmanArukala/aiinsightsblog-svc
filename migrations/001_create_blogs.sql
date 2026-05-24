CREATE TABLE IF NOT EXISTS blogs (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           VARCHAR(255) NOT NULL UNIQUE,
  title          VARCHAR(255) NOT NULL,
  excerpt        TEXT,
  content        TEXT,
  thumbnail      TEXT,
  featured_image TEXT,
  category       JSONB,
  tags           JSONB        NOT NULL DEFAULT '[]',
  author         JSONB,
  published_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  read_time      INT          NOT NULL DEFAULT 0,
  views          INT          NOT NULL DEFAULT 0,
  likes          INT          NOT NULL DEFAULT 0,
  bookmarks      INT          NOT NULL DEFAULT 0,
  featured       BOOLEAN      NOT NULL DEFAULT false,
  trending       BOOLEAN      NOT NULL DEFAULT false,
  rating         NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count   INT          NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug      ON blogs (slug);
CREATE INDEX IF NOT EXISTS idx_blogs_featured  ON blogs (featured);
CREATE INDEX IF NOT EXISTS idx_blogs_trending  ON blogs (trending);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs (published_at DESC);
