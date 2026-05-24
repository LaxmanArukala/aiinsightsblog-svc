CREATE TABLE IF NOT EXISTS testimonials (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  author     VARCHAR(100) NOT NULL,
  role       VARCHAR(100) NOT NULL,
  company    VARCHAR(100) NOT NULL,
  avatar     TEXT         NOT NULL,
  content    TEXT         NOT NULL,
  rating     SMALLINT     NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials (rating DESC);
