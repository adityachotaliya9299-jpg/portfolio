import { GetServerSideProps } from 'next';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { neon } from '@neondatabase/serverless';
import { useTheme } from '../../../../components/ThemeContext';

interface Post {
  id: string; title: string; slug: string; excerpt: string;
  content: string; tags: string[]; category: string;
  reading_time: number; published: boolean; created_at: string;
}
interface Props { post: Post | null; }

const CATEGORIES = ['Blockchain', 'DeFi', 'GATE', 'Research', 'General', 'AI', 'Web3'];

export default function EditBlogPost({ post }: Props) {
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [form, setForm] = useState({
    title:        post?.title        || '',
    slug:         post?.slug         || '',
    excerpt:      post?.excerpt      || '',
    content:      post?.content      || '',
    tags:         post?.tags?.join(', ') || '',
    category:     post?.category     || 'Blockchain',
    reading_time: post?.reading_time || 5,
    published:    post?.published    || false,
  });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');
  const [preview, setPreview] = useState(false);

  if (!post) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', fontFamily:"'Syne', sans-serif" }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📭</div>
          <h2 style={{ fontWeight:800, marginBottom:'0.75rem' }}>Post Not Found</h2>
          <Link href="/admin?tab=blog" style={{ color:'var(--accent)' }}>← Back to Admin</Link>
        </div>
      </div>
    );
  }

  const handleSave = async (publish?: boolean) => {
    setSaving(true); setError(''); setSuccess('');
    const token = JSON.parse(localStorage.getItem('admin_session') || '{}').token || '';
    const published = publish !== undefined ? publish : form.published;
    try {
      const res = await fetch(`/api/blog?id=${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), published }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm(f => ({ ...f, published }));
        setSuccess('✓ Saved! Redirecting…');
        setTimeout(() => router.push('/admin?tab=blog'), 1200);
      } else { setError(data.error || 'Failed to save'); }
    } catch { setError('Network error'); }
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.8rem 1rem', background: 'var(--bg2)',
    border: '1px solid var(--border)', borderRadius: 8,
    color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
    width: '100%', fontFamily: "'Syne', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace", fontSize: '0.68rem',
    letterSpacing: '0.08em', color: 'var(--text2)',
    textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem',
  };

  return (
    <>
      <Head><title>Edit: {post.title} — Admin</title></Head>

      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:52, padding:'0 1.5rem', background:'var(--bg2)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', fontFamily:"'Syne', sans-serif" }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <Link href="/admin?tab=blog" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg, var(--accent), var(--accent3))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.72rem', color:'#fff' }}>AC</div>
            <span style={{ fontWeight:700, fontSize:'0.85rem' }}>Admin</span>
          </Link>
          <span style={{ color:'var(--border2)' }}>/</span>
          <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.7rem', color:'var(--accent)', letterSpacing:'0.08em' }}>EDIT POST</span>
        </div>
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          <button onClick={() => setPreview(!preview)} style={{ padding:'0.3rem 0.85rem', borderRadius:7, border:'1px solid var(--border)', background: preview?'rgba(0,153,204,0.1)':'transparent', color: preview?'var(--accent)':'var(--text3)', fontSize:'0.76rem', cursor:'pointer', fontFamily:"'Syne', sans-serif" }}>
            {preview ? '✏️ Edit' : '👁 Preview'}
          </button>
          <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" style={{ padding:'0.3rem 0.85rem', borderRadius:7, border:'1px solid var(--border)', color:'var(--text3)', fontSize:'0.76rem' }}>View Live ↗</a>
          <button onClick={toggle} style={{ width:32, height:32, borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text2)', fontSize:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            {theme==='dark'?'☀️':'🌙'}
          </button>
          <Link href="/admin?tab=blog" style={{ padding:'0.3rem 0.85rem', borderRadius:7, border:'1px solid var(--border)', color:'var(--text3)', fontSize:'0.76rem' }}>← Back</Link>
        </div>
      </nav>

      <div style={{ paddingTop:'4rem', paddingBottom:'4rem', minHeight:'100vh', background:'var(--bg)', fontFamily:"'Syne', sans-serif" }}>
        <div style={{ maxWidth: preview ? 760 : 900, margin:'0 auto', padding:'0 clamp(1rem,3vw,2rem)' }}>
          <div style={{ padding:'2rem 0 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.66rem', color:'var(--text3)', marginBottom:4 }}>ID: {post.id}</div>
              <h1 style={{ fontSize:'1.3rem', fontWeight:800 }}>{post.title}</h1>
            </div>
            <span style={{ padding:'0.25rem 0.75rem', borderRadius:20, fontSize:'0.72rem', fontWeight:600, background: form.published ? 'rgba(0,230,118,0.1)' : 'rgba(100,116,139,0.1)', border: form.published ? '1px solid rgba(0,230,118,0.3)' : '1px solid var(--border)', color: form.published ? 'var(--green)' : 'var(--text3)' }}>
              {form.published ? '● Published' : '○ Draft'}
            </span>
          </div>

          {preview ? (
            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'2.5rem' }}>
              <h1 style={{ fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:800, marginBottom:'0.75rem', lineHeight:1.2 }}>{form.title}</h1>
              <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem', fontFamily:"'DM Mono', monospace", fontSize:'0.7rem', color:'var(--text3)' }}>
                <span>{form.category}</span><span>·</span><span>{form.reading_time} min read</span>
              </div>
              {form.excerpt && <p style={{ color:'var(--text2)', fontSize:'1rem', lineHeight:1.75, marginBottom:'2rem', fontStyle:'italic' }}>{form.excerpt}</p>}
              <div style={{ color:'var(--text2)', fontSize:'0.95rem', lineHeight:1.85, whiteSpace:'pre-wrap' }}>{form.content}</div>
            </div>
          ) : (
            <div className="blog-edit-grid">
              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ ...inputStyle, fontSize:'1.05rem', fontWeight:600 }}
                    onFocus={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(0,153,204,0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Slug (URL)</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} style={{ ...inputStyle, fontFamily:"'DM Mono', monospace", fontSize:'0.82rem' }}
                    onFocus={e => { e.currentTarget.style.borderColor='var(--accent)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; }}
                  />
                  <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.65rem', color:'var(--text3)', marginTop:4 }}>adityachotaliya.vercel.app/blog/{form.slug}</div>
                </div>
                <div>
                  <label style={labelStyle}>Excerpt</label>
                  <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={3} style={{ ...inputStyle, resize:'vertical' }}
                    onFocus={e => { e.currentTarget.style.borderColor='var(--accent)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; }}
                  />
                </div>
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.4rem' }}>
                    <label style={{ ...labelStyle, marginBottom:0 }}>Content * (Markdown)</label>
                    <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.65rem', color:'var(--text3)' }}>## H2  **bold**  `code`  - list</span>
                  </div>
                  <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={22} style={{ ...inputStyle, resize:'vertical', fontFamily:"'DM Mono', monospace", fontSize:'0.83rem', lineHeight:1.7 }}
                    onFocus={e => { e.currentTarget.style.borderColor='var(--accent)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; }}
                  />
                </div>

                {error   && <div style={{ padding:'0.7rem 1rem', background:'rgba(255,77,77,0.08)', border:'1px solid rgba(255,77,77,0.2)', borderRadius:8, color:'var(--red)', fontSize:'0.82rem' }}>⚠️ {error}</div>}
                {success && <div style={{ padding:'0.7rem 1rem', background:'rgba(0,230,118,0.08)', border:'1px solid rgba(0,230,118,0.2)', borderRadius:8, color:'var(--green)', fontSize:'0.82rem' }}>{success}</div>}

                <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                  <button onClick={() => handleSave()} disabled={saving} style={{ flex:1, padding:'0.85rem', borderRadius:10, border:'none', background:saving?'var(--border2)':'var(--accent)', color:saving?'var(--text3)':'#fff', fontWeight:700, fontSize:'0.9rem', cursor:saving?'not-allowed':'pointer', fontFamily:"'Syne', sans-serif" }}>
                    {saving ? 'Saving…' : '💾 Save Changes'}
                  </button>
                  <button onClick={() => handleSave(!form.published)} disabled={saving} style={{ padding:'0.85rem 1.25rem', borderRadius:10, border:'1px solid var(--border)', background:'transparent', color:'var(--text2)', fontWeight:600, fontSize:'0.88rem', cursor:'pointer', fontFamily:"'Syne', sans-serif" }}>
                    {form.published ? '📥 Unpublish' : '🚀 Publish'}
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem', position:'sticky', top:64 }}>
                <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'1.25rem' }}>
                  <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'1rem' }}>Post Settings</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    <div>
                      <label style={labelStyle}>Category</label>
                      <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, cursor:'pointer' }}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Reading Time (mins)</label>
                      <input type="number" min={1} max={60} value={form.reading_time} onChange={e => setForm(f => ({ ...f, reading_time: parseInt(e.target.value)||5 }))} style={inputStyle}
                        onFocus={e => { e.currentTarget.style.borderColor='var(--accent)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Tags (comma-separated)</label>
                      <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Solidity, DeFi, GATE" style={inputStyle}
                        onFocus={e => { e.currentTarget.style.borderColor='var(--accent)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; }}
                      />
                      {form.tags && (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem', marginTop:'0.5rem' }}>
                          {form.tags.split(',').map(t=>t.trim()).filter(Boolean).map(tag => (
                            <span key={tag} style={{ padding:'0.15rem 0.5rem', background:'rgba(0,153,204,0.07)', border:'1px solid rgba(0,153,204,0.18)', borderRadius:4, fontFamily:"'DM Mono', monospace", fontSize:'0.65rem', color:'var(--accent)' }}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        html { overflow-x:hidden; }
        body { background:var(--bg); color:var(--text); }
        a { text-decoration:none; color:inherit; }
        .blog-edit-grid { display:grid; grid-template-columns:1fr 280px; gap:1.5rem; align-items:start; }
        @media(max-width:800px) { .blog-edit-grid { grid-template-columns:1fr !important; } }
      `}</style>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT * FROM blog_posts WHERE id = ${id} LIMIT 1`;
    if (rows.length === 0) return { props: { post: null } };
    const p = rows[0] as Record<string,unknown>;
    return { props: { post: { ...p, created_at: p.created_at ? String(p.created_at) : '' } } };
  } catch {
    return { props: { post: null } };
  }
};