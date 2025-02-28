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
import os from 'os';
import { logger } from './config/logger';
import { schema } from './graphql';

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';

function getServerAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

dotenv.config();

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // Máximo de 100 requisições por minuto
});

// Lista de origens permitidas (exemplo: local e produção)
const allowedOrigins = [
  'https://localhost:5173',
  'https://localhost:4000',
  'http://3.88.8.170:8080/graphql',
];

async function startApolloServer() {
  const app = express();

  app.use(
    cors({
      // origin: '*',
      // credentials: true,

      origin: '*', // Permite todas as origens (só para testar)
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,

      // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      // origin: (origin, callback) => {
      //   if (!origin || allowedOrigins.includes(origin)) {
      //     callback(null, true);
      //   } else {
      //     callback(new Error('Not allowed by CORS'));
      //   }
      // },
      // credentials: true,
    })
  );

  app.set('trust proxy', 1);

  app.use(json());
  app.use(limiter);
  app.use(
    helmet({
      hsts: false,
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
            user = jwt.verify(
              token.replace('Bearer ', ''),
              process.env.JWT_SECRET || ''
            );
          } catch (error) {
            console.error('Invalid Token');
          }
        }

        return { req, user };
      },
    })
  );

  const SERVER_ADDRESS = getServerAddress();

  app.listen(PORT, HOST, () => {
    logger.info(`🚀 Server running at:`);
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`   - Local:   localhost:${PORT}/graphql`);
    } else {
      logger.info(`   - Network: https://${SERVER_ADDRESS}:${PORT}/graphql`);
    }
  });
}

startApolloServer();
