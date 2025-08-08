import { Router, Request, Response } from 'express';
import BetaSignup from '../models/BetaSignup';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/beta-signups
 * Create a new beta signup
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { email, experience, goal, referrer, referrerOther } = req.body;

  // Validate email
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Create new signup
    const signup = await BetaSignup.create({
      email,
      experience,
      goal,
      referrer,
      referrerOther,
    });

    res.status(201).json({
      id: signup._id,
      createdAt: signup.createdAt,
      message: 'Successfully signed up for beta access',
    });
  } catch (error: any) {
    // Handle duplicate email
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'This email is already registered for beta access' 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    throw error; // Let error handler middleware handle other errors
  }
}));

/**
 * GET /api/beta-signups
 * Get total count of beta signups
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const count = await BetaSignup.countDocuments();
  
  res.json({ 
    count,
    message: `Total beta signups: ${count}` 
  });
}));

/**
 * GET /api/beta-signups/stats
 * Get detailed statistics (protected endpoint - add auth in production)
 */
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  // In production, add authentication middleware here
  
  const total = await BetaSignup.countDocuments();
  
  // Aggregate by referrer
  const byReferrer = await BetaSignup.aggregate([
    { $group: { _id: '$referrer', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  
  // Aggregate by experience
  const byExperience = await BetaSignup.aggregate([
    { $group: { _id: '$experience', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  
  // Aggregate by goal
  const byGoal = await BetaSignup.aggregate([
    { $group: { _id: '$goal', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  
  res.json({
    total,
    byReferrer,
    byExperience,
    byGoal,
  });
}));

export default router;
