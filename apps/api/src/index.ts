import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { tripRoutes } from './routes/trip';
import { authRoutes } from './routes/auth';
import { tokenRoutes } from './routes/token';

dotenv.config();

const fastify = Fastify({
  logger: true
});

fastify.register(cors, {
  origin: true
});

fastify.register(tripRoutes, { prefix: '/api/trips' });
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(tokenRoutes, { prefix: '/api/tokens' });

fastify.get('/', async (request, reply) => {
  return { 
    name: 'GreenHop API',
    version: '1.0.0',
    description: 'Backend API for GreenHop sustainable travel rewards system',
    endpoints: [
      'GET /health - Health check',
      'POST /api/trips/submit - Submit trip for verification',
      'GET /api/trips/user/:accountId - Get user trips',
      'POST /api/auth/connect - Connect wallet',
      'GET /api/tokens/balance/:accountId - Get token balance'
    ]
  };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || 'localhost';
    
    await fastify.listen({ port, host });
    console.log(`🚀 GreenHop API running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();