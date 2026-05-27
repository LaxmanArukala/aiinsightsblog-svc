export interface Category {
  id: string;
  name: string;
  color: string;
  blog_count: number;
  created_at: string;
}

export interface CreateCategoryDto {
  name: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  color?: string;
  blog_count?: number;
}

export interface CategoryListQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedCategories {
  data: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
