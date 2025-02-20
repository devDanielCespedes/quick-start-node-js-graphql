import { logger } from '@config/logger';
import { redis } from '../config/redis';

export const cacheMiddleware = async (
  key: string,
  resolver: () => Promise<any>
) => {
  const cachedData = await redis.get(key);
  if (cachedData) {
    logger.info(`✅ Using cached data for ${key}`);
    return JSON.parse(cachedData);
  }

  const result = await resolver();

  await redis.set(key, JSON.stringify(result), 'EX', 60);
  logger.info(`🚀 Caching data for ${key}`);

  return result;
};
