import pool from '../../lib/db';
import {
  CreateSubscriberDto,
  PaginatedSubscribers,
  Subscriber,
  SubscriberListQuery,
  UpdateSubscriberDto,
} from './subscriber.types';

export async function getSubscribers(query: SubscriberListQuery): Promise<PaginatedSubscribers> {
  const page   = Math.max(1, query.page  || 1);
  const limit  = Math.min(100, Math.max(1, query.limit || 10));
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (query.status) {
    params.push(query.status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(`SELECT COUNT(*) FROM subscribers ${where}`, params);
  const total = Number.parseInt(countResult.rows[0].count, 10);

  params.push(limit, offset);

  const dataResult = await pool.query<Subscriber>(
    `SELECT * FROM subscribers ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return {
    data: dataResult.rows,
    meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
  };
}

export async function getSubscriberById(id: string): Promise<Subscriber | null> {
  const result = await pool.query<Subscriber>('SELECT * FROM subscribers WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export async function createSubscriber(dto: CreateSubscriberDto): Promise<Subscriber> {
  const result = await pool.query<Subscriber>(
    `INSERT INTO subscribers (email, name)
     VALUES ($1, $2)
     RETURNING *`,
    [dto.email, dto.name ?? null]
  );
  return result.rows[0];
}

export async function updateSubscriber(id: string, dto: UpdateSubscriberDto): Promise<Subscriber | null> {
  const fields = Object.entries(dto).filter(([, v]) => v !== undefined);
  if (fields.length === 0) return getSubscriberById(id);

  const setClause = fields.map(([key], i) => `${key} = $${i + 1}`).join(', ');
  const values    = fields.map(([, v]) => v);

  const result = await pool.query<Subscriber>(
    `UPDATE subscribers SET ${setClause}, updated_at = NOW()
     WHERE id = $${fields.length + 1}
     RETURNING *`,
    [...values, id]
  );
  return result.rows[0] ?? null;
}

export async function deleteSubscriber(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM subscribers WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
