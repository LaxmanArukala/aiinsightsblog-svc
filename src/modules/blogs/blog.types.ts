export interface Category {
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

export type BlogStatus = 'published' | 'pending_review' | 'rejected';

/** Written by the article cron; shown to the reviewer in the admin. */
export interface QualityScores {
  scores: { overall: number; seo: number; originality: number; tone: number; activeVoice: number };
  minScore: number;
  detail?: Record<string, unknown>;
}

/** A rewrite of a live article, held until an admin approves it. */
export interface BlogRevision {
  content: string;
  excerpt: string | null;
  tags: string[];
  read_time: number;
  quality_scores: QualityScores | null;
  created_at: string;
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
  tags: string[];
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
  status: BlogStatus;
  quality_scores: QualityScores | null;
  revision: BlogRevision | null;
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
  tags?: string[];
  author?: Author;
  published_at?: string;
  read_time?: number;
  featured?: boolean;
  trending?: boolean;
  rating?: number;
  review_count?: number;
  status?: BlogStatus;
  quality_scores?: QualityScores;
}

export interface UpsertBlogDto extends CreateBlogDto {}

export interface BlogListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'latest' | 'oldest' | 'most_liked' | 'most_viewed' | 'top_rated' | 'trending';
  featured?: boolean;
  category?: string;
  category_name?: string;
  /** Defaults to 'published' so drafts never reach the public site. 'all' disables the filter. */
  status?: BlogStatus | 'all';
  /** Admin approval queue: pending new articles plus live articles with a pending rewrite. */
  review?: boolean;
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
