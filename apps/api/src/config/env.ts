import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/saas_db?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().min(16).default('development_jwt_access_secret_32_chars_long'),
  JWT_REFRESH_SECRET: z.string().min(16).default('development_jwt_refresh_secret_32_chars_long'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(16).default('development_cookie_secret_32_chars_long'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  GEMINI_API_KEY: z.string().optional().default(''),
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  // In production we fail hard on bad env, in dev we show error
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const env = parsedEnv.success ? parsedEnv.data : (process.env as unknown as z.infer<typeof envSchema>);
