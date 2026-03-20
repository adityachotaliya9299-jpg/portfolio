import Head from 'next/head';
import Link from 'next/link';
import { useTheme } from '../components/ThemeContext';

export default function NotFound() {
  const { theme, toggle } = useTheme();

  return (
    <>
      <Head>
        <title>404 — Page Not Found | Aditya Chotaliya</title>
      </Head>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `linear-gradient(rgba(0,153,204,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,153,204,0.025) 1px, transparent 1px)`, backgroundSize: '60px 60px', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: 600, height: 600, borderRadius: '50%', background: 'var(--accent3)', filter: 'blur(140px)', opacity: 'var(--orb2-opacity)', bottom: -100, left: -100, zIndex: 0, pointerEvents: 'none' }} />

      {/* Theme toggle — top right */}
      <button onClick={toggle} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} style={{
        position: 'fixed', top: 20, right: 24, zIndex: 10,
        width: 40, height: 40, borderRadius: 10,
        border: '1px solid var(--border)', background: 'var(--surface)',
        color: 'var(--text2)', fontSize: '1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.2s',
      }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', position: 'relative', zIndex: 1, fontFamily: "'Syne', sans-serif",
      }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          {/* 404 glitch number */}
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 'clamp(6rem, 20vw, 10rem)',
            fontWeight: 800,
            lineHeight: 1,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            userSelect: 'none',
          }}>404</div>

          {/* Code block */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '2rem',
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: '0.75rem' }}>
              {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            </div>
            <pre style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.8rem', color: 'var(--text2)', margin: 0, lineHeight: 1.8 }}>
              <span style={{ color: 'var(--accent3)' }}>const</span>{' '}
              <span style={{ color: 'var(--text)' }}>page</span>{' '}
              <span style={{ color: 'var(--text2)' }}>= await</span>{' '}
              <span style={{ color: 'var(--accent)' }}>find</span>
              <span style={{ color: 'var(--text2)' }}>(</span>
              <span style={{ color: '#f5c518' }}>&quot;{typeof window !== 'undefined' ? window.location.pathname : '/unknown'}&quot;</span>
              <span style={{ color: 'var(--text2)' }}>);</span>
              {'\n'}
              <span style={{ color: 'var(--text3)' }}>// ❌ PageNotFoundError: route does not exist</span>
            </pre>
          </div>

          <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Page Not Found
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: '2rem' }}>
            This route doesn&apos;t exist on-chain.<br />
            Head back to the portfolio.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.75rem', borderRadius: 12,
              background: 'var(--accent)', color: '#fff',
              fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.15)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ''; (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              ← Back to Home
            </Link>
            <a href="#contact" onClick={() => window.location.href = '/#contact'} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.75rem', borderRadius: 12,
              background: 'var(--surface)', color: 'var(--text2)',
              border: '1px solid var(--border)',
              fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text2)'; }}
            >
              Contact Me
            </a>
          </div>

          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: 'var(--text3)', marginTop: '2.5rem', letterSpacing: '0.06em' }}>
            ADITYA CHOTALIYA · BLOCKCHAIN DEVELOPER
          </p>
        </div>
      </div>
    </>
  );
}