import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'data', 'projects.json');

function readProjects() {
  return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
}
function writeProjects(data: unknown[]) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.json(readProjects());
  }

  if (req.method === 'POST') {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.ADMIN_PASSWORD || 'admin123'}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { title, description, tags, github, live, category, featured } = req.body;
    if (!title || !description || !github || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const projects = readProjects();
    const newProject = {
      id: Date.now().toString(),
      title, description,
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
      github, live: live || '',
      category, featured: !!featured,
      createdAt: new Date().toISOString().split('T')[0],
    };
    projects.push(newProject);
    writeProjects(projects);
    return res.status(201).json(newProject);
  }

  if (req.method === 'DELETE') {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.ADMIN_PASSWORD || 'admin123'}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id } = req.query;
    const projects = readProjects();
    const filtered = projects.filter((p: { id: string }) => p.id !== id);
    writeProjects(filtered);
    return res.json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
