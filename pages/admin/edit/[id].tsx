import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { neon } from '@neondatabase/serverless';
import { useTheme } from '../../../components/ThemeContext';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  github: string;
  live: string;
  category: string;
  featured: boolean;
  createdAt: string;
}

interface Props { project: Project | null; }

export default function EditProject({ project }: Props) {
  const { theme, toggle } = useTheme();
  const router = useRouter();

  const [form, setForm] = useState({
    title:       project?.title       || '',
    description: project?.description || '',
    tags:        project?.tags?.join(', ') || '',
    github:      project?.github      || '',
    live:        project?.live        || '',
    category:    project?.category    || 'Blockchain',
    featured:    project?.featured    || false,
  });

  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  if (!project) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'Syne', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h2 style={{ fontWeight: 800, marginBottom: '0.75rem' }}>Project Not Found</h2>
          <Link href="/admin" style={{ color: 'var(--accent)' }}>← Back to Admin</Link>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');

    const pw = localStorage.getItem('admin_token') || prompt('Enter admin password:') || '';

    try {
      const res = await fetch(`/api/projects?id=${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Project updated successfully!');
        setTimeout(() => router.push('/admin'), 1500);
      } else {
        setError(data.error || 'Failed to update');
      }
    } catch {
      setError('Network error');
    }
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.8rem 1rem',
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    fontFamily: "'Syne', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.68rem',
    letterSpacing: '0.08em',
    color: 'var(--text2)',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '0.4rem',
  };

  return (
    <>
      <Head><title>Edit: {project.title} — Admin</title></Head>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `linear-gradient(rgba(0,153,204,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,153,204,0.025) 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 56, padding: '0 1.5rem',
        background: 'var(--bg2)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: "'Syne', sans-serif",
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, var(--accent), var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.72rem', color: '#fff' }}>AC</div>
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Admin</span>
          </Link>
          <span style={{ color: 'var(--border2)' }}>/</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.08em' }}>EDIT PROJECT</span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={toggle} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link href="/admin" style={{ padding: '0.3rem 0.85rem', borderRadius: 7, border: '1px solid var(--border)', color: 'var(--text3)', fontSize: '0.76rem' }}>
            ← Back
          </Link>
        </div>
      </nav>

      {/* Main */}
      <div style={{ position: 'relative', zIndex: 1, paddingTop: '4.5rem', paddingBottom: '4rem', fontFamily: "'Syne', sans-serif" }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 clamp(1rem,4vw,2rem)' }}>

          {/* Page header */}
          <div style={{ padding: '2rem 0 2rem' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Editing Project ID: {project.id}
            </div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, lineHeight: 1.2 }}>
              {project.title}
            </h1>
          </div>

          {/* Form card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 'clamp(1.5rem,4vw,2.5rem)' }}>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Title */}
              <div>
                <label style={labelStyle}>Project Title *</label>
                <input
                  type="text" value={form.title} required
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,153,204,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description *</label>
                <textarea
                  value={form.description} required rows={6}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
              </div>

              {/* GitHub + Live in 2 cols */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="edit-2col">
                <div>
                  <label style={labelStyle}>GitHub URL *</label>
                  <input
                    type="url" value={form.github} required
                    onChange={e => setForm({ ...form, github: e.target.value })}
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,153,204,0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Live Demo URL</label>
                  <input
                    type="url" value={form.live}
                    onChange={e => setForm({ ...form, live: e.target.value })}
                    placeholder="https://…"
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,153,204,0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={labelStyle}>Tags (comma-separated)</label>
                <input
                  type="text" value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="Solidity, Foundry, Next.js, DeFi"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,153,204,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                {/* Tag preview */}
                {form.tags && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem' }}>
                    {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                      <span key={tag} style={{ padding: '0.2rem 0.6rem', background: 'rgba(0,153,204,0.07)', border: '1px solid rgba(0,153,204,0.18)', borderRadius: 4, fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'var(--accent)' }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Category + Featured */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="edit-2col">
                <div>
                  <label style={labelStyle}>Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {['Blockchain', 'DeFi', 'AI', 'Frontend', 'Backend', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Featured?</label>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.8rem 1rem', background: 'var(--bg2)',
                    border: `1px solid ${form.featured ? 'rgba(0,153,204,0.4)' : 'var(--border)'}`,
                    borderRadius: 8, cursor: 'pointer', transition: 'border-color 0.2s',
                    height: '100%',
                  }}>
                    <input
                      type="checkbox" checked={form.featured}
                      onChange={e => setForm({ ...form, featured: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.87rem', color: form.featured ? 'var(--accent)' : 'var(--text2)', fontWeight: form.featured ? 700 : 400, userSelect: 'none' }}>
                      {form.featured ? '★ Featured' : 'Not featured'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Feedback */}
              {error   && <div style={{ padding: '0.7rem 1rem', background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.2)', borderRadius: 8, color: 'var(--red)', fontSize: '0.83rem' }}>⚠️ {error}</div>}
              {success && <div style={{ padding: '0.7rem 1rem', background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)', borderRadius: 8, color: 'var(--green)', fontSize: '0.83rem' }}>✓ {success} Redirecting…</div>}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: '0.9rem', borderRadius: 10, border: 'none',
                  background: saving ? 'var(--border2)' : 'var(--accent)',
                  color: saving ? 'var(--text3)' : '#fff',
                  fontWeight: 700, fontSize: '0.9rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: "'Syne', sans-serif",
                  transition: 'all 0.2s',
                }}>
                  {saving ? 'Saving…' : '💾 Save Changes'}
                </button>
                <Link href="/admin" style={{
                  padding: '0.9rem 1.5rem', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text2)', fontWeight: 600, fontSize: '0.88rem',
                  display: 'inline-flex', alignItems: 'center',
                  transition: 'all 0.2s',
                }}>
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* Preview link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href={`/projects/${project.id}`} target="_blank" rel="noreferrer"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: 'var(--text3)', letterSpacing: '0.06em' }}>
              VIEW CURRENT PUBLIC PAGE ↗
            </a>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { overflow-x: hidden; }
        body { background: var(--bg); color: var(--text); }
        a { text-decoration: none; color: inherit; }
        @media (max-width: 580px) {
          .edit-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT id, title, description, tags, github, live, category, featured, created_at as "createdAt"
      FROM projects WHERE id = ${id} LIMIT 1
    `;
    if (rows.length === 0) return { props: { project: null } };
    const project = {
      ...rows[0],
      createdAt: rows[0].createdAt ? String(rows[0].createdAt).split('T')[0] : '',
    };
    return { props: { project } };
  } catch {
    return { props: { project: null } };
  }
};