import { GraphQLError } from 'graphql/error';
import jwt from 'jsonwebtoken';

export const authMiddleware = (required: boolean = true) => {
  return (resolver: Function) => {
    return async (parent: any, args: any, context: any, info: any) => {
      const authHeader = context.req.headers.authorization;
      if (!authHeader) {
        if (required) {
          throw new GraphQLError('Unauthorized', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }
        return resolver(parent, args, context, info);
      }

      const token = authHeader.replace('Bearer ', '');

      try {
        const user = jwt.verify(token, process.env.JWT_SECRET || '');
        context.user = user;
      } catch (error) {
        console.error('❌ Invalid Token');

        // await redis.del('getAllUsers');

        if (required) {
          throw new GraphQLError('Invalid Token', {
            extensions: { code: 'UNAUTHENTICATED' },
          });
        }
      }

      return resolver(parent, args, context, info);
    };
  };
};
