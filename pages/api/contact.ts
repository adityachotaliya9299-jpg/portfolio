import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const FILE = path.join(process.cwd(), 'data', 'messages.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields required' });
  }

  // Save to JSON
  const messages = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  messages.push({ id: Date.now().toString(), name, email, subject, message, createdAt: new Date().toISOString() });
  fs.writeFileSync(FILE, JSON.stringify(messages, null, 2));

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
        to: process.env.GMAIL_USER,  // sends to yourself
        replyTo: email,              // reply goes directly to the client
        subject: `📬 New message: ${subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0099cc; margin-bottom: 4px;">New Portfolio Message</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 0;">Received on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />

            <table style="width: 100%; font-size: 14px;">
              <tr><td style="color: #64748b; padding: 6px 0; width: 80px;">Name</td><td style="font-weight: 600;">${name}</td></tr>
              <tr><td style="color: #64748b; padding: 6px 0;">Email</td><td><a href="mailto:${email}" style="color: #0099cc;">${email}</a></td></tr>
              <tr><td style="color: #64748b; padding: 6px 0;">Subject</td><td style="font-weight: 600;">${subject}</td></tr>
            </table>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />

            <h4 style="color: #334155; margin-bottom: 8px;">Message</h4>
            <p style="color: #1e293b; line-height: 1.7; white-space: pre-wrap; background: #f8fafc; padding: 16px; border-radius: 8px;">${message}</p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              Reply directly to this email to respond to ${name}.
            </p>
          </div>
        `,
      });
    } catch (err) {
      // Email failed but message is already saved — don't block the response
      console.error('Email notification failed:', err);
    }
  }

  res.status(200).json({ success: true });
}