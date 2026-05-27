import pool from '../../lib/db';
import {
  Contact,
  ContactListQuery,
  ContactWithEnquiries,
  CreateContactDto,
  Enquiries,
  PaginatedContacts,
} from './contact.types';

const ENQUIRIES: Enquiries[] = [
  { general_enquiries_email:  'hello@aiinsightsblogs.com',   content_correction_email: '', response_time: '' },
  { general_enquiries_email:  '',                            content_correction_email: 'corrections@aiinsightsblogs.com', response_time: '' },
  { general_enquiries_email:  '',                            content_correction_email: '', response_time: 'Within 24–48 hours on business days' },
];

function attachEnquiries(contact: Contact): ContactWithEnquiries {
  return { ...contact, enquiries: ENQUIRIES };
}

export async function getContacts(query: ContactListQuery): Promise<PaginatedContacts> {
  const page   = Math.max(1, query.page  || 1);
  const limit  = Math.min(100, Math.max(1, query.limit || 10));
  const offset = (page - 1) * limit;

  const countResult = await pool.query('SELECT COUNT(*) FROM contacts');
  const total       = Number.parseInt(countResult.rows[0].count, 10);

  const dataResult  = await pool.query<Contact>(
    'SELECT * FROM contacts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  return {
    data: dataResult.rows.map(attachEnquiries),
    meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
  };
}

export async function getContactById(id: string): Promise<ContactWithEnquiries | null> {
  const result = await pool.query<Contact>('SELECT * FROM contacts WHERE id = $1', [id]);
  if (!result.rows[0]) return null;
  return attachEnquiries(result.rows[0]);
}

export async function createContact(dto: CreateContactDto): Promise<ContactWithEnquiries> {
  const result = await pool.query<Contact>(
    `INSERT INTO contacts (name, email, subject, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [dto.name, dto.email, dto.subject, dto.message]
  );
  return attachEnquiries(result.rows[0]);
}

export async function deleteContact(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM contacts WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
