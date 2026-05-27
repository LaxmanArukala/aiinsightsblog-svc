export interface Enquiries {
  general_enquiries_email: string;
  content_correction_email: string;
  response_time: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: Date;
}

export interface ContactWithEnquiries extends Contact {
  enquiries: Enquiries[];
}

export interface CreateContactDto {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactListQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedContacts {
  data: ContactWithEnquiries[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
