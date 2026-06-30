import { createClient } from 'redis';
import './env.js';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    reconnectStrategy: (retries) => {
      // Fail after 3 attempts so we don't block startup forever if Redis is offline
      if (retries > 2) {
        return new Error('Redis connection failed');
      }
      return 100; // retry after 100ms
    },
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis connected successfully'));

try {
  await redisClient.connect();
} catch (err) {
  console.warn('Redis unavailable — rate limiting and translation caching will be disabled');
}

export default redisClient;
