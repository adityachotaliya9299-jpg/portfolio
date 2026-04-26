import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // GET — fetch a setting value
  if (req.method === 'GET') {
    const { key } = req.query;
    if (!key) return res.status(400).json({ error: 'Missing key' });
    try {
      const rows = await sql`SELECT value FROM settings WHERE key = ${key as string} LIMIT 1`;
      if (rows.length === 0) return res.json({ value: null });
      return res.json({ value: rows[0].value });
    } catch {
      return res.status(500).json({ error: 'Failed to fetch setting' });
    }
  }

  // PUT — update a setting value (admin only)
  if (req.method === 'PUT') {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ error: 'Missing key or value' });
    try {
      await sql`
        INSERT INTO settings (key, value) VALUES (${key}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()
      `;
      return res.json({ success: true, key, value });
    } catch {
      return res.status(500).json({ error: 'Failed to update setting' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}