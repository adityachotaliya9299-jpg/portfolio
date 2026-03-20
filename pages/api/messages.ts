import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'data', 'messages.json');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.ADMIN_PASSWORD || 'admin123'}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.method === 'GET') {
    const messages = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    return res.json(messages.reverse());
  }
  if (req.method === 'DELETE') {
    const { id } = req.query;
    const messages = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    fs.writeFileSync(FILE, JSON.stringify(messages.filter((m: { id: string }) => m.id !== id), null, 2));
    return res.json({ success: true });
  }
  res.status(405).json({ error: 'Method not allowed' });
}
