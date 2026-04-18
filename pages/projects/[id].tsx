import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { neon } from '@neondatabase/serverless';
import { useTheme } from '../../components/ThemeContext';

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

const CAT_STYLE: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  DeFi:       { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.28)', icon: '💎' },
  Blockchain: { color: 'var(--accent)', bg: 'rgba(0,153,204,0.1)', border: 'rgba(0,153,204,0.25)', icon: '⛓️' },
  AI:         { color: 'var(--green)', bg: 'rgba(5,150,105,0.1)', border: 'rgba(5,150,105,0.25)', icon: '🤖' },
  Frontend:   { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)', icon: '🖥️' },
  Backend:    { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.25)', icon: '⚙️' },
};

function GHIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

export default function ProjectDetail({ project }: Props) {
  const { theme, toggle } = useTheme();

  if (!project) {
    return (
      <>
        <Head><title>Project Not Found</title></Head>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: "'Syne', sans-serif" }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h1 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Project Not Found</h1>
            <Link href="/#projects" style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>← Back to Projects</Link>
          </div>
        </div>
      </>
    );
  }

  const cat = CAT_STYLE[project.category] || CAT_STYLE.Blockchain;

  return (
    <>
      <Head>
        <title>{project.title} — Aditya Chotaliya</title>
        <meta name="description" content={project.description.slice(0, 160)} />
        <meta property="og:title" content={`${project.title} — Aditya Chotaliya`} />
        <meta property="og:description" content={project.description.slice(0, 160)} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `linear-gradient(rgba(0,153,204,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,153,204,0.025) 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: 600, height: 600, borderRadius: '50%', background: 'var(--accent)', filter: 'blur(150px)', opacity: 0.04, top: -150, right: -150, zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'var(--accent3)', filter: 'blur(140px)', opacity: 0.05, bottom: -100, left: -100, zIndex: 0, pointerEvents: 'none' }} />

      {/* Minimal top bar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 60, padding: '0 2rem',
        background: theme === 'dark' ? 'rgba(5,10,14,0.92)' : 'rgba(240,244,248,0.92)',
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
          <Link href="/#projects" style={{ color: 'var(--text2)', fontSize: '0.85rem', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text2)'}
          >← All Projects</Link>
          <button onClick={toggle} style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1, paddingTop: '5rem', paddingBottom: '5rem', fontFamily: "'Syne', sans-serif" }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 clamp(1rem,4vw,2rem)' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: 'var(--text3)' }}>
            <Link href="/" style={{ color: 'var(--text3)', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text3)'}
            >Home</Link>
            <span>/</span>
            <Link href="/#projects" style={{ color: 'var(--text3)', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text3)'}
            >Projects</Link>
            <span>/</span>
            <span style={{ color: 'var(--text2)' }}>{project.title}</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '2.5rem', animation: 'fadeInUp 0.7s ease forwards' }}>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.22rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
                {cat.icon} {project.category}
              </span>
              {project.featured && (
                <span style={{ fontSize: '0.7rem', color: 'var(--gold)', padding: '0.18rem 0.55rem', border: '1px solid rgba(180,83,9,0.3)', borderRadius: 4, fontWeight: 700 }}>★ Featured</span>
              )}
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: 'var(--text3)', marginLeft: 'auto' }}>{project.createdAt}</span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem' }}>
              {project.title}
            </h1>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a href={project.github} target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.7rem 1.5rem', borderRadius: 10,
                background: 'var(--accent)', color: '#fff',
                fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.15)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ''; (e.currentTarget as HTMLElement).style.transform = ''; }}
              >
                <GHIcon /> View on GitHub
              </a>
              {project.live && (
                <a href={project.live} target="_blank" rel="noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.7rem 1.5rem', borderRadius: 10,
                  border: '1.5px solid var(--accent)', color: 'var(--accent)',
                  fontWeight: 700, fontSize: '0.88rem', transition: 'all 0.2s', background: 'transparent',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,153,204,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.transform = ''; }}
                >
                  ↗ Live Demo
                </a>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, var(--accent), var(--accent3), transparent)', marginBottom: '2.5rem', opacity: 0.4 }} />

          {/* Description */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              About this project
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 'clamp(1.25rem,3vw,2rem)' }}>
              <p style={{ color: 'var(--text2)', fontSize: '0.97rem', lineHeight: 2, whiteSpace: 'pre-wrap' }}>
                {project.description}
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Tech Stack — {project.tags.length} technologies
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 'clamp(1.25rem,3vw,2rem)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {project.tags.map(tag => (
                  <span key={tag} style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '0.4rem 0.9rem',
                    background: 'rgba(0,153,204,0.07)',
                    border: '1px solid rgba(0,153,204,0.2)',
                    borderRadius: 8,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.78rem', color: 'var(--accent)',
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,153,204,0.14)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,153,204,0.4)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,153,204,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,153,204,0.2)'; }}
                  >{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Project Links */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Links
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href={project.github} target="_blank" rel="noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.5rem', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 12,
                transition: 'all 0.2s', textDecoration: 'none',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = ''; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', flexShrink: 0 }}>
                    <GHIcon />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>GitHub Repository</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'var(--text3)', marginTop: 2 }}>{project.github.replace('https://github.com/', '')}</div>
                  </div>
                </div>
                <span style={{ color: 'var(--text3)', fontSize: '1rem' }}>→</span>
              </a>

              {project.live && (
                <a href={project.live} target="_blank" rel="noreferrer" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem 1.5rem', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 12,
                  transition: 'all 0.2s', textDecoration: 'none',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = ''; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0,153,204,0.1)', border: '1px solid rgba(0,153,204,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: '1rem', flexShrink: 0 }}>↗</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Live Demo</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: 'var(--text3)', marginTop: 2 }}>{project.live}</div>
                    </div>
                  </div>
                  <span style={{ color: 'var(--text3)', fontSize: '1rem' }}>→</span>
                </a>
              )}
            </div>
          </div>

          {/* Back CTA */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link href="/#projects" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.8rem 2rem', borderRadius: 12,
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text2)', fontWeight: 600, fontSize: '0.9rem',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text2)'; }}
            >
              ← Back to All Projects
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { overflow-x: hidden; }
        body { background: var(--bg); color: var(--text); }
        a { text-decoration: none; color: inherit; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
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
      FROM projects
      WHERE id = ${id}
      LIMIT 1
    `;

    if (rows.length === 0) return { props: { project: null } };

    const project = {
      ...rows[0],
      createdAt: rows[0].createdAt.toISOString(),
    };

    return { props: { project } };

  } catch {
    return { props: { project: null } };
  }
};