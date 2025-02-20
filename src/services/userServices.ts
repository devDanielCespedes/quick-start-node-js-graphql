import { GraphQLError } from 'graphql/error';
import { prisma } from '../config/prisma';
import { redis } from '../config/redis';
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  invalidateRefreshToken,
  verifyRefreshToken,
} from './authService';

/**
 * Get all users (with caching)
 */
export const getAllUsers = async () => {
  return redis.get('getAllUsers').then(async (cachedData) => {
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const users = await prisma.user.findMany();
    await redis.set('getAllUsers', JSON.stringify(users), 'EX', 120);
    return users;
  });
};

/**
 * Create a new user
 */
export const createUser = async (
  name: string,
  email: string,
  password: string,
  role: 'USER' | 'ADMIN' = 'USER'
) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser)
    throw new GraphQLError('User already exists', {
      extensions: { code: 'USER_ALREADY_EXISTS' },
    });

  const hashedPassword = await hashPassword(password);
  const newUser = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  await redis.del('getAllUsers');

  return newUser;
};

/**
 * Login user and generate tokens
 */
export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new GraphQLError('User not found');

  const isValid = await comparePassword(password, user.password);
  if (!isValid) throw new GraphQLError('Invalid password');

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  return { accessToken, refreshToken };
};

/**
 * Refresh access token using refresh token
 */
export const refreshUserToken = async (refreshToken: string) => {
  const decoded = await verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user) throw new GraphQLError('User not found');

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = await generateRefreshToken(user);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Logout user and invalidate refresh token
 */
export const logoutUser = async (userId: string) => {
  await invalidateRefreshToken(userId);
  return { message: 'Logged out successfully' };
};
