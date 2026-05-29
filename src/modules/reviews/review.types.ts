export interface Review {
  review_id:   string;
  blog_id:     string;
  name:        string;
  email:       string;
  rating:      number;
  review_text: string;
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
}

export interface ReviewQueryParams {
  page?:   number;
  limit?:  number;
  rating?: number;
}
