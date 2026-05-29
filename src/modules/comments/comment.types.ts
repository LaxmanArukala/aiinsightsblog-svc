export interface Comment {
  comment_id:   string;
  blog_id:      string;
  name:         string;
  comment_text: string;
  created_at:   Date;
  updated_at:   Date;
}

export interface CreateCommentDto {
  name:         string;
  comment_text: string;
}

export interface UpdateCommentDto {
  name?:         string;
  comment_text?: string;
}

export interface CommentQueryParams {
  page?:  number;
  limit?: number;
}
