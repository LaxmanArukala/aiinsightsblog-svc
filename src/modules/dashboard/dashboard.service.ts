import pool from '../../lib/db';
import { DashboardStats } from './dashboard.types';

export async function getDashboardStats(): Promise<DashboardStats> {
  const result = await pool.query<DashboardStats>(`
    SELECT
      (SELECT COUNT(*) FROM blogs)        AS blogs,
      (SELECT COUNT(*) FROM authors)      AS authors,
      (SELECT COUNT(*) FROM testimonials) AS testimonials,
      (SELECT COUNT(*) FROM reviews)      AS reviews,
      (SELECT COUNT(*) FROM comments)     AS comments,
      (SELECT COUNT(*) FROM contacts)     AS contacts,
      (SELECT COUNT(*) FROM subscribers)  AS subscribers
  `);

  const row = result.rows[0];
  return {
    blogs:        Number(row.blogs),
    authors:      Number(row.authors),
    testimonials: Number(row.testimonials),
    reviews:      Number(row.reviews),
    comments:     Number(row.comments),
    contacts:     Number(row.contacts),
    subscribers:  Number(row.subscribers),
  };
}
