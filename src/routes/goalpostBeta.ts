import { Router, Request, Response } from 'express';
import GoalpostBetaSignup from '../models/GoalpostBetaSignup';
import { asyncHandler } from '../middleware/errorHandler';
import { sendEmail } from '../utils/emailService';

const router = Router();

/**
 * Basic CORS for this route (optional, can rely on global CORS)
 */
function setCors(res: Response) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

router.options('/', (req: Request, res: Response) => {
  setCors(res);
  return res.status(204).end();
});

/**
 * POST /api/goalpost-beta
 * Create a goalpost beta signup
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  setCors(res);
  const { email, platform } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (platform !== 'ios' && platform !== 'android') {
    return res.status(400).json({ error: 'Invalid platform' });
  }

  try {
    const doc = await GoalpostBetaSignup.create({ email, platform });

    // Fire-and-forget ack email
    const subject = `You're in! GoalPost Beta (${platform.toUpperCase()})`;
    const text = `Thanks for joining the GoalPost beta on ${platform}.

We'll email TestFlight/Google Play instructions shortly.`;
    const html = `<p>Thanks for joining the <strong>GoalPost</strong> beta on ${platform.toUpperCase()}.</p>
      <p>We'll email TestFlight/Google Play instructions shortly.</p>`;
    sendEmail({ to: email, subject, text, html }).catch(() => {});

    return res.status(201).json({ id: doc._id, createdAt: doc.createdAt });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Already registered for this platform.' });
    }
    if (err?.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid payload' });
    }
    throw err;
  }
}));

/**
 * GET /api/goalpost-beta
 * Counts by platform
 */
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const ios = await GoalpostBetaSignup.countDocuments({ platform: 'ios' });
  const android = await GoalpostBetaSignup.countDocuments({ platform: 'android' });
  return res.json({ ios, android });
}));

export default router;


