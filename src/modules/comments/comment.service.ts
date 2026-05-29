import pool from '../../lib/db';
import type { Comment, CommentQueryParams, CreateCommentDto, UpdateCommentDto } from './comment.types';

export async function getCommentsByBlogId(
  blogId: string,
  params: CommentQueryParams,
): Promise<{ data: Comment[]; total: number }> {
  const page   = Math.max(1, params.page  ?? 1);
  const limit  = Math.min(100, Math.max(1, params.limit ?? 10));
  const offset = (page - 1) * limit;

  const [rows, count] = await Promise.all([
    pool.query<Comment>(
      'SELECT * FROM comments WHERE blog_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [blogId, limit, offset],
    ),
    pool.query<{ count: string }>(
      'SELECT COUNT(*) FROM comments WHERE blog_id = $1',
      [blogId],
    ),
  ]);

  return { data: rows.rows, total: Number.parseInt(count.rows[0].count, 10) };
}

export async function getCommentById(commentId: string, blogId: string): Promise<Comment | null> {
  const result = await pool.query<Comment>(
    'SELECT * FROM comments WHERE comment_id = $1 AND blog_id = $2',
    [commentId, blogId],
  );
  return result.rows[0] ?? null;
}

export async function createComment(blogId: string, dto: CreateCommentDto): Promise<Comment> {
  const result = await pool.query<Comment>(
    `INSERT INTO comments (blog_id, name, comment_text)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [blogId, dto.name, dto.comment_text],
  );
  return result.rows[0];
}

export async function updateComment(
  commentId: string,
  blogId: string,
  dto: UpdateCommentDto,
): Promise<Comment | null> {
  const fields: string[]  = [];
  const values: unknown[] = [];

  if (dto.name         !== undefined) fields.push(`name = $${values.push(dto.name)}`);
  if (dto.comment_text !== undefined) fields.push(`comment_text = $${values.push(dto.comment_text)}`);

  if (fields.length === 0) return getCommentById(commentId, blogId);

  fields.push(`updated_at = NOW()`);
  values.push(commentId, blogId);

  const result = await pool.query<Comment>(
    `UPDATE comments SET ${fields.join(', ')}
     WHERE comment_id = $${values.length - 1} AND blog_id = $${values.length}
     RETURNING *`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function deleteComment(commentId: string, blogId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM comments WHERE comment_id = $1 AND blog_id = $2',
    [commentId, blogId],
  );
  return (result.rowCount ?? 0) > 0;
}
