import pool from '../../lib/db';
import { AnalyticsIdentifier, BookmarksResponse, LikesResponse, SharesResponse, ViewsResponse } from './analytics.types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchClause(id: AnalyticsIdentifier, blogParam: number, visitorParam: number, ipParam: number): string {
  return id.visitorId
    ? `blog_id = $${blogParam} AND (visitor_id = $${visitorParam} OR ip_address = $${ipParam})`
    : `blog_id = $${blogParam} AND ip_address = $${ipParam}`;
}

function matchParams(blogId: string, id: AnalyticsIdentifier): (string)[] {
  return id.visitorId
    ? [blogId, id.visitorId, id.ipAddress]
    : [blogId, id.ipAddress];
}

// ── Views ─────────────────────────────────────────────────────────────────────

export async function recordView(blogId: string, id: AnalyticsIdentifier): Promise<ViewsResponse> {
  // Deduplicate: skip if same visitor or IP already viewed within 24 hours
  const dedupeClause = id.visitorId
    ? `blog_id = $1 AND (visitor_id = $2 OR ip_address = $3) AND created_at > NOW() - INTERVAL '24 hours'`
    : `blog_id = $1 AND ip_address = $2 AND created_at > NOW() - INTERVAL '24 hours'`;
  const dedupeParams = id.visitorId
    ? [blogId, id.visitorId, id.ipAddress]
    : [blogId, id.ipAddress];

  const existing = await pool.query(`SELECT id FROM blog_views WHERE ${dedupeClause} LIMIT 1`, dedupeParams);

  if (existing.rowCount && existing.rowCount > 0) {
    const count = await pool.query<{ views: string }>('SELECT views FROM blogs WHERE id = $1', [blogId]);
    return { views: Number(count.rows[0]?.views ?? 0), recorded: false };
  }

  await pool.query(
    'INSERT INTO blog_views (blog_id, visitor_id, ip_address) VALUES ($1, $2, $3)',
    [blogId, id.visitorId ?? null, id.ipAddress]
  );
  const updated = await pool.query<{ views: string }>(
    'UPDATE blogs SET views = views + 1 WHERE id = $1 RETURNING views',
    [blogId]
  );
  return { views: Number(updated.rows[0]?.views ?? 0), recorded: true };
}

export async function getViews(blogId: string): Promise<ViewsResponse> {
  const result = await pool.query<{ views: string }>('SELECT views FROM blogs WHERE id = $1', [blogId]);
  return { views: Number(result.rows[0]?.views ?? 0), recorded: false };
}

// ── Likes ─────────────────────────────────────────────────────────────────────

export async function toggleLike(blogId: string, id: AnalyticsIdentifier): Promise<LikesResponse> {
  const clause = matchClause(id, 1, 2, id.visitorId ? 3 : 2);
  const params = matchParams(blogId, id);

  const existing = await pool.query(`SELECT id FROM blog_likes WHERE ${clause} LIMIT 1`, params);
  let liked: boolean;

  if (existing.rowCount && existing.rowCount > 0) {
    await pool.query(`DELETE FROM blog_likes WHERE ${clause}`, params);
    await pool.query('UPDATE blogs SET likes = GREATEST(likes - 1, 0) WHERE id = $1', [blogId]);
    liked = false;
  } else {
    await pool.query(
      'INSERT INTO blog_likes (blog_id, visitor_id, ip_address) VALUES ($1, $2, $3)',
      [blogId, id.visitorId ?? null, id.ipAddress]
    );
    await pool.query('UPDATE blogs SET likes = likes + 1 WHERE id = $1', [blogId]);
    liked = true;
  }

  const count = await pool.query<{ likes: string }>('SELECT likes FROM blogs WHERE id = $1', [blogId]);
  return { liked, likes: Number(count.rows[0]?.likes ?? 0) };
}

export async function getLikes(blogId: string, id: AnalyticsIdentifier): Promise<LikesResponse> {
  const clause = matchClause(id, 1, 2, id.visitorId ? 3 : 2);
  const params = matchParams(blogId, id);

  const [likeRow, countRow] = await Promise.all([
    pool.query(`SELECT id FROM blog_likes WHERE ${clause} LIMIT 1`, params),
    pool.query<{ likes: string }>('SELECT likes FROM blogs WHERE id = $1', [blogId]),
  ]);

  return {
    liked: (likeRow.rowCount ?? 0) > 0,
    likes: Number(countRow.rows[0]?.likes ?? 0),
  };
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────

export async function toggleBookmark(blogId: string, id: AnalyticsIdentifier): Promise<BookmarksResponse> {
  const clause = matchClause(id, 1, 2, id.visitorId ? 3 : 2);
  const params = matchParams(blogId, id);

  const existing = await pool.query(`SELECT id FROM blog_bookmarks WHERE ${clause} LIMIT 1`, params);
  let bookmarked: boolean;

  if (existing.rowCount && existing.rowCount > 0) {
    await pool.query(`DELETE FROM blog_bookmarks WHERE ${clause}`, params);
    await pool.query('UPDATE blogs SET bookmarks = GREATEST(bookmarks - 1, 0) WHERE id = $1', [blogId]);
    bookmarked = false;
  } else {
    await pool.query(
      'INSERT INTO blog_bookmarks (blog_id, visitor_id, ip_address) VALUES ($1, $2, $3)',
      [blogId, id.visitorId ?? null, id.ipAddress]
    );
    await pool.query('UPDATE blogs SET bookmarks = bookmarks + 1 WHERE id = $1', [blogId]);
    bookmarked = true;
  }

  const count = await pool.query<{ bookmarks: string }>('SELECT bookmarks FROM blogs WHERE id = $1', [blogId]);
  return { bookmarked, bookmarks: Number(count.rows[0]?.bookmarks ?? 0) };
}

export async function getBookmarks(blogId: string, id: AnalyticsIdentifier): Promise<BookmarksResponse> {
  const clause = matchClause(id, 1, 2, id.visitorId ? 3 : 2);
  const params = matchParams(blogId, id);

  const [bookmarkRow, countRow] = await Promise.all([
    pool.query(`SELECT id FROM blog_bookmarks WHERE ${clause} LIMIT 1`, params),
    pool.query<{ bookmarks: string }>('SELECT bookmarks FROM blogs WHERE id = $1', [blogId]),
  ]);

  return {
    bookmarked: (bookmarkRow.rowCount ?? 0) > 0,
    bookmarks: Number(countRow.rows[0]?.bookmarks ?? 0),
  };
}

// ── Shares ────────────────────────────────────────────────────────────────────

export async function recordShare(blogId: string, id: AnalyticsIdentifier, platform?: string): Promise<SharesResponse> {
  await pool.query(
    'INSERT INTO blog_shares (blog_id, visitor_id, ip_address, platform) VALUES ($1, $2, $3, $4)',
    [blogId, id.visitorId ?? null, id.ipAddress, platform ?? null]
  );
  const count = await pool.query<{ count: string }>(
    'SELECT COUNT(*) FROM blog_shares WHERE blog_id = $1',
    [blogId]
  );
  return { shares: Number(count.rows[0]?.count ?? 0) };
}

export async function getShares(blogId: string): Promise<SharesResponse> {
  const count = await pool.query<{ count: string }>(
    'SELECT COUNT(*) FROM blog_shares WHERE blog_id = $1',
    [blogId]
  );
  return { shares: Number(count.rows[0]?.count ?? 0) };
}
