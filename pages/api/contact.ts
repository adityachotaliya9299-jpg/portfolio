import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';
import nodemailer from 'nodemailer';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields required' });
  }

  // Save to Neon
  try {
    const id = Date.now().toString();
    await sql`
      INSERT INTO messages (id, name, email, subject, message, created_at)
      VALUES (${id}, ${name}, ${email}, ${subject}, ${message}, NOW())
    `;
  } catch (err) {
    console.error('DB save failed:', err);
    return res.status(500).json({ error: 'Failed to save message' });
  }

  // Send email notification (only if env vars are set)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        replyTo: email,
        subject: `📬 New message: ${subject}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
            <h2 style="color:#0099cc;margin-bottom:4px;">New Portfolio Message</h2>
            <p style="color:#64748b;font-size:13px;margin-top:0;">
              ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
            </p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
            <table style="width:100%;font-size:14px;">
              <tr><td style="color:#64748b;padding:6px 0;width:80px;">Name</td><td style="font-weight:600;">${name}</td></tr>
              <tr><td style="color:#64748b;padding:6px 0;">Email</td><td><a href="mailto:${email}" style="color:#0099cc;">${email}</a></td></tr>
              <tr><td style="color:#64748b;padding:6px 0;">Subject</td><td style="font-weight:600;">${subject}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
            <h4 style="color:#334155;margin-bottom:8px;">Message</h4>
            <p style="color:#1e293b;line-height:1.7;white-space:pre-wrap;background:#f8fafc;padding:16px;border-radius:8px;">${message}</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />
            <p style="color:#94a3b8;font-size:12px;text-align:center;">Reply to this email to respond to ${name}.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error('Email failed:', err);
      // Don't block — message already saved to DB
    }
  }

  res.status(200).json({ success: true });
}