import { Router } from 'express';
import * as authController from './auth.controller';

const router = Router();

// POST /api/v1/auth/login   — email + password → { accessToken, refreshToken }
router.post('/login', authController.login);

// POST /api/v1/auth/refresh — refreshToken → { accessToken, refreshToken }
router.post('/refresh', authController.refresh);

// POST /api/v1/auth/logout  — refreshToken → revoke
router.post('/logout', authController.logout);

export default router;
