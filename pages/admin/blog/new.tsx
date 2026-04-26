import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../../../components/ThemeContext';

const CATEGORIES = ['Blockchain', 'DeFi', 'GATE', 'Research', 'General', 'AI', 'Web3'];

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function NewBlogPost() {
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '',
    tags: '', category: 'Blockchain', reading_time: 5, published: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [preview, setPreview] = useState(false);

  // Auto-generate slug from title
  const handleTitle = (val: string) => {
    setForm(f => ({ ...f, title: val, slug: slugify(val) }));
  };

  const handleSave = async (publish: boolean) => {
    setSaving(true); setError('');
    const token = JSON.parse(localStorage.getItem('admin_session') || '{}').token || '';
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), published: publish }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/admin?tab=blog');
      } else {
        setError(data.error || 'Failed to create post');
      }
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
      <Head><title>New Blog Post — Admin</title></Head>

      {/* Navbar */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:52, padding:'0 1.5rem', background:'var(--bg2)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', fontFamily:"'Syne', sans-serif" }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <Link href="/admin?tab=blog" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <div style={{ width:28, height:28, borderRadius:7, background:'linear-gradient(135deg, var(--accent), var(--accent3))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.72rem', color:'#fff' }}>AC</div>
            <span style={{ fontWeight:700, fontSize:'0.85rem' }}>Admin</span>
          </Link>
          <span style={{ color:'var(--border2)' }}>/</span>
          <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.7rem', color:'var(--accent)', letterSpacing:'0.08em' }}>NEW POST</span>
        </div>
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          <button onClick={() => setPreview(!preview)} style={{ padding:'0.3rem 0.85rem', borderRadius:7, border:'1px solid var(--border)', background: preview ? 'rgba(0,153,204,0.1)' : 'transparent', color: preview ? 'var(--accent)' : 'var(--text3)', fontSize:'0.76rem', cursor:'pointer', fontFamily:"'Syne', sans-serif" }}>
            {preview ? '✏️ Edit' : '👁 Preview'}
          </button>
          <button onClick={toggle} style={{ width:32, height:32, borderRadius:8, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text2)', fontSize:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            {theme==='dark'?'☀️':'🌙'}
          </button>
          <Link href="/admin?tab=blog" style={{ padding:'0.3rem 0.85rem', borderRadius:7, border:'1px solid var(--border)', color:'var(--text3)', fontSize:'0.76rem' }}>← Back</Link>
        </div>
      </nav>

      <div style={{ paddingTop:'4rem', paddingBottom:'4rem', minHeight:'100vh', background:'var(--bg)', fontFamily:"'Syne', sans-serif" }}>
        <div style={{ maxWidth: preview ? 760 : 900, margin:'0 auto', padding:'0 clamp(1rem,3vw,2rem)' }}>

          {/* Page title */}
          <div style={{ padding:'2rem 0 1.5rem' }}>
            <h1 style={{ fontSize:'1.4rem', fontWeight:800 }}>✍️ New Blog Post</h1>
          </div>

          {preview ? (
            /* PREVIEW MODE */
            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'2.5rem' }}>
              <h1 style={{ fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:800, marginBottom:'0.75rem', lineHeight:1.2 }}>{form.title || 'Untitled Post'}</h1>
              <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem', flexWrap:'wrap', fontFamily:"'DM Mono', monospace", fontSize:'0.7rem', color:'var(--text3)' }}>
                <span>{form.category}</span><span>·</span><span>{form.reading_time} min read</span>
              </div>
              {form.excerpt && <p style={{ color:'var(--text2)', fontSize:'1rem', lineHeight:1.75, marginBottom:'2rem', paddingBottom:'1.5rem', borderBottom:'1px solid var(--border)', fontStyle:'italic' }}>{form.excerpt}</p>}
              <div style={{ color:'var(--text2)', fontSize:'0.95rem', lineHeight:1.85, whiteSpace:'pre-wrap' }}>{form.content}</div>
            </div>
          ) : (
            /* EDIT MODE */
            <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'1.5rem', alignItems:'start' }} className="blog-edit-grid">
              {/* Main form */}
              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input value={form.title} onChange={e => handleTitle(e.target.value)} placeholder="How I Scored AIR 61 in GATE CS..." style={{ ...inputStyle, fontSize:'1.1rem', fontWeight:600 }}
                    onFocus={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(0,153,204,0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Slug (URL) *</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="how-i-scored-air-61-gate-cs" style={{ ...inputStyle, fontFamily:"'DM Mono', monospace", fontSize:'0.82rem' }}
                    onFocus={e => { e.currentTarget.style.borderColor='var(--accent)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; }}
                  />
                  <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.66rem', color:'var(--text3)', marginTop:4 }}>adityachotaliya.vercel.app/blog/{form.slug || 'your-slug'}</div>
                </div>
                <div>
                  <label style={labelStyle}>Excerpt (shown in blog list) *</label>
                  <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={3} placeholder="A short summary of what this post covers..." style={{ ...inputStyle, resize:'vertical' }}
                    onFocus={e => { e.currentTarget.style.borderColor='var(--accent)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; }}
                  />
                </div>
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.4rem' }}>
                    <label style={{ ...labelStyle, marginBottom:0 }}>Content * (Markdown supported)</label>
                    <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.65rem', color:'var(--text3)' }}>## H2  ### H3  **bold**  `code`  - list  {'>'} quote</span>
                  </div>
                  <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={22}
                    placeholder="## Introduction&#10;&#10;Write your post here...&#10;&#10;## Section Title&#10;&#10;Your content...&#10;&#10;- List item&#10;- Another item&#10;&#10;> A blockquote&#10;&#10;```&#10;// Code block&#10;```"
                    style={{ ...inputStyle, resize:'vertical', fontFamily:"'DM Mono', monospace", fontSize:'0.83rem', lineHeight:1.7 }}
                    onFocus={e => { e.currentTarget.style.borderColor='var(--accent)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; }}
                  />
                </div>

                {error && <div style={{ padding:'0.7rem 1rem', background:'rgba(255,77,77,0.08)', border:'1px solid rgba(255,77,77,0.2)', borderRadius:8, color:'var(--red)', fontSize:'0.82rem' }}>⚠️ {error}</div>}

                {/* Action buttons */}
                <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                  <button onClick={() => handleSave(true)} disabled={saving || !form.title || !form.slug || !form.content} style={{ flex:1, padding:'0.85rem', borderRadius:10, border:'none', background:(!form.title||!form.content||saving)?'var(--border2)':'var(--accent)', color:(!form.title||!form.content||saving)?'var(--text3)':'#fff', fontWeight:700, fontSize:'0.9rem', cursor:(!form.title||!form.content||saving)?'not-allowed':'pointer', fontFamily:"'Syne', sans-serif" }}>
                    {saving ? 'Publishing…' : '🚀 Publish Post'}
                  </button>
                  <button onClick={() => handleSave(false)} disabled={saving || !form.title || !form.slug || !form.content} style={{ padding:'0.85rem 1.5rem', borderRadius:10, border:'1px solid var(--border)', background:'transparent', color:'var(--text2)', fontWeight:600, fontSize:'0.9rem', cursor:'pointer', fontFamily:"'Syne', sans-serif" }}>
                    💾 Save Draft
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
                      <input type="number" min={1} max={60} value={form.reading_time} onChange={e => setForm(f => ({ ...f, reading_time: parseInt(e.target.value) || 5 }))} style={inputStyle}
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
                          {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                            <span key={tag} style={{ padding:'0.15rem 0.5rem', background:'rgba(0,153,204,0.07)', border:'1px solid rgba(0,153,204,0.18)', borderRadius:4, fontFamily:"'DM Mono', monospace", fontSize:'0.66rem', color:'var(--accent)' }}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Markdown cheatsheet */}
                <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'1.25rem' }}>
                  <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'0.85rem' }}>Markdown Guide</div>
                  {[
                    ['## Heading 2', 'Big section'],
                    ['### Heading 3', 'Sub section'],
                    ['**bold text**', 'Bold'],
                    ['`inline code`', 'Code'],
                    ['- item', 'List item'],
                    ['> blockquote', 'Quote'],
                    ['``` ... ```', 'Code block'],
                  ].map(([syntax, desc]) => (
                    <div key={syntax} style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.4rem' }}>
                      <code style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--accent)' }}>{syntax}</code>
                      <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.65rem', color:'var(--text3)' }}>{desc}</span>
                    </div>
                  ))}
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
        .blog-edit-grid { display:grid; grid-template-columns:1fr 300px; gap:1.5rem; }
        @media(max-width:800px) { .blog-edit-grid { grid-template-columns:1fr !important; } }
      `}</style>
    </>
  );
}