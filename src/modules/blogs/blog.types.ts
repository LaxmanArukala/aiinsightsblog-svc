export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
}

export interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  thumbnail: string | null;
  featured_image: string | null;
  category: Category | null;
  tags: Tag[];
  author: Author | null;
  published_at: Date;
  read_time: number;
  views: number;
  likes: number;
  bookmarks: number;
  featured: boolean;
  trending: boolean;
  rating: number;
  review_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBlogDto {
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  thumbnail?: string;
  featured_image?: string;
  category?: Category;
  tags?: Tag[];
  author?: Author;
  published_at?: string;
  read_time?: number;
  featured?: boolean;
  trending?: boolean;
  rating?: number;
  review_count?: number;
}

export interface UpsertBlogDto extends CreateBlogDto {}

export interface BlogListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'latest' | 'oldest' | 'most_liked' | 'most_viewed' | 'top_rated' | 'trending';
  featured?: boolean;
  category?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
