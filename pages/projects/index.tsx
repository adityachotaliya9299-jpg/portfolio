import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { neon } from '@neondatabase/serverless';
import { useTheme } from '../../components/ThemeContext';

interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  tags: string[];
  github: string;
  live: string;
  category: string;
  featured: boolean;
  createdAt: string;
}

interface Props { projects: Project[]; }

const CAT_STYLE: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  DeFi:       { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.28)', icon: '💎' },
  Blockchain: { color: 'var(--accent)', bg: 'rgba(0,153,204,0.1)', border: 'rgba(0,153,204,0.25)', icon: '⛓️' },
  AI:         { color: 'var(--green)', bg: 'rgba(5,150,105,0.1)', border: 'rgba(5,150,105,0.25)', icon: '🤖' },
  Frontend:   { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)', icon: '🖥️' },
  Backend:    { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.25)', icon: '⚙️' },
};

function GHIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const cat = CAT_STYLE[project.category] || CAT_STYLE.Blockchain;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '1.75rem',
      display: 'flex', flexDirection: 'column', gap: '1rem',
      transition: 'all 0.25s', height: '100%',
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border2)'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 20px 50px rgba(0,0,0,0.35)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.transform = ''; el.style.boxShadow = ''; }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.18rem 0.55rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
            {cat.icon} {project.category}
          </span>
          {project.featured && (
            <span style={{ fontSize: '0.65rem', color: 'var(--gold)', padding: '0.12rem 0.45rem', border: '1px solid rgba(180,83,9,0.3)', borderRadius: 4, fontWeight: 700 }}>★ Featured</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
          {project.live && (
            <a href={project.live} target="_blank" rel="noreferrer" title="Live Demo"
              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text3)', fontSize: '0.8rem', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text3)'; }}>↗</a>
          )}
          <a href={project.github} target="_blank" rel="noreferrer" title="GitHub"
            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text3)', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text3)'; }}>
            <GHIcon />
          </a>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <Link href={`/projects/${project.id}`} target="_blank" rel="noreferrer">
          <h3 style={{ fontWeight: 700, fontSize: '0.97rem', marginBottom: '0.45rem', lineHeight: 1.35, transition: 'color 0.2s', color: 'var(--text)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
          >{project.title}</h3>
        </Link>
        <p style={{ color: 'var(--text2)', fontSize: '0.82rem', lineHeight: 1.72 }}>
          {project.shortDescription || (project.description.length > 150 ? project.description.slice(0, 150) + '…' : project.description)}
        </p>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {project.tags.slice(0, 5).map(tag => (
          <span key={tag} style={{ padding: '0.2rem 0.55rem', background: 'rgba(0,153,204,0.07)', border: '1px solid rgba(0,153,204,0.18)', borderRadius: 4, fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'var(--accent)' }}>{tag}</span>
        ))}
        {project.tags.length > 5 && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.66rem', color: 'var(--text3)', alignSelf: 'center' }}>+{project.tags.length - 5}</span>}
      </div>
    </div>
  );
}

export default function ProjectsPage({ projects }: Props) {
  const { theme, toggle } = useTheme();
  const [filter, setFilter]   = useState('All');
  const [search, setSearch]   = useState('');

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

  const filtered = projects
    .filter(p => filter === 'All' || p.category === filter)
    .filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    });

  return (
    <>
      <Head>
        <title>All Projects — Aditya Chotaliya</title>
        <meta name="description" content="All blockchain, DeFi, and Web3 projects built by Aditya Chotaliya — smart contracts, NFT ecosystems, DeFi protocols, and more." />
        <meta property="og:title" content="All Projects — Aditya Chotaliya" />
        <meta property="og:description" content="Blockchain developer portfolio — DeFi protocols, NFT ecosystems, smart contracts." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `linear-gradient(rgba(0,153,204,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,153,204,0.025) 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: 600, height: 600, borderRadius: '50%', background: 'var(--accent)', filter: 'blur(150px)', opacity: 0.04, top: -150, right: -150, zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'var(--accent3)', filter: 'blur(140px)', opacity: 0.05, bottom: -100, left: -100, zIndex: 0, pointerEvents: 'none' }} />

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 60, padding: '0 2rem',
        background: theme === 'dark' ? 'rgba(5,10,14,0.93)' : 'rgba(240,244,248,0.93)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: "'Syne', sans-serif",
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: '#fff' }}>AC</div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Aditya<span style={{ color: 'var(--accent)' }}>.</span>dev</span>
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'var(--text2)', fontSize: '0.85rem', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text2)'}
          >← Home</Link>
          <button onClick={toggle} style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* Main */}
      <div style={{ position: 'relative', zIndex: 1, paddingTop: '5rem', paddingBottom: '5rem', fontFamily: "'Syne', sans-serif" }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(1rem,4vw,2rem)' }}>

          {/* Page header */}
          <div style={{ marginBottom: '3rem', paddingTop: '1.5rem' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              All Projects
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1 }}>
                  What I&apos;ve <span style={{ color: 'var(--accent)' }}>Built</span>
                </h1>
                <p style={{ color: 'var(--text2)', fontSize: '0.94rem', marginTop: '0.75rem' }}>
                  {projects.length} projects — blockchain, DeFi, NFT, and Web3
                </p>
              </div>
            </div>

            {/* Search + Filter bar */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 340 }}>
                <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: '0.85rem', pointerEvents: 'none' }}>🔍</span>
                <input
                  type="text" placeholder="Search projects, tags…"
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.4rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text)', fontSize: '0.86rem', outline: 'none', fontFamily: "'Syne', sans-serif", transition: 'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Category filters */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setFilter(cat)} style={{
                    padding: '0.42rem 1rem', borderRadius: 8, border: '1px solid',
                    borderColor: filter === cat ? 'var(--accent)' : 'var(--border)',
                    background: filter === cat ? 'rgba(0,153,204,0.1)' : 'transparent',
                    color: filter === cat ? 'var(--accent)' : 'var(--text3)',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'Syne', sans-serif", transition: 'all 0.2s',
                  }}>{cat}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Results count */}
          {(search || filter !== 'All') && (
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: 'var(--text3)', marginBottom: '1.5rem', letterSpacing: '0.06em' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              {filter !== 'All' && ` in ${filter}`}
              {search && ` matching "${search}"`}
            </div>
          )}

          {/* Grid */}
          {filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No projects found</h3>
              <p style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>Try a different search or category.</p>
              <button onClick={() => { setSearch(''); setFilter('All'); }} style={{ marginTop: '1.5rem', padding: '0.65rem 1.5rem', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: '0.86rem' }}>
                Clear filters
              </button>
            </div>
          )}

          {/* Back link */}
          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text2)'; }}
            >← Back to Portfolio</Link>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { overflow-x: hidden; }
        body { background: var(--bg); color: var(--text); }
        a { text-decoration: none; color: inherit; }
        @media (max-width: 640px) {
          div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT id, title, description, tags, github, live, category, featured, created_at as "createdAt"
      FROM projects
      ORDER BY created_at DESC
    `;
    const projects = rows.map((p: Record<string, unknown>) => ({
      ...p,
      createdAt: p.createdAt ? String(p.createdAt).split('T')[0] : '',
    }));
    return { props: { projects } };
  } catch {
    return { props: { projects: [] } };
  }
};