import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import connectToDatabase from './config/database';

// Routes
import betaSignupsRouter from './routes/betaSignups';
import competitionSignupsRouter from './routes/competitionSignups';
import goalpostBetaRouter from './routes/goalpostBeta';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/beta-signups', betaSignupsRouter);
app.use('/api/competition-signups', competitionSignupsRouter);
app.use('/api/goalpost-beta', goalpostBetaRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'BridgeMind Express API',
    version: '1.0.1',
    endpoints: {
      health: '/health',
      betaSignups: '/api/beta-signups',
      competitionSignups: '/api/competition-signups',
      goalpostBeta: '/api/goalpost-beta',
    },
  });
});
//
// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`
🚀 BridgeMind Express API Server
================================
Environment: ${process.env.NODE_ENV || 'development'}
Port: ${PORT}
URL: http://localhost:${PORT}
MongoDB: Connected

Available endpoints:
- GET  /health
- GET  /api/beta-signups
- POST /api/beta-signups
- GET  /api/beta-signups/stats
- GET  /api/competition-signups
- POST /api/competition-signups
- GET  /api/competition-signups/stats
- GET  /api/goalpost-beta
- POST /api/goalpost-beta

Press Ctrl+C to stop the server
================================
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to send this to a logging service
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  // Gracefully shutdown
  process.exit(1);
});

// Start the server
startServer();

export default app;



