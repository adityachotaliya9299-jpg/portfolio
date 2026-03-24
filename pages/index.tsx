import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useTheme } from '../components/ThemeContext';
import { neon } from '@neondatabase/serverless';


interface Project {
  id: string; title: string; description: string;
  tags: string[]; github: string; live: string;
  category: string; featured: boolean; createdAt: string;
}
interface Props { projects: Project[]; }

const SKILLS = [
  { group: 'Blockchain',   emoji: '⛓️', items: ['Solidity', 'Foundry', 'Hardhat', 'EVM', 'OpenZeppelin', 'Chainlink', 'ERC-721A', 'ERC-20'] },
  { group: 'DeFi & Web3', emoji: '💎', items: ['Smart Contracts', 'thirdweb', 'ethers.js', 'IPFS', 'Merkle Trees', 'DAO Governance', 'DeFi Protocols', 'UUPS Proxy'] },
  { group: 'Frontend',     emoji: '🖥️', items: ['Next.js', 'React', 'TypeScript', 'CSS Modules', 'Tailwind CSS', 'Recharts'] },
  { group: 'Backend',      emoji: '⚙️', items: ['Node.js', 'Express.js', 'PostgreSQL', 'REST APIs', 'JWT Auth', 'WebSockets'] },
  { group: 'Research',     emoji: '📖', items: ['Algorithmic Trading', 'Market Microstructure', 'Adaptive Systems', 'Financial Modeling', 'Statistical Analysis'] },
];

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
      padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem',
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, transition: 'all 0.25s', height: '100%',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 50px var(--shadow)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = '';
      }}
    >
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
            <a href={project.live} target="_blank" rel="noreferrer" title="Live Demo" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text3)', fontSize: '0.8rem', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text3)'; }}>↗</a>
          )}
          <a href={project.github} target="_blank" rel="noreferrer" title="GitHub" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text3)', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text3)'; }}>
            <GHIcon />
          </a>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.97rem', marginBottom: '0.45rem', lineHeight: 1.35 }}>{project.title}</h3>
        <p style={{ color: 'var(--text2)', fontSize: '0.82rem', lineHeight: 1.72 }}>
          {project.description.length > 175 ? project.description.slice(0, 175) + '…' : project.description}
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {project.tags.slice(0, 5).map(tag => <span key={tag} className="tag">{tag}</span>)}
        {project.tags.length > 5 && <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text3)', alignSelf: 'center' }}>+{project.tags.length - 5}</span>}
      </div>
    </div>
  );
}

