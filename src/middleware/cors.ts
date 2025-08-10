import cors from 'cors';
import { Request } from 'express';

/**
 * CORS configuration
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
    
    // Allow requests with no origin (like Postman or mobile apps)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if the origin is allowed
    if (origin === allowedOrigin || allowedOrigin === '*') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});



