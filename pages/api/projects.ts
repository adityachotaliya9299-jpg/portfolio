import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // GET — fetch all projects
  if (req.method === 'GET') {
    try {
      const projects = await sql`
        SELECT id, title, description, tags, github, live, category, featured, created_at as "createdAt"
        FROM projects
        ORDER BY created_at ASC
      `;
      return res.json(projects);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  // POST — add a project
  if (req.method === 'POST') {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { title, description, tags, github, live, category, featured } = req.body;
    if (!title || !description || !github || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      const id = Date.now().toString();
      const tagsArray = Array.isArray(tags)
        ? tags
        : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);

      const [project] = await sql`
        INSERT INTO projects (id, title, description, tags, github, live, category, featured, created_at)
        VALUES (${id}, ${title}, ${description}, ${tagsArray}, ${github}, ${live || ''}, ${category}, ${!!featured}, CURRENT_DATE)
        RETURNING id, title, description, tags, github, live, category, featured, created_at as "createdAt"
      `;
      return res.status(201).json(project);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to add project' });
    }
  }

  // DELETE — remove a project
  if (req.method === 'DELETE') {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    try {
      await sql`DELETE FROM projects WHERE id = ${id as string}`;
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete project' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}