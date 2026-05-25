export interface Author {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateAuthorDto {
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
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
