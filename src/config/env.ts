import dotenv from 'dotenv';
import ms from 'ms';
import { z } from 'zod';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const parseMs = (val: unknown) => {
  if (typeof val !== 'string') {
    throw new Error("Expiration time must be a string (e.g., '15m', '7d')");
  }
  const result = ms(val as ms.StringValue);
  if (typeof result !== 'number') {
    throw new Error(`Invalid expiration format: ${val}`);
  }
  return result / 1000;
};

const envSchema = z.object({
  PORT: z.string(),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z
    .string()
    .min(8, 'JWT_SECRET é obrigatório e deve ter pelo menos 8 caracteres'),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.preprocess((val) => Number(val), z.number()),
  ACCESS_TOKEN_EXPIRES: z.preprocess(parseMs, z.number()),
  REFRESH_TOKEN_EXPIRES: z.preprocess(parseMs, z.number()),
});

export const env = envSchema.parse(process.env);
