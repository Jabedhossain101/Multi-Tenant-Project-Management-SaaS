import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/saas_db?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().min(16).default('development_jwt_access_secret_32_chars_long'),
  JWT_REFRESH_SECRET: z.string().min(16).default('development_jwt_refresh_secret_32_chars_long'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(16).default('development_cookie_secret_32_chars_long'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // AI & Gemini
  GEMINI_API_KEY: z.string().optional().default(''),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
  STRIPE_PRICE_PRO_MONTHLY: z.string().optional().default('price_pro_monthly'),
  STRIPE_PRICE_PRO_YEARLY: z.string().optional().default('price_pro_yearly'),
  STRIPE_PRICE_BUSINESS_MONTHLY: z.string().optional().default('price_biz_monthly'),
  STRIPE_PRICE_BUSINESS_YEARLY: z.string().optional().default('price_biz_yearly'),

  // S3-Compatible Object Storage
  S3_ENDPOINT: z.string().optional().default('http://localhost:9000'),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY: z.string().default('minioadmin'),
  S3_SECRET_KEY: z.string().default('minioadmin'),
  S3_BUCKET: z.string().default('saas-storage'),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),

  // Super Admin
  SUPER_ADMIN_EMAIL: z.string().email().default('superadmin@tasksaas.local'),
  SUPER_ADMIN_PASSWORD: z.string().default('AdminSecurePassword123!'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment configuration:', parsedEnv.error.format());
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const env = parsedEnv.success ? parsedEnv.data : (process.env as unknown as z.infer<typeof envSchema>);
