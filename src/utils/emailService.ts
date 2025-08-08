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
 * Sends competition confirmation email
 */
export async function sendCompetitionConfirmationEmail(email: string): Promise<void> {
  const subject = `You're in! BridgeMind 1,000 Subscriber Coding Competition`;
  
  const text = `Thanks for entering the BridgeMind coding competition!

Deadline: Sunday, August 10 at 11:59 PM ET
Results: August 11 (community vote)
Prize: $50 Visa gift card

We'll email more instructions soon. Good luck!`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to the Competition!</h2>
      <p>Thanks for entering the <strong>BridgeMind 1,000 Subscriber Coding Competition</strong>!</p>
      <ul style="line-height: 1.8;">
        <li><strong>Deadline:</strong> Sunday, August 10 at 11:59 PM ET</li>
        <li><strong>Results:</strong> August 11 (community vote)</li>
        <li><strong>Prize:</strong> $50 Visa gift card</li>
      </ul>
      <p>We'll email more instructions soon. Good luck!</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        You're receiving this email because you signed up for the BridgeMind coding competition.
      </p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
}
