import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { redis } from '../config/redis';

export const generateAccessToken = (user: any) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRES,
    }
  );
};

export const generateRefreshToken = async (user: any) => {
  const refreshToken = jwt.sign({ id: user.id }, env.JWT_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES,
  });

  await redis.set(
    `refresh_token:${user.id}`,
    refreshToken,
    'EX',
    60 * 60 * 24 * 7
  );
  return refreshToken;
};

export const verifyRefreshToken = async (token: string) => {
  try {
    const decoded: any = jwt.verify(token, env.JWT_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.id}`);

    if (!storedToken || storedToken !== token) {
      throw new Error('Invalid refresh token');
    }

    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const invalidateRefreshToken = async (userId: string) => {
  await redis.del(`refresh_token:${userId}`);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};
