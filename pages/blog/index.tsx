import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { neon } from '@neondatabase/serverless';
import { useTheme } from '../../components/ThemeContext';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  category: string;
  published: boolean;
  reading_time: number;
  created_at: string;
}

interface Props { posts: Post[]; }

const CAT_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  'GATE':       { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  'Blockchain': { color: 'var(--accent)', bg: 'rgba(0,153,204,0.1)', border: 'rgba(0,153,204,0.25)' },
  'DeFi':       { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.28)' },
  'Research':   { color: 'var(--green)', bg: 'rgba(5,150,105,0.1)', border: 'rgba(5,150,105,0.25)' },
  'General':    { color: 'var(--text2)', bg: 'var(--surface2)', border: 'var(--border)' },
};

export default function BlogPage({ posts }: Props) {
  const { theme, toggle } = useTheme();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category)))];

  const filtered = posts
    .filter(p => filter === 'All' || p.category === filter)
    .filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
    });

  return (
    <>
      <Head>
        <title>Blog — Aditya Chotaliya</title>
        <meta name="description" content="Insights on blockchain development, DeFi protocols, GATE preparation, and research in adaptive market systems." />
        <meta property="og:title" content="Blog — Aditya Chotaliya" />
        <meta property="og:description" content="Blockchain, DeFi, GATE prep, and research insights by Aditya Chotaliya." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Background */}
      <div style={{ position:'fixed', inset:0, zIndex:0, backgroundImage:`linear-gradient(rgba(0,153,204,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,153,204,0.025) 1px, transparent 1px)`, backgroundSize:'60px 60px', pointerEvents:'none' }} />
      <div style={{ position:'fixed', width:600, height:600, borderRadius:'50%', background:'var(--accent)', filter:'blur(150px)', opacity:0.04, top:-150, right:-150, zIndex:0, pointerEvents:'none' }} />
      <div style={{ position:'fixed', width:500, height:500, borderRadius:'50%', background:'var(--accent3)', filter:'blur(140px)', opacity:0.05, bottom:-100, left:-100, zIndex:0, pointerEvents:'none' }} />

      {/* Navbar */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        height:60, padding:'0 2rem',
        background: theme==='dark' ? 'rgba(5,10,14,0.93)' : 'rgba(240,244,248,0.93)',
        backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        fontFamily:"'Syne', sans-serif",
      }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg, var(--accent), var(--accent3))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.8rem', color:'#fff' }}>AC</div>
          <span style={{ fontWeight:700, fontSize:'0.9rem' }}>Aditya<span style={{ color:'var(--accent)' }}>.</span>dev</span>
        </Link>
        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
          <Link href="/" style={{ color:'var(--text2)', fontSize:'0.85rem', fontWeight:500, transition:'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='var(--accent)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='var(--text2)'}
          >← Home</Link>
          <button onClick={toggle} style={{ width:36, height:36, borderRadius:9, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text2)', fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            {theme==='dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* Main */}
      <div style={{ position:'relative', zIndex:1, paddingTop:'5rem', paddingBottom:'5rem', fontFamily:"'Syne', sans-serif" }}>
        <div style={{ maxWidth:900, margin:'0 auto', padding:'0 clamp(1rem,4vw,2rem)' }}>

          {/* Header */}
          <div style={{ paddingTop:'1.5rem', marginBottom:'3rem' }}>
            <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.7rem', color:'var(--accent)', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'0.75rem' }}>Blog & Insights</div>
            <h1 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:800, lineHeight:1.1, marginBottom:'0.75rem' }}>
              Thoughts &amp; <span style={{ color:'var(--accent)' }}>Learnings</span>
            </h1>
            <p style={{ color:'var(--text2)', fontSize:'0.94rem', marginBottom:'2rem' }}>
              Blockchain development, DeFi protocols, GATE preparation, and research insights.
            </p>

            {/* Search + filter */}
            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center' }}>
              <div style={{ position:'relative', flex:1, minWidth:200, maxWidth:320 }}>
                <span style={{ position:'absolute', left:'0.85rem', top:'50%', transform:'translateY(-50%)', color:'var(--text3)', fontSize:'0.85rem', pointerEvents:'none' }}>🔍</span>
                <input type="text" placeholder="Search posts…" value={search} onChange={e => setSearch(e.target.value)}
                  style={{ width:'100%', padding:'0.6rem 1rem 0.6rem 2.4rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:9, color:'var(--text)', fontSize:'0.86rem', outline:'none', fontFamily:"'Syne', sans-serif", transition:'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor='var(--accent)'}
                  onBlur={e => e.currentTarget.style.borderColor='var(--border)'}
                />
              </div>
              <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setFilter(cat)} style={{
                    padding:'0.4rem 0.9rem', borderRadius:8, border:'1px solid',
                    borderColor: filter===cat ? 'var(--accent)' : 'var(--border)',
                    background: filter===cat ? 'rgba(0,153,204,0.1)' : 'transparent',
                    color: filter===cat ? 'var(--accent)' : 'var(--text3)',
                    fontSize:'0.8rem', fontWeight:600, cursor:'pointer',
                    fontFamily:"'Syne', sans-serif", transition:'all 0.2s',
                  }}>{cat}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Posts */}
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'5rem 1rem' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>📭</div>
              <h3 style={{ fontWeight:700, marginBottom:'0.5rem' }}>No posts found</h3>
              <p style={{ color:'var(--text3)', fontSize:'0.88rem' }}>Try a different search or filter.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              {filtered.map((post, i) => {
                const catStyle = CAT_COLORS[post.category] || CAT_COLORS.General;
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration:'none' }}>
                    <div style={{
                      padding:'2rem', background:'var(--surface)',
                      border:'1px solid var(--border)', borderRadius:16,
                      transition:'all 0.25s', display:'flex', gap:'2rem', alignItems:'flex-start',
                    }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='var(--border2)'; el.style.transform='translateY(-3px)'; el.style.boxShadow='0 16px 48px rgba(0,0,0,0.3)'; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='var(--border)'; el.style.transform=''; el.style.boxShadow=''; }}
                    >
                      {/* Number */}
                      <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'2.5rem', fontWeight:800, color:'var(--border2)', lineHeight:1, flexShrink:0, minWidth:48 }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>

                      <div style={{ flex:1, minWidth:0 }}>
                        {/* Meta row */}
                        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.75rem', flexWrap:'wrap' }}>
                          <span style={{ display:'inline-flex', alignItems:'center', padding:'0.18rem 0.6rem', borderRadius:20, fontSize:'0.7rem', fontWeight:600, background:catStyle.bg, color:catStyle.color, border:`1px solid ${catStyle.border}` }}>
                            {post.category}
                          </span>
                          <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--text3)' }}>
                            {new Date(post.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                          </span>
                          <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--text3)' }}>·</span>
                          <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--text3)' }}>{post.reading_time} min read</span>
                        </div>

                        {/* Title */}
                        <h2 style={{ fontSize:'clamp(1rem,2.5vw,1.3rem)', fontWeight:800, lineHeight:1.3, marginBottom:'0.6rem', color:'var(--text)' }}>
                          {post.title}
                        </h2>

                        {/* Excerpt */}
                        <p style={{ color:'var(--text2)', fontSize:'0.88rem', lineHeight:1.75, marginBottom:'1rem' }}>
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                          {post.tags.slice(0, 5).map(tag => (
                            <span key={tag} style={{ padding:'0.18rem 0.55rem', background:'rgba(0,153,204,0.07)', border:'1px solid rgba(0,153,204,0.18)', borderRadius:4, fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--accent)' }}>{tag}</span>
                          ))}
                        </div>
                      </div>

                      <div style={{ flexShrink:0, color:'var(--text3)', fontSize:'1.2rem', alignSelf:'center' }}>→</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Back */}
          <div style={{ textAlign:'center', marginTop:'3.5rem' }}>
            <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 2rem', borderRadius:12, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text2)', fontWeight:600, fontSize:'0.9rem', transition:'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border2)'; (e.currentTarget as HTMLElement).style.color='var(--text)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.color='var(--text2)'; }}
            >← Back to Portfolio</Link>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        html { overflow-x:hidden; }
        body { background:var(--bg); color:var(--text); }
        a { text-decoration:none; color:inherit; }
      `}</style>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const posts = await sql`
      SELECT id, title, slug, excerpt, tags, category, published, reading_time, created_at
      FROM blog_posts WHERE published = true ORDER BY created_at DESC
    `;
    return {
      props: {
        posts: posts.map((p: Record<string,unknown>) => ({
          ...p,
          created_at: p.created_at ? String(p.created_at) : '',
        })),
      },
    };
  } catch {
    return { props: { posts: [] } };
  }
};