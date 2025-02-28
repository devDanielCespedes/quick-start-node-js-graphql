// https://github.com/prisma/prisma/issues/13672#:~:text=Edits-,It%20turned%20out%20that%20my%20previous%20suggestion%20to%20modify%20tsconfig.json,Now%20I%20can%20build%20and%20run%20without%20errors.,-%F0%9F%91%8D
import { PrismaClient } from '../../node_modules/.prisma/client';

console.log('process.env:', process.env);

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL não foi encontrada. Verifique as variáveis de ambiente.'
  );
}
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
