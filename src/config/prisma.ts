// https://github.com/prisma/prisma/issues/13672#:~:text=Edits-,It%20turned%20out%20that%20my%20previous%20suggestion%20to%20modify%20tsconfig.json,Now%20I%20can%20build%20and%20run%20without%20errors.,-%F0%9F%91%8D
import { PrismaClient } from '../../node_modules/.prisma/client';

export const prisma = new PrismaClient();
