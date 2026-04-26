import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password } = req.body;
  const adminPw = process.env.ADMIN_PASSWORD || 'admin123';
  if (password === adminPw) {
    return res.json({ token: adminPw, success: true, expiresAt: Date.now() + 30 * 60 * 1000 });
  }
  return res.status(401).json({ error: 'Invalid password' });
}
