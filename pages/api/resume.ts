import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT value FROM settings WHERE key = 'resume_url' LIMIT 1`;
    const url = rows.length > 0 ? rows[0].value : '/resume.pdf';
    res.redirect(302, url);
  } catch {
    res.redirect(302, '/resume.pdf');
  }
}