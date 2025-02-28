import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// import { redis } from '../config/redis';

export const generateAccessToken = (user: any) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined!');
  }

  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    }
  );
};

export const generateRefreshToken = async (user: any) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined!');
  }

  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  // await redis.set(
  //   `refresh_token:${user.id}`,
  //   refreshToken,
  //   'EX',
  //   60 * 60 * 24 * 7
  // );
  return refreshToken;
};

export const verifyRefreshToken = async (token: string) => {
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || '');
    // const storedToken = await redis.get(`refresh_token:${decoded.id}`);

    // if (!storedToken || storedToken !== token) {
    //   throw new Error('Invalid refresh token');
    // }

    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const invalidateRefreshToken = async (userId: string) => {
  // await redis.del(`refresh_token:${userId}`);
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
