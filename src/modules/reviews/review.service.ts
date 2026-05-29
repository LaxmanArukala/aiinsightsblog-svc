import pool from '../../lib/db';
import type { CreateReviewDto, Review, ReviewQueryParams, UpdateReviewDto } from './review.types';

export async function getReviewsByBlogId(
  blogId: string,
  params: ReviewQueryParams,
): Promise<{ data: Review[]; total: number }> {
  const page  = Math.max(1, params.page  ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 10));
  const offset = (page - 1) * limit;

  const conditions: string[] = ['blog_id = $1'];
  const values: unknown[]    = [blogId];

  if (params.rating) {
    conditions.push(`rating = $${values.push(params.rating)}`);
  }

  const where = conditions.join(' AND ');

  const [rows, count] = await Promise.all([
    pool.query<Review>(
      `SELECT * FROM reviews WHERE ${where} ORDER BY created_at DESC LIMIT $${values.push(limit)} OFFSET $${values.push(offset)}`,
      values,
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM reviews WHERE ${where}`,
      values.slice(0, values.length - 2),
    ),
  ]);

  return { data: rows.rows, total: Number.parseInt(count.rows[0].count, 10) };
}

export async function getReviewById(reviewId: string, blogId: string): Promise<Review | null> {
  const result = await pool.query<Review>(
    'SELECT * FROM reviews WHERE review_id = $1 AND blog_id = $2',
    [reviewId, blogId],
  );
  return result.rows[0] ?? null;
}

export async function createReview(blogId: string, dto: CreateReviewDto): Promise<Review> {
  const result = await pool.query<Review>(
    `INSERT INTO reviews (blog_id, name, email, rating, review_text)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [blogId, dto.name, dto.email, dto.rating, dto.review_text],
  );
  return result.rows[0];
}

export async function updateReview(
  reviewId: string,
  blogId: string,
  dto: UpdateReviewDto,
): Promise<Review | null> {
  const fields: string[]  = [];
  const values: unknown[] = [];

  if (dto.name        !== undefined) fields.push(`name = $${values.push(dto.name)}`);
  if (dto.email       !== undefined) fields.push(`email = $${values.push(dto.email)}`);
  if (dto.rating      !== undefined) fields.push(`rating = $${values.push(dto.rating)}`);
  if (dto.review_text !== undefined) fields.push(`review_text = $${values.push(dto.review_text)}`);

  if (fields.length === 0) return getReviewById(reviewId, blogId);

  fields.push(`updated_at = NOW()`);
  values.push(reviewId, blogId);

  const result = await pool.query<Review>(
    `UPDATE reviews SET ${fields.join(', ')}
     WHERE review_id = $${values.length - 1} AND blog_id = $${values.length}
     RETURNING *`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function deleteReview(reviewId: string, blogId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM reviews WHERE review_id = $1 AND blog_id = $2',
    [reviewId, blogId],
  );
  return (result.rowCount ?? 0) > 0;
}
