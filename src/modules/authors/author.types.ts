export interface Author {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  education: string | null;
  specialization: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAuthorDto {
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  education?: string;
  specialization?: string;
}

export interface UpdateAuthorDto {
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  education?: string;
  specialization?: string;
}

export interface AuthorListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedAuthors {
  data: Author[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
