export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  review_id:   string;
  blog_id:     string;
  name:        string;
  email:       string;
  rating:      number;
  review_text: string;
  status:      ReviewStatus;
  created_at:  Date;
  updated_at:  Date;
}

export interface CreateReviewDto {
  name:        string;
  email:       string;
  rating:      number;
  review_text: string;
}

export interface UpdateReviewDto {
  name?:        string;
  email?:       string;
  rating?:      number;
  review_text?: string;
  status?:      ReviewStatus;
}

export interface ReviewQueryParams {
  page?:   number;
  limit?:  number;
  rating?: number;
  status?: ReviewStatus;
}
