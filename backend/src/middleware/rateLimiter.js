import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis.js';

let store;
if (redisClient.isReady) {
  try {
    store = new RedisStore({
      sendCommand: async (...args) => {
        return await redisClient.sendCommand(args);
      },
    });
  } catch (err) {
    console.warn('Failed to initialize RedisStore, falling back to MemoryStore:', err.message);
  }
}

export const apiLimiter = rateLimit({
  store,
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
});

export default apiLimiter;
