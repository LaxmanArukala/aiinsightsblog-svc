import { Request, Response } from 'express';
import * as authService from './auth.service';
import { LoginDto } from './auth.types';
import { errorResponse, successResponse } from '../../lib/response';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password }: LoginDto = req.body;

    if (!email || !password) {
      res.status(400).json(errorResponse('Validation failed', ['email and password are required']));
      return;
    }

    const user = await authService.findUserByEmail(email);
    if (!user) {
      res.status(401).json(errorResponse('Invalid credentials'));
      return;
    }

    const valid = await authService.verifyPassword(password, user.password_hash);
    if (!valid) {
      res.status(401).json(errorResponse('Invalid credentials'));
      return;
    }

    const tokens = authService.generateTokens(user);
    await authService.storeRefreshToken(user.id, tokens.refreshToken);

    res.json(successResponse(tokens, 'Login successful'));
  } catch (err) {
    res.status(500).json(errorResponse('Login failed', [(err as Error).message]));
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json(errorResponse('Validation failed', ['refreshToken is required']));
      return;
    }

    const result = await authService.rotateRefreshToken(refreshToken);
    if (!result) {
      res.status(401).json(errorResponse('Invalid or expired refresh token'));
      return;
    }

    res.json(successResponse(result.tokens, 'Tokens refreshed successfully'));
  } catch (err) {
    res.status(401).json(errorResponse('Invalid or expired refresh token'));
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json(errorResponse('Validation failed', ['refreshToken is required']));
      return;
    }

    await authService.revokeRefreshToken(refreshToken);
    res.json(successResponse(null, 'Logged out successfully'));
  } catch (err) {
    res.status(500).json(errorResponse('Logout failed', [(err as Error).message]));
  }
}