export default function Home({ projects }: Props) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];
  const filtered = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  const isDark = theme === 'dark';
  const orb1bg = isDark ? 'var(--accent)' : 'var(--accent)';
  const orb2bg = isDark ? 'var(--accent3)' : 'var(--accent3)';

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault(); setSending(true); setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { setSent(true); setForm({ name: '', email: '', subject: '', message: '' }); }
      else setError('Something went wrong. Please try again.');
    } catch { setError('Network error.'); }
    setSending(false);
  };

  return (
    <>
      <Head>
        <title>Aditya Chotaliya — Blockchain Developer</title>
        <meta name="description" content="Full-stack blockchain developer specializing in Solidity, DeFi protocols, NFT ecosystems, and Web3 applications." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Background grid */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(rgba(0,153,204,var(--grid-opacity)) 1px, transparent 1px), linear-gradient(90deg, rgba(0,153,204,var(--grid-opacity)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px', pointerEvents: 'none',
      }} />
      <div style={{ position: 'fixed', width: 650, height: 650, borderRadius: '50%', background: orb1bg, filter: 'blur(150px)', opacity: 'var(--orb1-opacity)', top: -200, right: -150, zIndex: 0, pointerEvents: 'none', transition: 'opacity 0.4s' }} />
      <div style={{ position: 'fixed', width: 550, height: 550, borderRadius: '50%', background: orb2bg, filter: 'blur(140px)', opacity: 'var(--orb2-opacity)', bottom: -150, left: -100, zIndex: 0, pointerEvents: 'none', transition: 'opacity 0.4s' }} />

      <Navbar />

      <div className="page">

        {/* ═══════════ HERO ═══════════ */}
        <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '5rem' }}>
          <div className="container" style={{ width: '100%' }}>
            <div className="hero-grid">
              {/* Left */}
              <div style={{ animation: 'fadeInUp 0.8s ease forwards' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
                  <span className="status-dot" />
                  <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text2)', letterSpacing: '0.15em' }}>AVAILABLE FOR FREELANCE WORK</span>
                </div>

                <h1 style={{ fontSize: 'clamp(2.6rem, 8vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: '1rem' }}>
                  Aditya<br />
                  <span style={{ color: 'var(--accent)' }}>Chotaliya</span>
                </h1>

                <p style={{ fontSize: 'clamp(0.92rem, 2.5vw, 1.05rem)', color: 'var(--text2)', lineHeight: 1.78, maxWidth: 500, marginBottom: '2rem' }}>
                  I help startups and teams ship <span style={{ color: 'var(--text)', fontWeight: 600 }}>audited smart contracts, DeFi protocols, and NFT ecosystems</span> — from architecture to mainnet deployment.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                  <a href="#services" className="btn btn-primary">See Services →</a>
                  <a href="#contact" className="btn btn-outline">Get a Quote</a>
                  <a href="https://github.com/adityachotaliya9299-jpg" target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <GHIcon /> GitHub
                  </a>
                </div>

                <div style={{ display: 'flex', gap: 'clamp(1.5rem, 4vw, 2.5rem)', flexWrap: 'wrap' }}>
                  {[['6+', 'Projects Built'], ['1+', 'Yrs Web3'], ['61', 'GATE 2026 AIR'], ['1', 'Research Paper']].map(([n, l]) => (
                    <div key={l}>
                      <div style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{n}</div>
                      <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text3)', letterSpacing: '0.08em', marginTop: 3 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: code card */}
              <div className="hero-card-wrap" style={{ animation: 'fadeInUp 1s 0.2s ease both' }}>
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: '1.5rem',
                  boxShadow: '0 40px 80px var(--shadow)',
                }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
                    {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
                  </div>
                  <pre className="mono" style={{ fontSize: 'clamp(0.68rem, 1.8vw, 0.78rem)', color: 'var(--text2)', lineHeight: 1.85 }}>
{`// `}<span style={{ color: 'var(--text3)' }}>Blockchain Engineer</span>{`
`}<span style={{ color: 'var(--accent3)' }}>const</span>{` dev = {
  `}<span style={{ color: 'var(--accent)' }}>name</span>{`: `}<span style={{ color: 'var(--gold)' }}>"Aditya"</span>{`,
  `}<span style={{ color: 'var(--accent)' }}>chain</span>{`: `}<span style={{ color: 'var(--gold)' }}>"Ethereum"</span>{`,
  `}<span style={{ color: 'var(--accent)' }}>stack</span>{`: [
    `}<span style={{ color: 'var(--gold)' }}>"Solidity"</span>{`,
    `}<span style={{ color: 'var(--gold)' }}>"Foundry"</span>{`,
    `}<span style={{ color: 'var(--gold)' }}>"Next.js"</span>{`
  ],
  `}<span style={{ color: 'var(--accent)' }}>open</span>{`: `}<span style={{ color: 'var(--green)' }}>true
</span>{`}`}
                  </pre>
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.9rem 1.1rem', display: 'flex', gap: '0.65rem', alignItems: 'center', marginTop: '0.9rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>📍</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>Available worldwide</div>
                    <div className="mono" style={{ color: 'var(--text3)', fontSize: '0.68rem', marginTop: 1 }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ ABOUT ═══════════ */}
        <section id="about" className="section">
          <div className="container">
            <div className="divider" style={{ marginBottom: '4rem' }} />
            <div className="two-col">
              <div>
                <div className="section-label">01 / about</div>
                <h2 className="section-title">Building the<br /><span style={{ color: 'var(--accent)' }}>Decentralized</span> Future</h2>
                <p style={{ color: 'var(--text2)', lineHeight: 1.85, marginBottom: '1.2rem', fontSize: '0.94rem' }}>
                  I&apos;m a full-stack blockchain developer focused on Ethereum smart contracts, DeFi protocol design, and NFT ecosystems. I build production-ready systems combining on-chain security with seamless Web3 UX.
                </p>
                <p style={{ color: 'var(--text2)', lineHeight: 1.85, marginBottom: '2rem', fontSize: '0.94rem' }}>
                  Beyond code, I research the intersection of AI and financial systems. My MARL paper on <em style={{ color: 'var(--text)', fontStyle: 'normal', fontWeight: 600 }}>Adaptive Market Equilibrium</em> and back-to-back top-200 GATE CS ranks reflect a strong foundation in computer science and algorithmic thinking.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <a href="https://github.com/adityachotaliya9299-jpg" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '0.6rem 1.2rem' }}>GitHub ↗</a>
                  <a href="#contact" className="btn btn-ghost" style={{ fontSize: '0.82rem', padding: '0.6rem 1.2rem' }}>Let&apos;s Talk</a>
                </div>
              </div>

              <div className="about-cards">
                {[
                  { icon: '⛓️', label: 'Smart Contracts', desc: 'Production Solidity with Foundry' },
                  { icon: '💎', label: 'DeFi Protocols', desc: 'Stablecoins, staking, DAO governance' },
                  { icon: '🖼️', label: 'NFT Ecosystems', desc: 'ERC-721A, royalties, metadata' },
                  { icon: '📖', label: 'Research', desc: 'Adaptive market equilibrium' },
                ].map(item => (
                  <div key={item.label} style={{
                    padding: '1.4rem', background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: 12, transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = ''; }}
                  >
                    <div style={{ fontSize: '1.6rem', marginBottom: '0.65rem' }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, marginBottom: '0.3rem', fontSize: '0.88rem' }}>{item.label}</div>
                    <div style={{ color: 'var(--text3)', fontSize: '0.76rem', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                ))}
              </div>

              {/* GATE Achievements */}
              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>
                  🏆 GATE CS Achievements
                </div>
                <div className="gate-cards">
                  {[
                    { year: 'GATE 2026', air: 'AIR 61', score: '914', marks: '70.9 / 100', institute: 'IIT Guwahati', pdf: '/gate-2026.pdf', highlight: true },
                    { year: 'GATE 2025', air: 'AIR 154', score: '853', marks: '78.64 / 100', institute: 'IIT Roorkee', pdf: '/gate-2025.pdf', highlight: false },
                  ].map(g => (
                    <div key={g.year} style={{
                      padding: '1.1rem 1.25rem',
                      background: g.highlight ? 'linear-gradient(135deg, rgba(0,153,204,0.08), rgba(123,47,247,0.06))' : 'var(--surface)',
                      border: `1px solid ${g.highlight ? 'rgba(0,153,204,0.3)' : 'var(--border)'}`,
                      borderRadius: 12, transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px var(--shadow)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                        <div>
                          <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text3)', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{g.year} · {g.institute}</div>
                          <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--accent)', lineHeight: 1 }}>{g.air}</div>
                        </div>
                        {g.highlight && (
                          <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--gold)', padding: '0.15rem 0.5rem', border: '1px solid rgba(180,83,9,0.3)', borderRadius: 4 }}>★ Best</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                        <div>
                          <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score</div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)' }}>{g.score}</div>
                        </div>
                        <div>
                          <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Marks</div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)' }}>{g.marks}</div>
                        </div>
                        <div>
                          <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Paper</div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)' }}>CS</div>
                        </div>
                      </div>
                      <a href={g.pdf} target="_blank" rel="noreferrer" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.3rem 0.7rem', borderRadius: 6,
                        border: '1px solid var(--border)', background: 'var(--bg2)',
                        color: 'var(--text3)', fontSize: '0.72rem', fontWeight: 600,
                        transition: 'all 0.15s',
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text3)'; }}
                      >
                        📄 View Scorecard
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ SERVICES ═══════════ */}
        <section id="services" className="section">
          <div className="container">
            <div className="section-label">02 / services</div>
            <h2 className="section-title">What I <span style={{ color: 'var(--accent)' }}>Offer</span></h2>
            <p style={{ color: 'var(--text2)', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: 580, marginBottom: '3rem' }}>
              End-to-end blockchain engineering — from whitepaper to mainnet deployment. Here&apos;s what I can build for you.
            </p>

            <div className="services-grid">
              {[
                { icon: '📜', title: 'Smart Contract Development', desc: 'Production-grade Solidity contracts with Foundry. ERC-20, ERC-721, ERC-1155, custom protocols — fully tested and gas-optimized.', tags: ['Solidity', 'Foundry', 'OpenZeppelin', 'Gas Optimization'] },
                { icon: '🔍', title: 'Smart Contract Auditing', desc: 'Manual security review covering reentrancy, access control, integer overflow, front-running, and logic flaws. Delivered with a written report.', tags: ['Security Review', 'Slither', 'Echidna', 'Audit Report'] },
                { icon: '💎', title: 'DeFi Protocol Development', desc: 'AMMs, lending markets, staking systems, algorithmic stablecoins, DAO governance, and yield strategies — built with DeFi-grade rigor.', tags: ['AMM', 'Staking', 'Stablecoins', 'Chainlink', 'DAO'] },
                { icon: '🖼️', title: 'NFT Systems', desc: 'Full NFT ecosystems: ERC-721A collections, Merkle-tree whitelists, on-chain metadata, staking, revenue sharing, royalties, and Discord bots.', tags: ['ERC-721A', 'Merkle Tree', 'IPFS', 'Metadata', 'Discord Bot'] },
                { icon: '🌐', title: 'Web3 Frontend Integration', desc: 'Connect any smart contract to a polished Next.js frontend. Wallet connectivity, real-time on-chain data, thirdweb / ethers.js, and full UX.', tags: ['Next.js', 'ethers.js', 'thirdweb', 'wagmi', 'TypeScript'] },
                { icon: '⚙️', title: 'Backend & API Development', desc: 'REST APIs, JWT auth, webhook systems, IPFS integrations, PostgreSQL — the off-chain infrastructure your Web3 app needs.', tags: ['Node.js', 'PostgreSQL', 'REST API', 'IPFS', 'JWT'] },
              ].map(svc => (
                <div key={svc.title} style={{
                  padding: '1.75rem', background: 'var(--surface)',
                  border: '1px solid var(--border)', borderRadius: 14,
                  display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.25s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px var(--shadow)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                >
                  <div style={{ fontSize: '2rem' }}>{svc.icon}</div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{svc.title}</h3>
                    <p style={{ color: 'var(--text2)', fontSize: '0.83rem', lineHeight: 1.72 }}>{svc.desc}</p>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: 'auto' }}>
                    {svc.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>

            {/* Tech stack compact */}
            <div style={{ marginTop: '3rem' }}>
              <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Full Tech Stack</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {SKILLS.map(group => (
                  <div key={group.group} style={{ padding: '1rem 1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>{group.emoji}</span>
                      <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{group.group}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {group.items.map(skill => <span key={skill} className="tag">{skill}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ PROJECTS ═══════════ */}
        <section id="projects" className="section">
          <div className="container">
            <div className="divider" style={{ marginBottom: '4rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="section-label">03 / projects</div>
                <h2 className="section-title" style={{ marginBottom: 0 }}>What I&apos;ve <span style={{ color: 'var(--accent)' }}>Built</span></h2>
              </div>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setFilter(cat)} style={{
                    padding: '0.42rem 1rem', borderRadius: 8, border: '1px solid',
                    borderColor: filter === cat ? 'var(--accent)' : 'var(--border)',
                    background: filter === cat ? 'rgba(0,153,204,0.1)' : 'transparent',
                    color: filter === cat ? 'var(--accent)' : 'var(--text3)',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  }}>{cat}</button>
                ))}
              </div>
            </div>
            <div className="projects-grid">
              {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          </div>
        </section>

        {/* ═══════════ PROCESS ═══════════ */}
        <section id="process" className="section">
          <div className="container">
            <div className="divider" style={{ marginBottom: '4rem' }} />
            <div className="two-col" style={{ alignItems: 'start', gap: 'clamp(2rem,5vw,5rem)' }}>
              <div>
                <div className="section-label">04 / process</div>
                <h2 className="section-title">How I <span style={{ color: 'var(--accent)' }}>Work</span></h2>
                <p style={{ color: 'var(--text2)', fontSize: '0.94rem', lineHeight: 1.8 }}>
                  A structured, transparent workflow that keeps you in control at every step — from the first call to mainnet deployment.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { num: '01', title: 'Requirement Discussion', desc: 'We align on goals, scope, timeline, and budget. I ask the right questions so nothing is ambiguous before work begins.' },
                  { num: '02', title: 'Architecture Design', desc: 'Written technical design — contract structure, data flow, security model, and integration points — before a single line of code.' },
                  { num: '03', title: 'Development', desc: 'Iterative, well-commented Solidity + frontend code. You get repo access and can review progress at any time.' },
                  { num: '04', title: 'Testing & Audit', desc: 'Full Foundry test suite (unit + fuzz + invariant), manual security review, and static analysis. Every edge case covered.' },
                  { num: '05', title: 'Deployment & Handoff', desc: 'Mainnet/testnet deployment, verified contracts, full documentation, and a walkthrough call so you own everything.' },
                ].map((step, i, arr) => (
                  <div key={step.num} style={{ display: 'flex', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono, monospace', fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>{step.num}</div>
                      {i < arr.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 24, background: 'var(--border)', margin: '4px 0' }} />}
                    </div>
                    <div style={{ paddingBottom: i < arr.length - 1 ? '1.6rem' : '0', paddingTop: '0.45rem' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '0.97rem', marginBottom: '0.35rem' }}>{step.title}</h4>
                      <p style={{ color: 'var(--text2)', fontSize: '0.83rem', lineHeight: 1.75 }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ RESEARCH ═══════════ */}
        <section id="research" className="section">
          <div className="container">
            <div className="divider" style={{ marginBottom: '4rem' }} />
            <div className="section-label">05 / research</div>
            <h2 className="section-title">Academic <span style={{ color: 'var(--accent)' }}>Work</span></h2>

            <div style={{ padding: 'clamp(1.5rem,4vw,2.5rem)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: 'clamp(1rem,4vw,2.5rem)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: 72, height: 90, background: 'linear-gradient(145deg, var(--accent3), var(--accent))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.9rem', flexShrink: 0, boxShadow: '0 8px 30px rgba(123,47,247,0.25)' }}>📄</div>
                <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ padding: '0.18rem 0.6rem', borderRadius: 4, background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.25)', color: 'var(--green)', fontSize: '0.68rem', fontWeight: 600 }}>Research Paper</span>
                    <span style={{ padding: '0.18rem 0.6rem', borderRadius: 4, background: 'rgba(123,47,247,0.1)', border: '1px solid rgba(123,47,247,0.25)', color: 'var(--accent3)', fontSize: '0.68rem', fontWeight: 600 }}>AI / ML</span>
                    <span style={{ padding: '0.18rem 0.6rem', borderRadius: 4, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', color: '#38bdf8', fontSize: '0.68rem', fontWeight: 600 }}>MARL</span>
                    <span className="mono" style={{ color: 'var(--text3)', fontSize: '0.68rem' }}>2026</span>
                  </div>

                  <h3 style={{ fontSize: 'clamp(1.05rem,2.5vw,1.3rem)', fontWeight: 800, marginBottom: '0.8rem', lineHeight: 1.35 }}>
                    Adaptive Market Equilibrium:{' '}
                    <span style={{ color: 'var(--accent)' }}>A Multi-Agent Reinforcement Learning Approach to Sustainable Market Simulation</span>
                  </h3>

                  <p style={{ color: 'var(--text2)', lineHeight: 1.82, fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                    This study applies <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Multi-Agent Reinforcement Learning (MARL)</strong> to simulate sustainable market ecosystems with three classes of intelligent agents — consumers, producers, and regulators. Using <strong style={{ color: 'var(--text)', fontWeight: 600 }}>DQN, PPO, and Actor-Critic</strong> algorithms, we evaluate agent performance across cumulative reward, adaptability, price volatility, and systemic stability. Key finding: <strong style={{ color: 'var(--text)', fontWeight: 600 }}>DQN emerged as the most adaptable and consistently effective algorithm</strong> under complex, uncertain conditions, while PPO underperformed in dynamic scenarios. The work proposes MARL as an AI-driven path to fair, self-regulating economic systems.
                  </p>

                  <div style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10 }}>
                    <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Research Questions</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {[
                        'Which MARL algorithm performs best in cumulative reward and market adaptability?',
                        'How stable are simulated market conditions over long time horizons?',
                        'Are traditional volatility measures adequate for agent-based market simulations?',
                        'What are the real-world implications for market stimulation strategies?',
                      ].map((q, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 700, flexShrink: 0, marginTop: '0.05rem' }}>RQ{i + 1}</span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.6 }}>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    {['MARL', 'DQN', 'PPO', 'Actor-Critic', 'Python', 'Market Simulation', 'Reinforcement Learning', 'Economic Agents', 'Sustainability'].map(t => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <a href="https://github.com/adityachotaliya9299-jpg/adaptive-market-equilibrium" target="_blank" rel="noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: 9, background: 'var(--accent)', color: '#fff', fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.15)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ''; (e.currentTarget as HTMLElement).style.transform = ''; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      View on GitHub
                    </a>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', borderRadius: 9, background: 'rgba(180,83,9,0.08)', border: '1px solid rgba(180,83,9,0.22)', color: 'var(--gold)', fontSize: '0.82rem', fontWeight: 600 }}>
                      🐍 Python · DQN · MARL
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key findings */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {[
                { icon: '🏆', label: 'Best Algorithm', value: 'DQN', desc: 'Most adaptable under complex, uncertain market conditions' },
                { icon: '📉', label: 'Underperformer', value: 'PPO', desc: 'Struggled in dynamic, real-world market scenarios' },
                { icon: '⚖️', label: 'Agent Types', value: '3 Roles', desc: 'Consumers, producers, and regulators simulated simultaneously' },
                { icon: '🐍', label: 'Implementation', value: 'Python', desc: 'DQN, Q-Learning, Actor-Critic, heatmap & comparison scripts' },
              ].map(f => (
                <div key={f.label} style={{ padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{f.icon}</div>
                  <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{f.label}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '0.3rem' }}>{f.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text2)', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ TESTIMONIALS ═══════════ */}
        <section className="section">
          <div className="container">
            <div className="divider" style={{ marginBottom: '4rem' }} />
            <div className="section-label">06 / testimonials</div>
            <h2 className="section-title">What Clients <span style={{ color: 'var(--accent)' }}>Say</span></h2>
            <div className="services-grid" style={{ marginBottom: '1.5rem' }}>
              {[
                { quote: 'Aditya delivered the smart contract ahead of schedule with full Foundry test coverage. The audit report caught two edge cases we had missed. Highly recommend.', name: 'Client — DeFi Protocol', role: 'Ethereum Mainnet Project', avatar: 'D' },
                { quote: 'The NFT ecosystem Aditya built included staking, a Discord bot, and DAO governance. Communicative throughout and the code was clean and well-documented.', name: 'Client — NFT Collection', role: 'Sepolia → Mainnet', avatar: 'N' },
                { quote: 'We needed a full-stack Web3 platform in 6 weeks. Aditya architected and delivered the contracts + Next.js frontend on time. Would work with him again.', name: 'Client — Web3 Startup', role: 'Full-Stack Engagement', avatar: 'W' },
              ].map((t, i) => (
                <div key={i} style={{ padding: '1.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    {[1,2,3,4,5].map(s => <span key={s} style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>★</span>)}
                  </div>
                  <p style={{ color: 'var(--text)', fontSize: '0.88rem', lineHeight: 1.78, fontStyle: 'italic', flex: 1 }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent3))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.88rem', color: '#fff', flexShrink: 0 }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{t.name}</div>
                      <div className="mono" style={{ fontSize: '0.66rem', color: 'var(--text3)', marginTop: 2 }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mono" style={{ fontSize: '0.7rem', color: 'var(--text3)', letterSpacing: '0.06em', textAlign: 'center' }}>
             Have you worked with me? <a href="mailto:...">Send your testimonial</a> and I'll add it here.
            </p>
          </div>
        </section>

        {/* ═══════════ CONTACT ═══════════ */}
        <section id="contact" className="section">
          <div className="container">
            <div className="divider" style={{ marginBottom: '4rem' }} />
            <div className="contact-grid">
              {/* Left info */}
              <div>
                <div className="section-label">07 / contact</div>
                <h2 className="section-title">Let&apos;s<br /><span style={{ color: 'var(--accent)' }}>Work Together</span></h2>
                <p style={{ color: 'var(--text2)', lineHeight: 1.85, marginBottom: '2rem', fontSize: '0.94rem' }}>
                  Open to freelance projects, consulting, and full-time blockchain engineering roles. Let&apos;s build something meaningful.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {[
                    { icon: '📧', label: 'Email', value: 'adityachotaliya9299@gmail.com', href: 'mailto:adityachotaliya9299@gmail.com' },
                    { icon: '💼', label: 'GitHub', value: 'adityachotaliya9299-jpg', href: 'https://github.com/adityachotaliya9299-jpg' },
                    { icon: '🔗', label: 'LinkedIn', value: 'linkedin.com/in/aditya-chotaliya', href: 'https://linkedin.com/in/aditya-chotaliya' },
                    { icon: '📍', label: 'Location', value: 'Available worldwide', href: '' },
                    
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', gap: '0.9rem', alignItems: 'center', padding: '0.9rem 1.1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                      <span style={{ fontSize: '1rem', width: 26, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <div className="mono" style={{ fontSize: '0.62rem', color: 'var(--text3)', letterSpacing: '0.08em', marginBottom: 2 }}>{item.label}</div>
                        {item.href ? <a href={item.href} style={{ fontSize: '0.84rem', color: 'var(--accent)', fontWeight: 500 }}>{item.value}</a>
                          : <span style={{ fontSize: '0.84rem', color: 'var(--text)', fontWeight: 500 }}>{item.value}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form */}
              <div style={{ padding: 'clamp(1.25rem,4vw,2rem)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
                {sent ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Message Sent!</h3>
                    <p style={{ color: 'var(--text2)', fontSize: '0.86rem' }}>I&apos;ll reply within 24 hours.</p>
                    <button onClick={() => setSent(false)} className="btn btn-ghost" style={{ marginTop: '1.5rem', fontSize: '0.82rem' }}>Send Another</button>
                  </div>
                ) : (
                  <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label className="form-label">Name</label>
                        <input className="form-input" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <input className="form-input" placeholder="Smart contract audit / DeFi project…" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message</label>
                      <textarea className="form-input" rows={5} placeholder="Tell me about your project…" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required style={{ resize: 'vertical' }} />
                    </div>
                    {error && <p style={{ color: 'var(--red)', fontSize: '0.82rem' }}>{error}</p>}
                    <button type="submit" className="btn btn-primary" disabled={sending} style={{ width: '100%', justifyContent: 'center' }}>
                      {sending ? 'Sending…' : 'Send Message →'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem', textAlign: 'center', color: 'var(--text3)' }}>
          <div className="mono" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>
            © 2025 Aditya Chotaliya · Built with Next.js · Blockchain Developer
          </div>
        </footer>
      </div>

      {/* ─── ALL RESPONSIVE STYLES ─── */}
      <style>{`
        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }

        .gate-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }
        @media (max-width: 1000px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 580px) {
          .services-grid { grid-template-columns: 1fr; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Hero layout */
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 4rem;
          align-items: center;
          padding: 2rem 0;
        }

        /* About layout */
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: center;
        }
        .about-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        /* Projects grid */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
        }

        /* Contact layout */
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        /* Form 2-col row */
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        /* ── Tablet ── */
        @media (max-width: 1000px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .hero-card-wrap { display: none; }
          .two-col {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .about-cards {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }
          .projects-grid {
            grid-template-columns: 1fr;
          }
          .form-row-2 {
            grid-template-columns: 1fr;
          }
          .hero-grid {
            padding: 1rem 0;
          }
          .gate-cards {
            grid-template-columns: 1fr;
          }
          .gate-cards > div {
            min-width: 0;
          }
        }

        @media (max-width: 380px) {
          .about-cards { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const sql = neon(process.env.DATABASE_URL!);
  const projects = await sql`
    SELECT id, title, description, tags, github, live, category, featured, created_at as "createdAt"
    FROM projects
    ORDER BY created_at DESC
  `;
  return { props: { projects } };
};