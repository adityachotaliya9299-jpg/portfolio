import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTheme } from '../components/ThemeContext';

interface Project {
  id: string; title: string; description: string;
  tags: string[]; github: string; live: string;
  category: string; featured: boolean; createdAt: string;
}
interface Message {
  id: string; name: string; email: string;
  subject: string; message: string; createdAt: string;
}

export default function Admin() {
  const { theme, toggle } = useTheme();
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState('');
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [tab, setTab] = useState<'projects'|'messages'|'stats'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [expandedMsg, setExpandedMsg] = useState<string|null>(null);

  const [form, setForm] = useState({
    title:'', description:'', tags:'', github:'',
    live:'', category:'Blockchain', featured:false,
  });

  const loadData = useCallback(async (tok: string) => {
    setLoading(true);
    try {
      const [pr, ms] = await Promise.all([
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/messages', { headers:{ Authorization:`Bearer ${tok}` }}).then(r => r.json()),
      ]);
      if (Array.isArray(pr)) setProjects(pr);
      if (Array.isArray(ms)) setMessages(ms);
    } catch {}
    setLoading(false);
  }, []);

  const login = async () => {
    setPwLoading(true); setPwError('');
    try {
      const res = await fetch('/api/auth', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        setAuthed(true);
        loadData(data.token);
      } else {
        setPwError('Incorrect password. Try "admin123" by default.');
      }
    } catch { setPwError('Network error'); }
    setPwLoading(false);
  };

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setFormError(''); setFormSuccess('');
    try {
      const res = await fetch('/api/projects', {
        method:'POST',
        headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProjects(prev => [...prev, data]);
        setForm({ title:'', description:'', tags:'', github:'', live:'', category:'Blockchain', featured:false });
        setFormSuccess('Project added and live on portfolio!');
        setTimeout(() => setFormSuccess(''), 4000);
      } else { setFormError(data.error || 'Failed to add project'); }
    } catch { setFormError('Network error'); }
    setLoading(false);
  };

  const deleteProject = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?\nThis will remove it from your portfolio.`)) return;
    const res = await fetch(`/api/projects?id=${id}`, {
      method:'DELETE', headers:{ Authorization:`Bearer ${token}` },
    });
    if (res.ok) setProjects(prev => prev.filter(p => p.id !== id));
  };

  const deleteMessage = async (id: string) => {
    const res = await fetch(`/api/messages?id=${id}`, {
      method:'DELETE', headers:{ Authorization:`Bearer ${token}` },
    });
    if (res.ok) setMessages(prev => prev.filter(m => m.id !== id));
  };

  // LOGIN SCREEN
  if (!authed) {
    return (
      <>
        <Head><title>Admin Login — Aditya Chotaliya</title></Head>
        <div style={{
          minHeight:'100vh', background:'var(--bg)', display:'flex',
          alignItems:'center', justifyContent:'center', padding:'2rem',
          fontFamily:"'Syne', sans-serif",
        }}>
          {/* Bg grid */}
          <div style={{ position:'fixed', inset:0, backgroundImage:`linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)`, backgroundSize:'60px 60px', pointerEvents:'none' }} />
          <div style={{ position:'fixed', width:500, height:500, borderRadius:'50%', background:'var(--accent3)', filter:'blur(130px)', opacity:0.07, bottom:-100, left:-100, pointerEvents:'none' }} />

          <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:420, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'2.5rem', boxShadow:'0 40px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ textAlign:'center', marginBottom:'2rem' }}>
              <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.5rem' }}>
                <div style={{ width:44, height:44, borderRadius:10, background:'linear-gradient(135deg, var(--accent), var(--accent3))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1rem', color:'var(--bg)' }}>AC</div>
              </Link>
              <h1 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:'0.4rem' }}>Admin Access</h1>
              <p style={{ color:'var(--text3)', fontSize:'0.83rem', fontFamily:"'DM Mono', monospace" }}>portfolio.admin / secure</p>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div>
                <label style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', letterSpacing:'0.1em', color:'var(--text2)', textTransform:'uppercase', display:'block', marginBottom:'0.4rem' }}>Password</label>
                <input
                  type="password" placeholder="Enter admin password"
                  value={pw} onChange={e => { setPw(e.target.value); setPwError(''); }}
                  onKeyDown={e => e.key === 'Enter' && login()} autoFocus
                  style={{ width:'100%', padding:'0.85rem 1rem', background:'var(--bg2)', border:`1px solid ${pwError ? 'var(--red)' : 'var(--border)'}`, borderRadius:8, color:'var(--text)', fontSize:'0.9rem', outline:'none', fontFamily:"'Syne', sans-serif", transition:'border-color 0.2s' }}
                  onFocus={e => { if(!pwError) e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(0,212,255,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor=pwError?'var(--red)':'var(--border)'; e.currentTarget.style.boxShadow='none'; }}
                />
              </div>
              {pwError && (
                <div style={{ padding:'0.6rem 0.9rem', background:'rgba(255,77,77,0.08)', border:'1px solid rgba(255,77,77,0.2)', borderRadius:8, color:'var(--red)', fontSize:'0.8rem' }}>
                  ⚠️ {pwError}
                </div>
              )}
              <button onClick={login} disabled={pwLoading || !pw} style={{
                width:'100%', padding:'0.9rem', borderRadius:10, border:'none',
                background: (!pw || pwLoading) ? 'var(--border2)' : 'var(--accent)',
                color: (!pw || pwLoading) ? 'var(--text3)' : 'var(--bg)',
                fontWeight:700, fontSize:'0.92rem', cursor: (!pw || pwLoading) ? 'not-allowed' : 'pointer',
                fontFamily:"'Syne', sans-serif", transition:'all 0.2s',
              }}>
                {pwLoading ? 'Verifying…' : 'Login to Admin →'}
              </button>
            </div>

            <div style={{ marginTop:'1.5rem', textAlign:'center' }}>
              <Link href="/" style={{ color:'var(--text3)', fontSize:'0.8rem', fontFamily:"'DM Mono', monospace" }}>
                ← Back to portfolio
              </Link>
            </div>

            <div style={{ marginTop:'1.5rem', padding:'0.75rem 1rem', background:'rgba(0,212,255,0.04)', border:'1px solid rgba(0,212,255,0.12)', borderRadius:8 }}>
              <p style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.7rem', color:'var(--text3)', lineHeight:1.6 }}>
                Default password: <code style={{ color:'var(--accent)' }}>admin123</code><br />
                Change via <code style={{ color:'var(--text2)' }}>ADMIN_PASSWORD</code> env var
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const catColors: Record<string,string> = { DeFi:'#a855f7', Blockchain:'var(--accent)', AI:'var(--green)', Frontend:'#fb923c', Backend:'#38bdf8', Other:'var(--text2)' };

  // ADMIN PANEL
  return (
    <>
      <Head><title>Admin Panel — Aditya Chotaliya</title></Head>
      <div style={{ minHeight:'100vh', background:'var(--bg)', fontFamily:"'Syne', sans-serif" }}>

        {/* Top Nav */}
        <nav style={{
          position:'sticky', top:0, zIndex:50,
          padding:'0 2rem', height:56,
          background:'var(--bg2)', backdropFilter:'blur(20px)',
          borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
            <Link href="/" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <div style={{ width:30, height:30, borderRadius:7, background:'linear-gradient(135deg, var(--accent), var(--accent3))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'0.75rem', color:'var(--bg)' }}>AC</div>
              <span style={{ fontWeight:700, fontSize:'0.88rem' }}>Admin Panel</span>
            </Link>
            <span style={{ color:'var(--border2)' }}>|</span>
            <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.7rem', color:'var(--accent)', letterSpacing:'0.1em' }}>DASHBOARD</span>
          </div>

          <div style={{ display:'flex', gap:'0.4rem' }}>
            {([
              { key:'projects', icon:'📁', label:'Projects' },
              { key:'messages', icon:'📨', label:'Messages', badge: messages.length },
              { key:'stats',    icon:'📊', label:'Stats' },
            ] as { key: typeof tab; icon: string; label: string; badge?: number }[]).map(({ key, icon, label, badge }) => (
              <button key={key} onClick={() => setTab(key as typeof tab)} style={{
                display:'flex', alignItems:'center', gap:'0.4rem',
                padding:'0.35rem 0.9rem', borderRadius:7, border:'1px solid',
                borderColor: tab===key ? 'var(--accent)' : 'var(--border)',
                background: tab===key ? 'rgba(0,212,255,0.1)' : 'transparent',
                color: tab===key ? 'var(--accent)' : 'var(--text3)',
                fontSize:'0.78rem', fontWeight:600, cursor:'pointer',
                fontFamily:"'Syne', sans-serif", transition:'all 0.15s',
              }}>
                <span style={{ fontSize:'0.8rem' }}>{icon}</span> {label}
                {badge != null && badge > 0 && (
                  <span style={{ background:'var(--accent3)', color:'#fff', borderRadius:10, padding:'0 5px', fontSize:'0.6rem', fontWeight:700 }}>{badge}</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
            <button onClick={toggle} title={theme==='dark'?'Light mode':'Dark mode'} style={{
              width:34, height:34, borderRadius:8, border:'1px solid var(--border)',
              background:'var(--surface)', color:'var(--text2)', fontSize:'0.88rem',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', transition:'all 0.2s', flexShrink:0,
            }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <span className="status-dot" />
            <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.7rem', color:'var(--text3)' }}>LIVE</span>
            <a href="/" target="_blank" rel="noreferrer" style={{
              padding:'0.35rem 0.85rem', borderRadius:7, border:'1px solid var(--border)',
              color:'var(--text3)', fontSize:'0.76rem', transition:'all 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--accent)'; (e.currentTarget as HTMLElement).style.color='var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.color='var(--text3)'; }}
            >
              View Site ↗
            </a>
          </div>
        </nav>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'2rem' }}>

          {/* PROJECTS TAB */}
          {tab === 'projects' && (
            <div style={{ display:'grid', gridTemplateColumns:'420px 1fr', gap:'2rem', alignItems:'start' }}>

              {/* ADD FORM */}
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'2rem', position:'sticky', top:72 }}>
                <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <span style={{ width:28, height:28, borderRadius:6, background:'rgba(0,212,255,0.1)', border:'1px solid rgba(0,212,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem' }}>➕</span>
                  Add New Project
                </h2>

                <form onSubmit={addProject} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  {[
                    { label:'Project Title *', field:'title', placeholder:'My DeFi Protocol' },
                    { label:'GitHub URL *', field:'github', placeholder:'https://github.com/username/repo', type:'url' },
                    { label:'Live Demo URL', field:'live', placeholder:'https://myproject.vercel.app', type:'url' },
                    { label:'Tags (comma-separated)', field:'tags', placeholder:'Solidity, Foundry, Next.js, DeFi' },
                  ].map(({ label, field, placeholder, type }) => (
                    <div key={field} style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                      <label style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.67rem', letterSpacing:'0.08em', color:'var(--text2)', textTransform:'uppercase' }}>{label}</label>
                      <input
                        type={type || 'text'} placeholder={placeholder}
                        value={(form as Record<string,unknown>)[field] as string}
                        onChange={e => setForm({ ...form, [field]: e.target.value })}
                        required={label.includes('*')}
                        style={{ padding:'0.75rem 0.9rem', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:'0.86rem', outline:'none', fontFamily:"'Syne', sans-serif", transition:'border-color 0.2s, box-shadow 0.2s' }}
                        onFocus={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(0,212,255,0.1)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; }}
                      />
                    </div>
                  ))}

                  <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                    <label style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.67rem', letterSpacing:'0.08em', color:'var(--text2)', textTransform:'uppercase' }}>Description *</label>
                    <textarea
                      placeholder="Describe the project in detail…"
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      required rows={4}
                      style={{ padding:'0.75rem 0.9rem', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:'0.86rem', outline:'none', resize:'vertical', fontFamily:"'Syne', sans-serif", transition:'border-color 0.2s' }}
                      onFocus={e => { e.currentTarget.style.borderColor='var(--accent)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; }}
                    />
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                      <label style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.67rem', letterSpacing:'0.08em', color:'var(--text2)', textTransform:'uppercase' }}>Category</label>
                      <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                        style={{ padding:'0.75rem 0.9rem', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text)', fontSize:'0.86rem', outline:'none', fontFamily:"'Syne', sans-serif", cursor:'pointer' }}>
                        {['Blockchain','DeFi','AI','Frontend','Backend','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                      <label style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.67rem', letterSpacing:'0.08em', color:'var(--text2)', textTransform:'uppercase' }}>Featured?</label>
                      <label style={{
                        display:'flex', alignItems:'center', gap:'0.6rem',
                        padding:'0.75rem 0.9rem', background:'var(--bg2)',
                        border:'1px solid var(--border)', borderRadius:8, cursor:'pointer',
                        transition:'border-color 0.2s',
                      }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor='var(--border2)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor='var(--border)'}
                      >
                        <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })}
                          style={{ width:15, height:15, accentColor:'var(--accent)', cursor:'pointer' }} />
                        <span style={{ fontSize:'0.84rem', color:'var(--text2)', userSelect:'none' }}>Mark featured</span>
                      </label>
                    </div>
                  </div>

                  {formError && <div style={{ padding:'0.65rem 0.9rem', background:'rgba(255,77,77,0.08)', border:'1px solid rgba(255,77,77,0.2)', borderRadius:8, color:'var(--red)', fontSize:'0.8rem' }}>⚠️ {formError}</div>}
                  {formSuccess && <div style={{ padding:'0.65rem 0.9rem', background:'rgba(0,230,118,0.08)', border:'1px solid rgba(0,230,118,0.2)', borderRadius:8, color:'var(--green)', fontSize:'0.8rem' }}>✓ {formSuccess}</div>}

                  <button type="submit" disabled={loading} style={{
                    padding:'0.85rem', borderRadius:10, border:'none',
                    background: loading ? 'var(--border2)' : 'var(--accent)',
                    color: loading ? 'var(--text3)' : 'var(--bg)',
                    fontWeight:700, fontSize:'0.88rem', cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily:"'Syne', sans-serif", transition:'all 0.2s',
                  }}>
                    {loading ? 'Adding Project…' : '➕ Add to Portfolio'}
                  </button>
                </form>
              </div>

              {/* PROJECTS LIST */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
                  <h2 style={{ fontSize:'1rem', fontWeight:700 }}>📋 All Projects ({projects.length})</h2>
                  <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.7rem', color:'var(--text3)' }}>
                    {projects.filter(p=>p.featured).length} featured
                  </span>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                  {projects.map(p => (
                    <div key={p.id} style={{
                      padding:'1.25rem 1.5rem', background:'var(--surface)',
                      border:'1px solid var(--border)', borderRadius:12,
                      display:'flex', gap:'1rem', alignItems:'center',
                      transition:'all 0.2s',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border2)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; }}>

                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.35rem', flexWrap:'wrap' }}>
                          <span style={{ fontWeight:700, fontSize:'0.92rem' }}>{p.title}</span>
                          {p.featured && <span style={{ fontSize:'0.63rem', color:'var(--gold)', border:'1px solid rgba(245,197,24,0.3)', borderRadius:3, padding:'0 4px', fontWeight:600 }}>★ Featured</span>}
                        </div>
                        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap', marginBottom:'0.5rem' }}>
                          <span style={{ fontSize:'0.7rem', fontWeight:600, color: catColors[p.category] || 'var(--text2)', fontFamily:"'DM Mono', monospace" }}>{p.category}</span>
                          <span style={{ color:'var(--border2)' }}>·</span>
                          <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--text3)' }}>{p.createdAt}</span>
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem' }}>
                          {p.tags.slice(0,4).map(t => (
                            <span key={t} style={{ padding:'0.15rem 0.5rem', background:'rgba(0,212,255,0.07)', border:'1px solid rgba(0,212,255,0.15)', borderRadius:4, fontFamily:"'DM Mono', monospace", fontSize:'0.66rem', color:'var(--accent)' }}>{t}</span>
                          ))}
                          {p.tags.length > 4 && <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.66rem', color:'var(--text3)' }}>+{p.tags.length-4}</span>}
                        </div>
                      </div>

                      <div style={{ display:'flex', gap:'0.4rem', flexShrink:0 }}>
                        {p.live && (
                          <a href={p.live} target="_blank" rel="noreferrer" title="Live Demo"
                            style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:7, border:'1px solid var(--border)', color:'var(--text3)', fontSize:'0.85rem', transition:'all 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--accent)'; (e.currentTarget as HTMLElement).style.color='var(--accent)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.color='var(--text3)'; }}>↗</a>
                        )}
                        <a href={p.github} target="_blank" rel="noreferrer" title="GitHub"
                          style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:7, border:'1px solid var(--border)', color:'var(--text3)', fontSize:'0.72rem', fontWeight:700, transition:'all 0.15s', fontFamily:"'DM Mono', monospace" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border2)'; (e.currentTarget as HTMLElement).style.color='var(--text)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.color='var(--text3)'; }}>GH</a>
                        <button onClick={() => deleteProject(p.id, p.title)} title="Delete project"
                          style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:7, border:'1px solid rgba(255,77,77,0.25)', background:'transparent', color:'rgba(255,77,77,0.6)', fontSize:'0.82rem', cursor:'pointer', transition:'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,77,77,0.1)'; (e.currentTarget as HTMLElement).style.color='var(--red)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(255,77,77,0.5)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color='rgba(255,77,77,0.6)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(255,77,77,0.25)'; }}>🗑</button>
                      </div>
                    </div>
                  ))}

                  {projects.length === 0 && !loading && (
                    <div style={{ textAlign:'center', padding:'4rem', color:'var(--text3)', fontFamily:"'DM Mono', monospace", fontSize:'0.82rem' }}>
                      No projects yet. Add your first one →
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MESSAGES TAB */}
          {tab === 'messages' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                <h2 style={{ fontSize:'1rem', fontWeight:700 }}>📨 Contact Inbox ({messages.length})</h2>
              </div>

              {messages.length === 0 ? (
                <div style={{ textAlign:'center', padding:'6rem 2rem', color:'var(--text3)' }}>
                  <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📭</div>
                  <p style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.82rem' }}>Inbox empty — no messages yet</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
                  {messages.map(msg => (
                    <div key={msg.id} style={{
                      background:'var(--surface)', border:'1px solid var(--border)',
                      borderRadius:12, overflow:'hidden', transition:'border-color 0.2s',
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor='var(--border2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor='var(--border)'}
                    >
                      {/* Header */}
                      <div style={{ padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}
                        onClick={() => setExpandedMsg(expandedMsg === msg.id ? null : msg.id)}>
                        <div style={{ display:'flex', gap:'1.25rem', alignItems:'center' }}>
                          <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg, var(--accent), var(--accent3))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem', color:'var(--bg)', flexShrink:0 }}>
                            {msg.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                              <span style={{ fontWeight:700, fontSize:'0.9rem' }}>{msg.name}</span>
                              <a href={`mailto:${msg.email}`} onClick={e => e.stopPropagation()} style={{ color:'var(--accent)', fontSize:'0.8rem' }}>{msg.email}</a>
                            </div>
                            <div style={{ color:'var(--accent)', fontSize:'0.83rem', fontWeight:600, marginTop:2 }}>{msg.subject}</div>
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
                          <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--text3)' }}>
                            {new Date(msg.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                          </span>
                          <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} onClick={e => e.stopPropagation()}
                            style={{ padding:'0.3rem 0.7rem', borderRadius:6, border:'1px solid var(--border)', color:'var(--text3)', fontSize:'0.75rem', transition:'all 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--accent)'; (e.currentTarget as HTMLElement).style.color='var(--accent)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.color='var(--text3)'; }}>
                            Reply ↗
                          </a>
                          <button onClick={e => { e.stopPropagation(); deleteMessage(msg.id); }}
                            style={{ padding:'0.3rem 0.7rem', borderRadius:6, border:'1px solid rgba(255,77,77,0.25)', background:'transparent', color:'rgba(255,77,77,0.6)', fontSize:'0.75rem', cursor:'pointer', transition:'all 0.15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,77,77,0.1)'; (e.currentTarget as HTMLElement).style.color='var(--red)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color='rgba(255,77,77,0.6)'; }}>Delete</button>
                          <span style={{ color:'var(--text3)', fontSize:'0.8rem', transition:'transform 0.2s', display:'inline-block', transform: expandedMsg===msg.id ? 'rotate(180deg)' : 'none' }}>▾</span>
                        </div>
                      </div>
                      {/* Message Body */}
                      {expandedMsg === msg.id && (
                        <div style={{ padding:'1rem 1.5rem 1.5rem', borderTop:'1px solid var(--border)', background:'rgba(0,0,0,0.15)' }}>
                          <p style={{ color:'var(--text2)', fontSize:'0.88rem', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{msg.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STATS TAB */}
          {tab === 'stats' && (
            <div>
              <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1.5rem' }}>📊 Portfolio Stats</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'1rem', marginBottom:'2rem' }}>
                {[
                  { label:'Total Projects', value: projects.length, icon:'📁', color:'var(--accent)' },
                  { label:'Featured Projects', value: projects.filter(p=>p.featured).length, icon:'⭐', color:'var(--gold)' },
                  { label:'DeFi Projects', value: projects.filter(p=>p.category==='DeFi').length, icon:'💎', color:'#a855f7' },
                  { label:'Blockchain Projects', value: projects.filter(p=>p.category==='Blockchain').length, icon:'⛓️', color:'var(--accent)' },
                  { label:'Total Messages', value: messages.length, icon:'📨', color:'var(--green)' },
                  { label:'Live Projects', value: projects.filter(p=>p.live).length, icon:'🌐', color:'#fb923c' },
                ].map(stat => (
                  <div key={stat.label} style={{ padding:'1.5rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, textAlign:'center' }}>
                    <div style={{ fontSize:'1.8rem', marginBottom:'0.5rem' }}>{stat.icon}</div>
                    <div style={{ fontSize:'2.2rem', fontWeight:800, color: stat.color, lineHeight:1 }}>{stat.value}</div>
                    <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--text3)', marginTop:6, letterSpacing:'0.06em' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Category breakdown */}
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem' }}>
                <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:'1.25rem', fontFamily:"'DM Mono', monospace", color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Category Breakdown</h3>
                {['Blockchain','DeFi','AI','Frontend','Backend','Other'].map(cat => {
                  const count = projects.filter(p=>p.category===cat).length;
                  const pct = projects.length ? Math.round(count/projects.length*100) : 0;
                  if (!count) return null;
                  return (
                    <div key={cat} style={{ marginBottom:'0.9rem' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.35rem' }}>
                        <span style={{ fontSize:'0.85rem', fontWeight:600 }}>{cat}</span>
                        <span style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.72rem', color:'var(--text3)' }}>{count} / {pct}%</span>
                      </div>
                      <div style={{ height:6, background:'var(--bg2)', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background: catColors[cat] || 'var(--accent)', borderRadius:3, transition:'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.6;transform:scale(1.4);} }
        .status-dot { width:7px; height:7px; border-radius:50%; background:var(--green); animation:pulse-dot 2s infinite; display:inline-block; }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:var(--bg); }
      `}</style>
    </>
  );
}