import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET — fetch all messages (newest first)
  if (req.method === 'GET') {
    try {
      const messages = await sql`
        SELECT id, name, email, subject, message, created_at as "createdAt"
        FROM messages
        ORDER BY created_at DESC
      `;
      return res.json(messages);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  // DELETE — remove a message
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    try {
      await sql`DELETE FROM messages WHERE id = ${id as string}`;
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete message' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}