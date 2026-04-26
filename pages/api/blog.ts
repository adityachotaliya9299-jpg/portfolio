import type { NextApiRequest, NextApiResponse } from 'next';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // GET — fetch posts (all for admin, only published for public)
  if (req.method === 'GET') {
    const { slug, admin } = req.query;
    const isAdmin = admin === 'true' && req.headers.authorization === `Bearer ${process.env.ADMIN_PASSWORD}`;

    try {
      if (slug) {
        const rows = await sql`
          SELECT * FROM blog_posts WHERE slug = ${slug as string}
          ${isAdmin ? sql`` : sql`AND published = true`}
          LIMIT 1
        `;
        if (rows.length === 0) return res.status(404).json({ error: 'Post not found' });
        return res.json(rows[0]);
      }

      const rows = await sql`
        SELECT id, title, slug, excerpt, tags, category, published, reading_time, created_at
        FROM blog_posts
        ${isAdmin ? sql`` : sql`WHERE published = true`}
        ORDER BY created_at DESC
      `;
      return res.json(rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  // POST — create post (admin only)
  if (req.method === 'POST') {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) return res.status(401).json({ error: 'Unauthorized' });

    const { title, slug, excerpt, content, tags, category, published, reading_time } = req.body;
    if (!title || !slug || !content) return res.status(400).json({ error: 'title, slug and content required' });

    try {
      const id = Date.now().toString();
      const tagsArray = Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);
      const [post] = await sql`
        INSERT INTO blog_posts (id, title, slug, excerpt, content, tags, category, published, reading_time, created_at)
        VALUES (${id}, ${title}, ${slug}, ${excerpt || ''}, ${content}, ${tagsArray}, ${category || 'General'}, ${!!published}, ${reading_time || 5}, NOW())
        RETURNING *
      `;
      return res.status(201).json(post);
    } catch (err: unknown) {
      if (err instanceof Error && err.message?.includes('unique')) return res.status(400).json({ error: 'Slug already exists' });
      return res.status(500).json({ error: 'Failed to create post' });
    }
  }

  // PUT — update post (admin only)
  if (req.method === 'PUT') {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const { title, slug, excerpt, content, tags, category, published, reading_time } = req.body;

    try {
      const tagsArray = Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean);
      const [post] = await sql`
        UPDATE blog_posts SET
          title=${title}, slug=${slug}, excerpt=${excerpt || ''},
          content=${content}, tags=${tagsArray}, category=${category || 'General'},
          published=${!!published}, reading_time=${reading_time || 5}
        WHERE id=${id as string}
        RETURNING *
      `;
      if (!post) return res.status(404).json({ error: 'Post not found' });
      return res.json(post);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update post' });
    }
  }

  // DELETE — delete post (admin only)
  if (req.method === 'DELETE') {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.ADMIN_PASSWORD}`) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    try {
      await sql`DELETE FROM blog_posts WHERE id = ${id as string}`;
      return res.json({ success: true });
    } catch {
      return res.status(500).json({ error: 'Failed to delete post' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}