import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number.parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(','),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://laxmanarukala:1234@localhost:5432/ai_insights_dev',
  groqApiKey: process.env.GROQ_API_KEY || '',
};
