import fetch from 'node-fetch';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Sends an email using SendGrid API
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const fromName = process.env.SENDGRID_FROM_NAME || 'BridgeMind';

  if (!apiKey || !fromEmail) {
    console.warn('SendGrid not configured - skipping email send');
    return;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: options.to }],
            subject: options.subject,
          },
        ],
        from: { 
          email: fromEmail, 
          name: fromName 
        },
        content: [
          { type: 'text/plain', value: options.text },
          { type: 'text/html', value: options.html },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('SendGrid error:', error);
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw - we don't want email failures to break the API
  }
}

/**
 * Sends competition confirmation email with challenge instructions
 */
export async function sendCompetitionConfirmationEmail(email: string): Promise<void> {
  const subject = `🚀 You're in! BridgeMind AI Stock Market Challenge`;
  
  const text = `Welcome to the BridgeMind 1,000 Subscriber Coding Competition!

YOUR CHALLENGE:
Build a Next.js website with an AI integration specifically tailored for stock market information - think ChatGPT but for financial markets.

PROJECT REQUIREMENTS:
1. Tech Stack: Next.js with AI integration
2. Focus: Stock market information and analysis
3. AI Features: Implement as many useful tools as possible
4. UI/UX: Modern, clean, and user-friendly interface
5. Deployment: Publish to a live domain for community testing

EVALUATION CRITERIA:
- Number and usefulness of AI tools/features
- Quality of stock market information integration
- Modern and intuitive user interface
- Overall user experience
- Code quality and documentation

IMPORTANT DATES:
- Submission Deadline: Sunday, August 10 at 11:59 PM ET
- Community Voting: August 11
- Winner Announcement: August 12
- Prize: $50 Visa gift card

SUBMISSION INSTRUCTIONS:
1. Deploy your project to a public URL
2. Submit your live URL and GitHub repo link
3. Include a brief README with setup instructions

Good luck! May the best AI stock market assistant win!

Questions? Reply to this email.

Best regards,
The BridgeMind Team`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f7;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🚀 Welcome to the Competition!</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">BridgeMind 1,000 Subscriber AI Challenge</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          
          <!-- Challenge Box -->
          <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; margin: 0 0 10px 0; font-size: 20px;">📊 Your Challenge</h2>
            <p style="color: #555; margin: 0; font-size: 16px; line-height: 1.6;">
              Build a <strong>Next.js website with AI integration</strong> specifically tailored for <strong>stock market information</strong> - think ChatGPT meets Bloomberg Terminal!
            </p>
          </div>
          
          <!-- Requirements Section -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">✅ Project Requirements</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px; background: #f8f9fa; border-radius: 6px 6px 0 0;">
                  <strong style="color: #667eea;">🛠 Tech Stack</strong>
                  <div style="color: #666; margin-top: 4px;">Next.js with AI integration</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; background: #ffffff; border-left: 1px solid #e9ecef; border-right: 1px solid #e9ecef;">
                  <strong style="color: #667eea;">🎯 Focus</strong>
                  <div style="color: #666; margin-top: 4px;">Stock market information & analysis</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; background: #f8f9fa;">
                  <strong style="color: #667eea;">🤖 AI Features</strong>
                  <div style="color: #666; margin-top: 4px;">Implement as many useful tools as possible</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; background: #ffffff; border-left: 1px solid #e9ecef; border-right: 1px solid #e9ecef;">
                  <strong style="color: #667eea;">🎨 UI/UX</strong>
                  <div style="color: #666; margin-top: 4px;">Modern, clean, and user-friendly interface</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; background: #f8f9fa; border-radius: 0 0 6px 6px;">
                  <strong style="color: #667eea;">🌐 Deployment</strong>
                  <div style="color: #666; margin-top: 4px;">Publish to a live domain for community testing</div>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Evaluation Criteria -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">🏆 Evaluation Criteria</h3>
            <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
              <li>Number and usefulness of AI tools/features</li>
              <li>Quality of stock market information integration</li>
              <li>Modern and intuitive user interface</li>
              <li>Overall user experience</li>
              <li>Code quality and documentation</li>
            </ul>
          </div>
          
          <!-- Important Dates -->
          <div style="background: #fef9e7; border: 1px solid #f7dc6f; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">📅 Important Dates</h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Submission Deadline:</strong></td>
                <td style="padding: 8px 0; color: #333; text-align: right;">Sunday, Aug 10, 11:59 PM ET</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Community Voting:</strong></td>
                <td style="padding: 8px 0; color: #333; text-align: right;">August 11</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Winner Announcement:</strong></td>
                <td style="padding: 8px 0; color: #333; text-align: right;">August 12</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Prize:</strong></td>
                <td style="padding: 8px 0; color: #28a745; text-align: right; font-weight: bold;">$50 Visa Gift Card</td>
              </tr>
            </table>
          </div>
          
          <!-- Submission Instructions -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">📝 How to Submit</h3>
            <ol style="color: #666; line-height: 1.8; padding-left: 20px;">
              <li>Deploy your project to a public URL</li>
              <li>Submit your live URL and GitHub repo link</li>
              <li>Include a brief README with setup instructions</li>
            </ol>
          </div>
          
          <!-- CTA Section -->
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
              <strong>Ready to build something amazing?</strong><br>
              May the best AI stock market assistant win! 🎯
            </p>
          </div>
          
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;">
            Questions? Reply to this email and we'll help you out!
          </p>
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2024 BridgeMind. All rights reserved.<br>
            You're receiving this because you signed up for our coding competition.
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to: email, subject, text, html });
}
