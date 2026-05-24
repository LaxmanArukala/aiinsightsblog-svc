export interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTestimonialDto {
  author: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating?: number;
}

export interface UpdateTestimonialDto {
  author?: string;
  role?: string;
  company?: string;
  avatar?: string;
  content?: string;
  rating?: number;
}

export interface TestimonialListQuery {
  page?: number;
  limit?: number;
  rating?: number;
}

export interface PaginatedTestimonials {
  data: Testimonial[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
