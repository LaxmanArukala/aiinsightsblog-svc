export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  user_email: string;
  role: string;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}
