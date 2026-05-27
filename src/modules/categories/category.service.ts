import pool from '../../lib/db';
import {
  Category,
  CategoryListQuery,
  CreateCategoryDto,
  PaginatedCategories,
  UpdateCategoryDto,
} from './category.types';

export async function getCategories(query: CategoryListQuery): Promise<PaginatedCategories> {
  const page   = Math.max(1, query.page  || 1);
  const limit  = Math.min(100, Math.max(1, query.limit || 10));
  const offset = (page - 1) * limit;

  const countResult = await pool.query('SELECT COUNT(*) FROM categories');
  const total       = Number.parseInt(countResult.rows[0].count, 10);

  const dataResult  = await pool.query<Category>(
    'SELECT * FROM categories ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  return {
    data: dataResult.rows,
    meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
  };
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const result = await pool.query<Category>('SELECT * FROM categories WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export async function createCategory(dto: CreateCategoryDto): Promise<Category> {
  const result = await pool.query<Category>(
    `INSERT INTO categories (name, color)
     VALUES ($1, $2)
     RETURNING *`,
    [dto.name, dto.color ?? '#000000']
  );
  return result.rows[0];
}

export async function updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category | null> {
  const fields = Object.entries(dto).filter(([, v]) => v !== undefined);
  if (fields.length === 0) return getCategoryById(id);

  const setClause = fields.map(([key], i) => `${key} = $${i + 1}`).join(', ');
  const values    = fields.map(([, v]) => v);

  const result = await pool.query<Category>(
    `UPDATE categories SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
    [...values, id]
  );
  return result.rows[0] ?? null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
