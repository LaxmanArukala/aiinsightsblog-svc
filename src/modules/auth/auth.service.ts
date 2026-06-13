import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../lib/db';
import { config } from '../../config';
import { AuthTokens, TokenPayload, User } from './auth.types';

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] ?? null;
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

function msFromExpiry(expiry: string): number {
  const units: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 86_400_000;
  return Number(match[1]) * (units[match[2]] ?? 86_400_000);
}

export function generateTokens(user: User): AuthTokens {
  const payload: TokenPayload = {
    userId: user.id,
    user_email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'],
  });

  return { accessToken, refreshToken };
}

export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date(Date.now() + msFromExpiry(config.jwtRefreshExpiresIn));
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );
}

export async function rotateRefreshToken(
  oldToken: string
): Promise<{ user: User; tokens: AuthTokens } | null> {
  const row = await pool.query<{ user_id: string; expires_at: Date }>(
    'DELETE FROM refresh_tokens WHERE token = $1 RETURNING user_id, expires_at',
    [oldToken]
  );
  if (!row.rows[0]) return null;

  const { user_id, expires_at } = row.rows[0];
  if (new Date() > expires_at) return null;

  const userResult = await pool.query<User>('SELECT * FROM users WHERE id = $1', [user_id]);
  const user = userResult.rows[0];
  if (!user) return null;

  // Verify signature as a second check
  jwt.verify(oldToken, config.jwtRefreshSecret);

  const tokens = generateTokens(user);
  await storeRefreshToken(user.id, tokens.refreshToken);
  return { user, tokens };
}

export async function revokeRefreshToken(token: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
  return (result.rowCount ?? 0) > 0;
}
