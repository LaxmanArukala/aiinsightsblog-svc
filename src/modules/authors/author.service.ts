import pool from '../../lib/db';
import { Author, AuthorListQuery, CreateAuthorDto, PaginatedAuthors, UpdateAuthorDto } from './author.types';

export async function getAuthors(query: AuthorListQuery): Promise<PaginatedAuthors> {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 10));
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (query.search) {
    params.push(`%${query.search}%`);
    conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(`SELECT COUNT(*) FROM authors ${where}`, params);
  const total = Number.parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);

  const dataResult = await pool.query<Author>(
    `SELECT * FROM authors ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return {
    data: dataResult.rows,
    meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
  };
}

export async function createAuthor(dto: CreateAuthorDto): Promise<Author> {
  const result = await pool.query<Author>(
    `INSERT INTO authors (name, email, avatar, bio, education, specialization)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [dto.name, dto.email, dto.avatar ?? null, dto.bio ?? null, dto.education ?? null, dto.specialization ?? null]
  );
  return result.rows[0];
}

export async function getAuthorById(id: string): Promise<Author | null> {
  const result = await pool.query<Author>('SELECT * FROM authors WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export async function updateAuthor(id: string, dto: UpdateAuthorDto): Promise<Author | null> {
  const fields = Object.entries(dto).filter(([, v]) => v !== undefined);
  if (fields.length === 0) return getAuthorById(id);

  const setClause = fields.map(([key], i) => `${key} = $${i + 1}`).join(', ');
  const values = fields.map(([, v]) => v);

  const result = await pool.query<Author>(
    `UPDATE authors SET ${setClause}, updated_at = NOW()
     WHERE id = $${fields.length + 1}
     RETURNING *`,
    [...values, id]
  );
  return result.rows[0] ?? null;
}

export async function deleteAuthor(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM authors WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
