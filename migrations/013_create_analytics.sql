CREATE TABLE IF NOT EXISTS blog_views (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id     UUID        NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  visitor_id  VARCHAR(64),
  ip_address  VARCHAR(45) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_likes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id     UUID        NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  visitor_id  VARCHAR(64),
  ip_address  VARCHAR(45) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_bookmarks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id     UUID        NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  visitor_id  VARCHAR(64),
  ip_address  VARCHAR(45) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_shares (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id     UUID        NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  visitor_id  VARCHAR(64),
  ip_address  VARCHAR(45) NOT NULL,
  platform    VARCHAR(50),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_views_blog_id        ON blog_views(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_visitor        ON blog_views(blog_id, visitor_id, created_at) WHERE visitor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_views_ip             ON blog_views(blog_id, ip_address, created_at);

CREATE INDEX IF NOT EXISTS idx_blog_likes_blog_id        ON blog_likes(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_visitor        ON blog_likes(blog_id, visitor_id) WHERE visitor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_likes_ip             ON blog_likes(blog_id, ip_address);

CREATE INDEX IF NOT EXISTS idx_blog_bookmarks_blog_id    ON blog_bookmarks(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_bookmarks_visitor    ON blog_bookmarks(blog_id, visitor_id) WHERE visitor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_bookmarks_ip         ON blog_bookmarks(blog_id, ip_address);

CREATE INDEX IF NOT EXISTS idx_blog_shares_blog_id       ON blog_shares(blog_id);
