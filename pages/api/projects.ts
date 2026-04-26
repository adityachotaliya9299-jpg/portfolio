import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'GET') {
    try {
      const projects = await sql`
        SELECT id, title, description, short_description as "shortDescription", tags, github, live, category, featured, created_at as "createdAt"
        FROM projects ORDER BY created_at DESC
      `;
      return res.json(projects);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  if (req.method === 'POST') {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) return res.status(401).json({ error: 'Unauthorized' });
    const { title, description, tags, github, live, category, featured } = req.body;
    if (!title || !description || !github || !category) return res.status(400).json({ error: 'Missing required fields' });
    try {
      const id = Date.now().toString();
      const tagsArray = Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);
      const shortDescription = req.body.shortDescription || '';
      const [project] = await sql`
        INSERT INTO projects (id, title, description, short_description, tags, github, live, category, featured, created_at)
        VALUES (${id}, ${title}, ${description}, ${shortDescription}, ${tagsArray}, ${github}, ${live || ''}, ${category}, ${!!featured}, CURRENT_DATE)
        RETURNING id, title, description, short_description as "shortDescription", tags, github, live, category, featured, created_at as "createdAt"
      `;
      return res.status(201).json(project);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to add project' });
    }
  }

  if (req.method === 'PUT') {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const { title, description, tags, github, live, category, featured } = req.body;
    if (!title || !description || !github || !category) return res.status(400).json({ error: 'Missing required fields' });
    try {
      const tagsArray = Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);
      const shortDescription = req.body.shortDescription || '';
      const [updated] = await sql`
        UPDATE projects
        SET title=${title}, description=${description}, short_description=${shortDescription},
            tags=${tagsArray}, github=${github}, live=${live || ''}, category=${category}, featured=${!!featured}
        WHERE id = ${id as string}
        RETURNING id, title, description, short_description as "shortDescription", tags, github, live, category, featured, created_at as "createdAt"
      `;
      if (!updated) return res.status(404).json({ error: 'Project not found' });
      return res.json(updated);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update project' });
    }
  }

  if (req.method === 'DELETE') {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) return res.status(401).json({ error: 'Unauthorized' });
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