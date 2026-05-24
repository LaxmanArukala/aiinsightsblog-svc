import pool from '../../lib/db';
import {
  CreateTestimonialDto,
  PaginatedTestimonials,
  Testimonial,
  TestimonialListQuery,
  UpdateTestimonialDto,
} from './testimonial.types';

export async function getTestimonials(query: TestimonialListQuery): Promise<PaginatedTestimonials> {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 10));
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: (number)[] = [];

  if (query.rating !== undefined) {
    params.push(query.rating);
    conditions.push(`rating = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM testimonials ${where}`,
    params
  );
  const total = Number.parseInt(countResult.rows[0].count, 10);

  params.push(limit as number, offset as number);

  const dataResult = await pool.query<Testimonial>(
    `SELECT * FROM testimonials ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return {
    data: dataResult.rows,
    meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
  };
}

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const result = await pool.query<Testimonial>(
    'SELECT * FROM testimonials WHERE id = $1',
    [id]
  );
  return result.rows[0] ?? null;
}

export async function createTestimonial(dto: CreateTestimonialDto): Promise<Testimonial> {
  const result = await pool.query<Testimonial>(
    `INSERT INTO testimonials (author, role, company, avatar, content, rating)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [dto.author, dto.role, dto.company, dto.avatar, dto.content, dto.rating ?? 5]
  );
  return result.rows[0];
}

export async function updateTestimonial(
  id: string,
  dto: UpdateTestimonialDto
): Promise<Testimonial | null> {
  const fields = Object.entries(dto).filter(([, v]) => v !== undefined);
  if (fields.length === 0) return getTestimonialById(id);

  const setClause = fields.map(([key], i) => `${key} = $${i + 1}`).join(', ');
  const values = fields.map(([, v]) => v);

  const result = await pool.query<Testimonial>(
    `UPDATE testimonials SET ${setClause}, updated_at = NOW()
     WHERE id = $${fields.length + 1}
     RETURNING *`,
    [...values, id]
  );
  return result.rows[0] ?? null;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM testimonials WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}
