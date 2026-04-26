import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { neon } from '@neondatabase/serverless';
import { useTheme } from '../../components/ThemeContext';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  category: string;
  reading_time: number;
  created_at: string;
}

interface Props { post: Post | null; }

const CAT_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  'GATE':       { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  'Blockchain': { color: 'var(--accent)', bg: 'rgba(0,153,204,0.1)', border: 'rgba(0,153,204,0.25)' },
  'DeFi':       { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.28)' },
  'Research':   { color: 'var(--green)', bg: 'rgba(5,150,105,0.1)', border: 'rgba(5,150,105,0.25)' },
  'General':    { color: 'var(--text2)', bg: 'var(--surface2)', border: 'var(--border)' },
};

// Render content — supports ## headings, **bold**, `code`, and paragraphs
function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} style={{ fontSize:'clamp(1.2rem,2.5vw,1.55rem)', fontWeight:800, marginTop:'2.5rem', marginBottom:'0.85rem', lineHeight:1.3, color:'var(--text)' }}>
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} style={{ fontSize:'clamp(1rem,2vw,1.2rem)', fontWeight:700, marginTop:'2rem', marginBottom:'0.65rem', color:'var(--text)' }}>
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].replace('- ', ''));
        i++;
      }
      i--;
      elements.push(
        <ul key={key++} style={{ paddingLeft:'1.5rem', marginBottom:'1.25rem', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
          {items.map((item, j) => (
            <li key={j} style={{ color:'var(--text2)', fontSize:'0.95rem', lineHeight:1.75 }}>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={key++} style={{
          borderLeft:'3px solid var(--accent)', paddingLeft:'1.25rem',
          margin:'1.5rem 0', color:'var(--text2)', fontStyle:'italic',
          fontSize:'1rem', lineHeight:1.8,
        }}>
          {line.replace('> ', '')}
        </blockquote>
      );
    } else if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={key++} style={{
          background:'var(--bg2)', border:'1px solid var(--border)',
          borderRadius:10, padding:'1.25rem 1.5rem', overflow:'auto',
          fontFamily:"'DM Mono', monospace", fontSize:'0.82rem',
          lineHeight:1.7, color:'var(--text2)', margin:'1.5rem 0',
        }}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
    } else if (line.trim() === '') {
      // skip blank lines between elements
    } else {
      elements.push(
        <p key={key++} style={{ color:'var(--text2)', fontSize:'0.95rem', lineHeight:1.85, marginBottom:'1.25rem' }}>
          {renderInline(line)}
        </p>
      );
    }
  }
  return elements;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color:'var(--text)', fontWeight:700 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.85em', padding:'0.15em 0.4em', background:'rgba(0,153,204,0.1)', border:'1px solid rgba(0,153,204,0.2)', borderRadius:4, color:'var(--accent)' }}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

export default function BlogPost({ post }: Props) {
  const { theme, toggle } = useTheme();

  if (!post) {
    return (
      <>
        <Head><title>Post Not Found — Aditya Chotaliya</title></Head>
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', fontFamily:"'Syne', sans-serif" }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📭</div>
            <h2 style={{ fontWeight:800, marginBottom:'0.75rem' }}>Post Not Found</h2>
            <Link href="/blog" style={{ color:'var(--accent)' }}>← Back to Blog</Link>
          </div>
        </div>
      </>
    );
  }

  const catStyle = CAT_COLORS[post.category] || CAT_COLORS.General;

  return (
    <>
      <Head>
        <title>{post.title} — Aditya Chotaliya</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={`${post.title} — Aditya Chotaliya`} />
        <meta property="og:description" content={post.excerpt} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Background */}
      <div style={{ position:'fixed', inset:0, zIndex:0, backgroundImage:`linear-gradient(rgba(0,153,204,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,153,204,0.025) 1px, transparent 1px)`, backgroundSize:'60px 60px', pointerEvents:'none' }} />
      <div style={{ position:'fixed', width:600, height:600, borderRadius:'50%', background:'var(--accent)', filter:'blur(150px)', opacity:0.04, top:-150, right:-150, zIndex:0, pointerEvents:'none' }} />

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
          <Link href="/blog" style={{ color:'var(--text2)', fontSize:'0.85rem', fontWeight:500, transition:'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='var(--accent)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='var(--text2)'}
          >← All Posts</Link>
          <button onClick={toggle} style={{ width:36, height:36, borderRadius:9, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text2)', fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            {theme==='dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* Article */}
      <div style={{ position:'relative', zIndex:1, paddingTop:'5rem', paddingBottom:'5rem', fontFamily:"'Syne', sans-serif" }}>
        <div style={{ maxWidth:760, margin:'0 auto', padding:'0 clamp(1rem,4vw,2rem)' }}>

          {/* Breadcrumb */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'1.5rem', marginBottom:'2rem', fontFamily:"'DM Mono', monospace", fontSize:'0.7rem', color:'var(--text3)' }}>
            <Link href="/" style={{ color:'var(--text3)', transition:'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='var(--accent)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='var(--text3)'}
            >Home</Link>
            <span>/</span>
            <Link href="/blog" style={{ color:'var(--text3)', transition:'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='var(--accent)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='var(--text3)'}
            >Blog</Link>
            <span>/</span>
            <span style={{ color:'var(--text2)' }}>{post.title}</span>
          </div>

          {/* Post header */}
          <div style={{ marginBottom:'2.5rem' }}>
            <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap' }}>
              <span style={{ display:'inline-flex', alignItems:'center', padding:'0.2rem 0.65rem', borderRadius:20, fontSize:'0.72rem', fontWeight:600, background:catStyle.bg, color:catStyle.color, border:`1px solid ${catStyle.border}` }}>
                {post.category}
              </span>
              <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--text3)' }}>
                {new Date(post.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
              </span>
              <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--text3)' }}>·</span>
              <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--text3)' }}>{post.reading_time} min read</span>
            </div>

            <h1 style={{ fontSize:'clamp(1.7rem,4vw,2.6rem)', fontWeight:800, lineHeight:1.2, marginBottom:'1.25rem' }}>
              {post.title}
            </h1>

            <p style={{ fontSize:'1.05rem', color:'var(--text2)', lineHeight:1.75, paddingBottom:'1.5rem', borderBottom:'1px solid var(--border)' }}>
              {post.excerpt}
            </p>
          </div>

          {/* Author card */}
          <div style={{ display:'flex', gap:'1rem', alignItems:'center', padding:'1rem 1.25rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, marginBottom:'3rem' }}>
            <div style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg, var(--accent), var(--accent3))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1rem', color:'#fff', flexShrink:0 }}>A</div>
            <div>
              <div style={{ fontWeight:700, fontSize:'0.9rem' }}>Aditya Chotaliya</div>
              <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--text3)', marginTop:2 }}>Blockchain Developer · GATE CSE AIR 61</div>
            </div>
          </div>

          {/* Content */}
          <article style={{ marginBottom:'3rem' }}>
            {renderContent(post.content)}
          </article>

          {/* Tags */}
          <div style={{ padding:'1.5rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, marginBottom:'2.5rem' }}>
            <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--text3)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'0.75rem' }}>Tags</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.45rem' }}>
              {post.tags.map(tag => (
                <span key={tag} style={{ padding:'0.3rem 0.75rem', background:'rgba(0,153,204,0.07)', border:'1px solid rgba(0,153,204,0.18)', borderRadius:6, fontFamily:"'DM Mono', monospace", fontSize:'0.75rem', color:'var(--accent)' }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ padding:'2rem', background:'linear-gradient(135deg, rgba(0,153,204,0.06), rgba(123,47,247,0.06))', border:'1px solid var(--border)', borderRadius:16, textAlign:'center', marginBottom:'2.5rem' }}>
            <h3 style={{ fontWeight:800, fontSize:'1.1rem', marginBottom:'0.5rem' }}>Want to work together?</h3>
            <p style={{ color:'var(--text2)', fontSize:'0.88rem', marginBottom:'1.25rem' }}>I&apos;m open to freelance blockchain projects, audits, and consulting.</p>
            <Link href="/#contact" style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.7rem 1.75rem', borderRadius:10, background:'var(--accent)', color:'#fff', fontWeight:700, fontSize:'0.88rem' }}>
              Get in Touch →
            </Link>
          </div>

          {/* Back */}
          <div style={{ textAlign:'center' }}>
            <Link href="/blog" style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 2rem', borderRadius:12, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text2)', fontWeight:600, fontSize:'0.9rem', transition:'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border2)'; (e.currentTarget as HTMLElement).style.color='var(--text)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.color='var(--text2)'; }}
            >← Back to Blog</Link>
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

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT * FROM blog_posts WHERE slug = ${slug} AND published = true LIMIT 1`;
    if (rows.length === 0) return { props: { post: null } };
    const p = rows[0] as Record<string, unknown>;
    return {
      props: {
        post: {
          ...p,
          created_at: p.created_at ? String(p.created_at) : '',
        },
      },
    };
  } catch {
    return { props: { post: null } };
  }
};