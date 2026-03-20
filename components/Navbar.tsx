import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeContext';

const NAV_LINKS = [
  { href: '#about',    label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#projects', label: 'Projects' },
  { href: '#process',  label: 'Process' },
  { href: '#research', label: 'Research' },
  { href: '#contact',  label: 'Contact' },
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navBg = scrolled
    ? theme === 'dark' ? 'rgba(5,10,14,0.93)' : 'rgba(240,244,248,0.93)'
    : 'transparent';

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 2rem', height: 64,
        background: navBg,
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'background 0.3s ease, border-color 0.3s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--accent), var(--accent3))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.92rem', color: '#fff', flexShrink: 0,
          }}>AC</div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            Aditya<span style={{ color: 'var(--accent)' }}>.</span>dev
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="desk-nav" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} style={{ color: 'var(--text2)', fontSize: '0.87rem', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text2)')}
            >{label}</a>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Theme toggle */}
          <button onClick={toggle} aria-label="Toggle theme" title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            style={{
              width: 38, height: 38, borderRadius: 10,
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text2)', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text2)'; }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" className="hamburger-btn"
            style={{
              display: 'none', flexDirection: 'column', justifyContent: 'center',
              gap: 5, width: 38, height: 38,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 9, padding: '0 9px', cursor: 'pointer',
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: '100%', height: 2, background: 'var(--text)',
                borderRadius: 2, display: 'block', transition: 'all 0.3s',
                transform: i === 0 && menuOpen ? 'rotate(45deg) translateY(7px)'
                         : i === 2 && menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
                opacity: i === 1 && menuOpen ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 101, pointerEvents: menuOpen ? 'all' : 'none' }}>
        {/* Backdrop */}
        <div onClick={() => setMenuOpen(false)} style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          opacity: menuOpen ? 1 : 0,
          transition: 'opacity 0.3s',
          backdropFilter: 'blur(4px)',
        }} />

        {/* Drawer */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: 'min(300px, 86vw)',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
          paddingTop: 64,
          boxShadow: '-16px 0 50px rgba(0,0,0,0.35)',
        }}>
          {/* Nav links */}
          <div style={{ padding: '1.25rem 1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {NAV_LINKS.map(({ href, label }, i) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                padding: '0.8rem 1rem', fontSize: '1rem', fontWeight: 600,
                color: 'var(--text)', borderRadius: 10, display: 'block',
                transition: 'all 0.15s',
                animation: menuOpen ? `mobileSlide 0.28s ${i * 0.04}s ease both` : 'none',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg2)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
              >{label}</a>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '0.5rem 1.25rem' }} />

          <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button onClick={() => { toggle(); }} style={{
              padding: '0.8rem 1rem', fontSize: '0.88rem', fontWeight: 600,
              color: 'var(--text2)', borderRadius: 10,
              border: '1px solid var(--border)', background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.5rem', transition: 'background 0.15s',
            }}>
              {theme === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
            </button>
          </div>

          <div style={{ marginTop: 'auto', padding: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.68rem', color: 'var(--text3)', textAlign: 'center' }}>
              adityachotaliya9299@gmail.com
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .desk-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
        @keyframes mobileSlide {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}