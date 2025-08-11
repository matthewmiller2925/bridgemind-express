import { Router, Request, Response } from 'express';
import CompetitionSubmission from '../models/CompetitionSubmission';
import { asyncHandler } from '../middleware/errorHandler';
import { getClientIp, checkRateLimit } from '../utils/rateLimiter';
import { sendEmail } from '../utils/emailService';

const router = Router();

/**
 * Send confirmation email for competition submission
 */
async function sendSubmissionConfirmationEmail(email: string, projectUrl: string, projectTitle?: string): Promise<void> {
  const subject = `Competition Submission Received - BridgeMind 1,000 Subscriber Competition`;
  
  const text = `Thank you for submitting your project to the BridgeMind 1,000 Subscriber Coding Competition!

Project Details:
- Title: ${projectTitle || 'Untitled Project'}
- URL: ${projectUrl}

Submission Deadline: Sunday, August 10 at 11:59 PM ET
Results: August 11 (community vote)
Prize: $50 Visa gift card

We've received your submission and will review it. Good luck!

Important: Make sure your project is accessible at the provided URL until the competition ends.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Competition Submission Received!</h2>
      <p>Thank you for submitting your project to the <strong>BridgeMind 1,000 Subscriber Coding Competition</strong>!</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Project Details:</h3>
        <ul style="line-height: 1.8;">
          <li><strong>Title:</strong> ${projectTitle || 'Untitled Project'}</li>
          <li><strong>URL:</strong> <a href="${projectUrl}" style="color: #0066cc;">${projectUrl}</a></li>
        </ul>
      </div>
      
      <ul style="line-height: 1.8;">
        <li><strong>Deadline:</strong> Sunday, August 10 at 11:59 PM ET</li>
        <li><strong>Results:</strong> August 11 (community vote)</li>
        <li><strong>Prize:</strong> $50 Visa gift card</li>
      </ul>
      
      <p style="color: #666;">
        <strong>Important:</strong> Make sure your project remains accessible at the provided URL until the competition ends.
      </p>
      
      <p>Good luck!</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        You're receiving this email because you submitted a project to the BridgeMind coding competition.
      </p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
}

/**
 * POST /api/competition-submissions
 * Submit a project for the competition
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  // Rate limiting
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ 
      error: 'Too many requests. Please try again later.' 
    });
  }

  const { email, projectUrl, projectTitle, description } = req.body;

  // Validate required fields
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  if (!projectUrl || typeof projectUrl !== 'string') {
    return res.status(400).json({ error: 'Project URL is required' });
  }

  // Normalize URL (add https:// if not present)
  let normalizedUrl = projectUrl.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  try {
    // Create submission
    const submission = await CompetitionSubmission.create({
      email,
      projectUrl: normalizedUrl,
      projectTitle: projectTitle?.trim(),
      description: description?.trim(),
      campaign: '1k-subs-competition',
    });

    // Send confirmation email (fire-and-forget)
    sendSubmissionConfirmationEmail(email, normalizedUrl, projectTitle).catch(err => {
      console.error('Failed to send submission confirmation email:', err);
    });

    res.status(201).json({
      id: submission._id,
      submittedAt: submission.submittedAt,
      message: 'Project submitted successfully!',
    });
  } catch (error: any) {
    // Handle duplicate submission
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'You have already submitted a project with this email.' 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Invalid submission data. Please check your email and URL format.' 
      });
    }

    throw error; // Let error handler middleware handle other errors
  }
}));

/**
 * GET /api/competition-submissions
 * Get total count of competition submissions
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { campaign } = req.query;
  
  const filter = campaign ? { campaign: campaign as string } : { campaign: '1k-subs-competition' };
  const count = await CompetitionSubmission.countDocuments(filter);
  
  res.json({ 
    count,
    campaign: filter.campaign,
    message: `Total competition submissions: ${count}` 
  });
}));

/**
 * GET /api/competition-submissions/recent
 * Get recent submissions (protected - add auth in production)
 */
router.get('/recent', asyncHandler(async (req: Request, res: Response) => {
  // In production, add authentication middleware here
  
  const limit = parseInt(req.query.limit as string) || 10;
  
  const submissions = await CompetitionSubmission.find({ campaign: '1k-subs-competition' })
    .select('email projectUrl projectTitle submittedAt')
    .sort({ submittedAt: -1 })
    .limit(limit);
  
  res.json({
    submissions,
    count: submissions.length,
  });
}));

export default router;
