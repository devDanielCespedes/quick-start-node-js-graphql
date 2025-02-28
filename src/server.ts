import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { json } from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import { env } from './config/env';
import { logger } from './config/logger';
import { schema } from './graphql';

dotenv.config();

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // Máximo de 100 requisições por minuto
});

// Lista de origens permitidas (exemplo: local e produção)
const allowedOrigins = [
  'https://localhost:5173',
  'https://localhost:4000',
  'https://quick-start-node-js-graphql-production.up.railway.app',
];

async function startApolloServer() {
  const app = express();

  app.use(
    cors({
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  app.use(json());
  app.use(limiter);
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            'data:',
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [
            `'self'`,
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    })
  );

  const server = new ApolloServer({
    schema,
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return error;
    },
    introspection: true,
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault({
            graphRef: 'my-graph-id@my-graph-variant',
            footer: false,
          })
        : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
    ],
  });

  await server.start();

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization || '';
        let user = null;

        if (token) {
          try {
            user = jwt.verify(token.replace('Bearer ', ''), env.JWT_SECRET);
          } catch (error) {
            console.error('Invalid Token');
          }
        }

        return { req, user };
      },
    })
  );

  app.listen(env.PORT, () => {
    logger.info(`🚀 Server running at http://localhost:${env.PORT}/graphql`);
  });
}

startApolloServer();
