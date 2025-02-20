import { authMiddleware } from '../../middleware/auth';
import {
  createUser,
  getAllUsers,
  loginUser,
  logoutUser,
  refreshUserToken,
} from '../../services/userServices';

export const userResolver = {
  Query: {
    // getAllUsers: authMiddleware(true)(async () => {
    //   return getAllUsers();
    // }),
    getAllUsers: async () => {
      return getAllUsers();
    },
  },
  Mutation: {
    createUser: async (
      _: any,
      args: {
        name: string;
        email: string;
        password: string;
        role?: 'USER' | 'ADMIN';
      }
    ) => {
      return createUser(args.name, args.email, args.password, args.role);
    },

    login: async (_: any, args: { email: string; password: string }) => {
      return loginUser(args.email, args.password);
    },

    refreshToken: async (_: any, args: { refreshToken: string }) => {
      return refreshUserToken(args.refreshToken);
    },

    logout: authMiddleware(true)(async (_: any, __: any, context: any) => {
      return logoutUser(context.user.id);
    }),
  },
};
