import { Router, Request, Response } from 'express';
import CompetitionSignup from '../models/CompetitionSignup';
import { asyncHandler } from '../middleware/errorHandler';
import { getClientIp, checkRateLimit } from '../utils/rateLimiter';
import { sendCompetitionConfirmationEmail } from '../utils/emailService';

const router = Router();

/**
 * Check if origin is allowed
 */
function isOriginAllowed(req: Request): boolean {
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  if (!allowedOrigin || allowedOrigin === '*') return true;
  
  const origin = req.headers.origin as string || '';
  const referer = req.headers.referer as string || '';
  
  return origin.startsWith(allowedOrigin) || referer.startsWith(allowedOrigin);
}

/**
 * POST /api/competition-signups
 * Register for the competition
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  // Check origin
  if (!isOriginAllowed(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Rate limiting
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ 
      error: 'Too many requests. Please try again later.' 
    });
  }

  const { email, acceptedRules, campaign } = req.body;

  // Validate required fields
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  if (!acceptedRules) {
    return res.status(400).json({ error: 'You must accept the rules' });
  }

  try {
    // Create signup
    const signup = await CompetitionSignup.create({
      email,
      acceptedRules: true,
      campaign: campaign || '1k-subs',
    });

    // Send confirmation email (fire-and-forget)
    sendCompetitionConfirmationEmail(email).catch(err => {
      console.error('Failed to send confirmation email:', err);
    });

    res.status(201).json({
      id: signup._id,
      createdAt: signup.createdAt,
      message: 'Successfully registered for the competition!',
    });
  } catch (error: any) {
    // Handle duplicate entry
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'You have already entered with this email.' 
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
 * GET /api/competition-signups
 * Get total count of competition signups
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { campaign } = req.query;
  
  const filter = campaign ? { campaign: campaign as string } : {};
  const count = await CompetitionSignup.countDocuments(filter);
  
  res.json({ 
    count,
    campaign: campaign || 'all',
    message: `Total competition signups: ${count}` 
  });
}));

/**
 * GET /api/competition-signups/stats
 * Get detailed statistics by campaign
 */
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  // In production, add authentication middleware here
  
  const total = await CompetitionSignup.countDocuments();
  
  // Group by campaign
  const byCampaign = await CompetitionSignup.aggregate([
    { $group: { _id: '$campaign', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  
  // Recent signups (last 24 hours)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await CompetitionSignup.countDocuments({
    createdAt: { $gte: yesterday },
  });
  
  // Daily signups for the last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dailySignups = await CompetitionSignup.aggregate([
    { $match: { createdAt: { $gte: weekAgo } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  
  res.json({
    total,
    recentCount,
    byCampaign,
    dailySignups,
  });
}));

export default router;
