import pool from '../../lib/db';
import { Blog, BlogListQuery, BlogRevision, CreateBlogDto, PaginatedResponse, UpsertBlogDto } from './blog.types';

const SORT_MAP: Record<string, string> = {
  latest:      'published_at DESC',
  oldest:      'published_at ASC',
  most_liked:  'likes DESC',
  most_viewed: 'views DESC',
  top_rated:   'rating DESC',
  trending:    'trending DESC, views DESC',
};

export async function getBlogs(query: BlogListQuery): Promise<PaginatedResponse<Blog>> {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 10));
  const offset = (page - 1) * limit;
  const orderBy = SORT_MAP[query.sort || 'latest'];

  const conditions: string[] = [];
  const params: (string | number | boolean)[] = [];

  if (query.search) {
    params.push(`%${query.search}%`);
    conditions.push(`(title ILIKE $${params.length} OR excerpt ILIKE $${params.length})`);
  }

  if (query.featured !== undefined) {
    params.push(query.featured);
    conditions.push(`featured = $${params.length}`);
  }

  if (query.category) {
    params.push(query.category);
    conditions.push(`category->>'slug' = $${params.length}`);
  }

  if (query.category_name) {
    params.push(query.category_name);
    conditions.push(`category->>'name' ILIKE $${params.length}`);
  }

  if (query.review) {
    conditions.push(`(status = 'pending_review' OR revision IS NOT NULL)`);
  } else if (query.status !== 'all') {
    params.push(query.status ?? 'published');
    conditions.push(`status = $${params.length}`);
  }

  if (query.rewritten !== undefined) {
    params.push(query.rewritten);
    conditions.push(`rewritten = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(`SELECT COUNT(*) FROM blogs ${where}`, params);
  const total = Number.parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);

  const dataResult = await pool.query<Blog>(
    `SELECT * FROM blogs ${where}
     ORDER BY ${orderBy}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return {
    data: dataResult.rows,
    meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
  };
}

export async function getRelatedBlogs(categoryId: string, limit: number): Promise<Blog[]> {
  const result = await pool.query<Blog>(
    `SELECT * FROM blogs
     WHERE category->>'id' = $1 AND status = 'published'
     ORDER BY published_at DESC
     LIMIT $2`,
    [categoryId, limit]
  );
  return result.rows;
}

export async function getBlogById(id: string): Promise<Blog | null> {
  const result = await pool.query<Blog>('SELECT * FROM blogs WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export async function createBlog(dto: CreateBlogDto): Promise<Blog> {
  const result = await pool.query<Blog>(
    `INSERT INTO blogs
       (slug, title, excerpt, content, thumbnail, featured_image, category, tags, author,
        published_at, read_time, featured, trending, rating, review_count, status, quality_scores)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     RETURNING *`,
    [
      dto.slug,
      dto.title,
      dto.excerpt ?? null,
      dto.content ?? null,
      dto.thumbnail ?? null,
      dto.featured_image ?? null,
      dto.category ? JSON.stringify(dto.category) : null,
      JSON.stringify(dto.tags ?? []),
      dto.author ? JSON.stringify(dto.author) : null,
      dto.published_at ?? new Date(),
      dto.read_time ?? 0,
      dto.featured ?? false,
      dto.trending ?? false,
      dto.rating ?? 0,
      dto.review_count ?? 0,
      dto.status ?? 'published',
      dto.quality_scores ? JSON.stringify(dto.quality_scores) : null,
    ]
  );
  return result.rows[0];
}

export async function upsertBlog(id: string, dto: UpsertBlogDto): Promise<Blog> {
  const result = await pool.query<Blog>(
    `UPDATE blogs SET
       title          = $1,
       slug           = $2,
       excerpt        = $3,
       content        = $4,
       thumbnail      = $5,
       featured_image = $6,
       category       = $7,
       tags           = $8,
       author         = $9,
       read_time      = $10,
       featured       = $11,
       trending       = $12,
       rating         = $13,
       review_count   = $14,
       updated_at     = NOW()
     WHERE id = $15
     RETURNING *`,
    [
      dto.title,
      dto.slug,
      dto.excerpt ?? null,
      dto.content ?? null,
      dto.thumbnail ?? null,
      dto.featured_image ?? null,
      dto.category ? JSON.stringify(dto.category) : null,
      JSON.stringify(dto.tags ?? []),
      dto.author ? JSON.stringify(dto.author) : null,
      dto.read_time ?? 0,
      dto.featured ?? false,
      dto.trending ?? false,
      dto.rating ?? 0,
      dto.review_count ?? 0,
      id,
    ]
  );
  return result.rows[0];
}

export async function deleteBlog(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM blogs WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

/** Store a rewrite next to a live article without touching the live copy. */
export async function submitRevision(id: string, revision: Omit<BlogRevision, 'created_at'>): Promise<Blog | null> {
  const result = await pool.query<Blog>(
    `UPDATE blogs SET revision = $1 WHERE id = $2 AND status = 'published' RETURNING *`,
    [JSON.stringify({ ...revision, created_at: new Date().toISOString() }), id]
  );
  return result.rows[0] ?? null;
}

/**
 * Approve either a new article (goes live now) or a pending rewrite (replaces the live text).
 * Returns null when there is nothing waiting for approval.
 */
export async function approveBlog(id: string): Promise<Blog | null> {
  const result = await pool.query<Blog>(
    `UPDATE blogs SET
       content        = COALESCE(revision->>'content', content),
       excerpt        = CASE WHEN revision IS NULL THEN excerpt ELSE revision->>'excerpt' END,
       tags           = COALESCE(revision->'tags', tags),
       read_time      = COALESCE((revision->>'read_time')::int, read_time),
       quality_scores = COALESCE(revision->'quality_scores', quality_scores),
       published_at   = CASE WHEN status = 'pending_review' THEN NOW() ELSE published_at END,
       status         = 'published',
       -- A revision going live is a completed rewrite; a brand-new article is not.
       rewritten           = CASE WHEN revision IS NOT NULL THEN true ELSE rewritten END,
       rewrite_reviewed_at = CASE WHEN revision IS NOT NULL THEN NOW() ELSE rewrite_reviewed_at END,
       revision       = NULL,
       updated_at     = NOW()
     WHERE id = $1 AND (status = 'pending_review' OR revision IS NOT NULL)
     RETURNING *`,
    [id]
  );
  return result.rows[0] ?? null;
}

/** Reject a new article, or discard a pending rewrite and keep the live text. */
export async function rejectBlog(id: string): Promise<Blog | null> {
  const result = await pool.query<Blog>(
    `UPDATE blogs SET
       status     = CASE WHEN status = 'pending_review' THEN 'rejected' ELSE status END,
       -- Rejecting a rewrite keeps the live text and takes the article out of the queue.
       rewrite_reviewed_at = CASE WHEN revision IS NOT NULL THEN NOW() ELSE rewrite_reviewed_at END,
       revision   = NULL,
       updated_at = NOW()
     WHERE id = $1 AND (status = 'pending_review' OR revision IS NOT NULL)
     RETURNING *`,
    [id]
  );
  return result.rows[0] ?? null;
}
