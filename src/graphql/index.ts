import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { taskResolver } from './resolvers/taskResolver';
import { userResolver } from './resolvers/userResolvers';
import { taskTypeDefs } from './schemas/taskSchema';
import { typeDefs as userTypeDefs } from './schemas/userSchema';

/**
 * Merge multiple type definitions and resolvers
 * This allows easy extension in the future (e.g., Product, Order, etc.)
 */
const typeDefs = mergeTypeDefs([userTypeDefs]);
const resolvers = mergeResolvers([userResolver]);
const typeTaskDefs = mergeTypeDefs([taskTypeDefs]);
const resolversTask = mergeResolvers([taskResolver]);

export const schema = makeExecutableSchema({
  typeDefs: [typeDefs, typeTaskDefs],
  resolvers: [resolvers, resolversTask],
});
