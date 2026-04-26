import { useState, useCallback, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useTheme } from "../components/ThemeContext";

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
interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

const catColors: Record<string, string> = {
  DeFi: "#a855f7",
  Blockchain: "var(--accent)",
  AI: "var(--green)",
  Frontend: "#fb923c",
  Backend: "#38bdf8",
  Other: "var(--text2)",
};

export default function Admin() {
  const { theme, toggle } = useTheme();
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_session");
      if (saved) {
        const { token: t, expiresAt } = JSON.parse(saved);
        if (Date.now() < expiresAt) {
          setToken(t);
          setAuthed(true);
          loadData(t);
        } else {
          localStorage.removeItem("admin_session");
        }
      }
    } catch {}
  }, []);

  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [tab, setTab] = useState<'projects'|'messages'|'stats'|'settings'|'blog'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [expandedMsg, setExpandedMsg]     = useState<string|null>(null);
  const [blogPosts, setBlogPosts] = useState<{id:string;title:string;slug:string;category:string;published:boolean;reading_time:number;created_at:string}[]>([]);
  const [resumeUrl, setResumeUrl]         = useState('/resume.pdf');
  const [resumeInput, setResumeInput]     = useState('/resume.pdf');
  const [resumeSaving, setResumeSaving]   = useState(false);
  const [resumeMsg, setResumeMsg]         = useState('');
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    github: "",
    live: "",
    category: "",
    featured: false,
    shortDescription: "",
  });

  const loadData = useCallback(async (tok: string) => {
    setLoading(true);
    try {
      const [pr, ms, bl] = await Promise.all([
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/messages', { headers:{ Authorization:`Bearer ${tok}` }}).then(r => r.json()),
        fetch('/api/blog?admin=true', { headers:{ Authorization:`Bearer ${tok}` }}).then(r => r.json()),
      ]);
      if (Array.isArray(pr)) setProjects(pr);
      if (Array.isArray(ms)) setMessages(ms);
      if (Array.isArray(bl)) setBlogPosts(bl);
    } catch {}
    setLoading(false);
  }, []);

  const login = async () => {
    setPwLoading(true);
    setPwError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);setAuthed(true);loadData(data.token);
        localStorage.setItem("admin_session",JSON.stringify({ token: data.token, expiresAt: data.expiresAt }),);
        
        fetch('/api/blog?admin=true', { headers: { Authorization: `Bearer ${data.token}` }}).then(r=>r.json()).then(d => { if(Array.isArray(d)) setBlogPosts(d); });
        fetch('/api/settings?key=resume_url').then(r => r.json()).then(d => {
          if (d.value) { setResumeUrl(d.value); setResumeInput(d.value); }
        });
      
      } else {
        setPwError("Incorrect password.");
      }
    } catch {
      setPwError("Network error");
    }
    setPwLoading(false);
  };

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");
    setFormSuccess("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setProjects((prev) => [...prev, data]);
        setForm({
          title: "",
          description: "",
          tags: "",
          github: "",
          live: "",
          category: "",
          featured: false,
          shortDescription: "",
        });
        setFormSuccess("Project added!");
        setTimeout(() => setFormSuccess(""), 4000);
      } else {
        setFormError(data.error || "Failed to add project");
      }
    } catch {
      setFormError("Network error");
    }
    setLoading(false);
  };

  const deleteProject = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const res = await fetch(`/api/projects?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const deleteMessage = async (id: string) => {
    const res = await fetch(`/api/messages?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  // ─── Shared input style ───
  const inputStyle: React.CSSProperties = {
    padding: "0.75rem 0.9rem",
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
    fontSize: "0.86rem",
    outline: "none",
    fontFamily: "'Syne', sans-serif",
    width: "100%",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.67rem",
    letterSpacing: "0.08em",
    color: "var(--text2)",
    textTransform: "uppercase",
  };

  // ─── LOGIN SCREEN ───
  if (!authed) {
    return (
      <>
        <Head>
          <title>Admin Login — Aditya Chotaliya</title>
        </Head>
        <div
          style={{
            minHeight: "100vh",
            background: "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.25rem",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundImage: `linear-gradient(rgba(0,153,204,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,153,204,0.03) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "fixed",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "var(--accent3)",
              filter: "blur(120px)",
              opacity: 0.07,
              bottom: -80,
              left: -80,
              pointerEvents: "none",
            }}
          />

          {/* Theme toggle top-right */}
          <button
            onClick={toggle}
            style={{
              position: "fixed",
              top: 16,
              right: 16,
              width: 38,
              height: 38,
              borderRadius: 9,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text2)",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <div
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: 400,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 18,
              padding: "clamp(1.5rem,5vw,2.5rem)",
              boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg, var(--accent), var(--accent3))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    color: "#fff",
                  }}
                >
                  AC
                </div>
              </Link>
              <h1
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  marginBottom: "0.35rem",
                }}
              >
                Admin Access
              </h1>
              <p
                style={{
                  color: "var(--text3)",
                  fontSize: "0.8rem",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                portfolio.admin / secure
              </p>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={pw}
                  onChange={(e) => {
                    setPw(e.target.value);
                    setPwError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                  autoFocus
                  style={{
                    ...inputStyle,
                    borderColor: pwError ? "var(--red)" : "var(--border)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(0,153,204,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = pwError
                      ? "var(--red)"
                      : "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
              {pwError && (
                <div
                  style={{
                    padding: "0.6rem 0.9rem",
                    background: "rgba(255,77,77,0.08)",
                    border: "1px solid rgba(255,77,77,0.2)",
                    borderRadius: 8,
                    color: "var(--red)",
                    fontSize: "0.8rem",
                  }}
                >
                  ⚠️ {pwError}
                </div>
              )}
              <button
                onClick={login}
                disabled={pwLoading || !pw}
                style={{
                  padding: "0.875rem",
                  borderRadius: 10,
                  border: "none",
                  background:
                    !pw || pwLoading ? "var(--border2)" : "var(--accent)",
                  color: !pw || pwLoading ? "var(--text3)" : "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: !pw || pwLoading ? "not-allowed" : "pointer",
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                {pwLoading ? "Verifying…" : "Login →"}
              </button>
            </div>

            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <Link
                href="/"
                style={{
                  color: "var(--text3)",
                  fontSize: "0.78rem",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                ← Back to portfolio
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── ADMIN PANEL ───
  return (
    <>
      <Head>
        <title>Admin Panel — Aditya Chotaliya</title>
      </Head>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          fontFamily: "'Syne', sans-serif",
        }}
      >
        {/* ── Top Navbar ── */}
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            padding: "0 1rem",
            height: 52,
            background: "var(--bg2)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          {/* Left: logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background:
                  "linear-gradient(135deg, var(--accent), var(--accent3))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "0.72rem",
                color: "#fff",
              }}
            >
              AC
            </div>
            <span
              className="admin-title"
              style={{ fontWeight: 700, fontSize: "0.85rem" }}
            >
              Admin
            </span>
          </Link>

          {/* Center: tabs (hidden on small mobile, shown as bottom bar) */}
          <div
            className="admin-tabs-top"
            style={{ display: "flex", gap: "0.3rem" }}
          >
            {(
              [
                { key: "projects", icon: "📁", label: "Projects" },
                {
                  key: "messages",
                  icon: "📨",
                  label: "Messages",
                  badge: messages.length,
                },
                { key: "stats", icon: "📊", label: "Stats" },
                { key:'blog', icon:'✍️', label:'Blog' },
              { key:'settings', icon:'⚙️', label:'Settings' },
              ] as {
                key: typeof tab;
                icon: string;
                label: string;
                badge?: number;
              }[]
            ).map(({ key, icon, label, badge }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.3rem 0.75rem",
                  borderRadius: 7,
                  border: "1px solid",
                  borderColor: tab === key ? "var(--accent)" : "var(--border)",
                  background:
                    tab === key ? "rgba(0,153,204,0.1)" : "transparent",
                  color: tab === key ? "var(--accent)" : "var(--text3)",
                  fontSize: "0.77rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Syne', sans-serif",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{icon}</span>
                <span className="tab-label">{label}</span>
                {badge != null && badge > 0 && (
                  <span
                    style={{
                      background: "var(--accent3)",
                      color: "#fff",
                      borderRadius: 10,
                      padding: "0 5px",
                      fontSize: "0.58rem",
                      fontWeight: 700,
                    }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right: theme + view site */}
          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <button
              onClick={toggle}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text2)",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="view-site-btn"
              style={{
                padding: "0.3rem 0.75rem",
                borderRadius: 7,
                border: "1px solid var(--border)",
                color: "var(--text3)",
                fontSize: "0.74rem",
                whiteSpace: "nowrap",
              }}
            >
              View Site ↗
            </a>
          </div>
        </nav>

        {/* ── Mobile bottom tab bar ── */}
        <div className="admin-tabs-bottom">
          {(
            [
              { key: "projects", icon: "📁", label: "Projects" },
              { key:'messages', icon:'📨', label:'Messages', badge: messages.length },
              { key:'stats',    icon:'📊', label:'Stats' },
              { key:'blog', icon:'✍️', label:'Blog' },
              { key:'settings', icon:'⚙️', label:'Settings' },
            ] as {
              key: typeof tab;
              icon: string;
              label: string;
              badge?: number;
            }[]
          ).map(({ key, icon, label, badge }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.2rem",
                padding: "0.5rem 0.25rem",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: tab === key ? "var(--accent)" : "var(--text3)",
                fontFamily: "'Syne', sans-serif",
                position: "relative",
                borderTop:
                  tab === key
                    ? "2px solid var(--accent)"
                    : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{icon}</span>
              <span style={{ fontSize: "0.64rem", fontWeight: 600 }}>
                {label}
              </span>
              {badge != null && badge > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: "calc(50% - 16px)",
                    background: "var(--accent3)",
                    color: "#fff",
                    borderRadius: 10,
                    padding: "0 4px",
                    fontSize: "0.55rem",
                    fontWeight: 700,
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Main content ── */}
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "clamp(1rem,3vw,2rem)",
          }}
        >
          {/* ── PROJECTS TAB ── */}
          {tab === "projects" && (
            <div className="admin-projects-grid">
              {/* Add Form */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "clamp(1.25rem,3vw,2rem)",
                }}
                className="admin-form-sticky"
              >
                <h2
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: "rgba(0,153,204,0.1)",
                      border: "1px solid rgba(0,153,204,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      flexShrink: 0,
                    }}
                  >
                    ➕
                  </span>
                  Add New Project
                </h2>

                <form
                  onSubmit={addProject}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.9rem",
                  }}
                >
                  {[
                    {
                      label: "Title *",
                      field: "title",
                      placeholder: "My DeFi Protocol",
                    },
                    {
                      label: "GitHub URL *",
                      field: "github",
                      placeholder: "https://github.com/…",
                      type: "url",
                    },
                    {
                      label: "Live Demo URL",
                      field: "live",
                      placeholder: "https://…",
                      type: "url",
                    },
                    {
                      label: "Tags (comma-separated)",
                      field: "tags",
                      placeholder: "Solidity, Foundry, Next.js",
                    },
                  ].map(({ label, field, placeholder, type }) => (
                    <div
                      key={field}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.35rem",
                      }}
                    >
                      <label style={labelStyle}>{label}</label>
                      <input
                        type={type || "text"}
                        placeholder={placeholder}
                        value={
                          (form as Record<string, unknown>)[field] as string
                        }
                        onChange={(e) =>
                          setForm({ ...form, [field]: e.target.value })
                        }
                        required={label.includes("*")}
                        style={inputStyle}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "var(--accent)";
                          e.currentTarget.style.boxShadow =
                            "0 0 0 3px rgba(0,153,204,0.1)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  ))}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                    }}
                  >
                    <label style={labelStyle}>
                      Card Summary (shown on project card) *
                    </label>
                    <input
                      type="text"
                      placeholder="One line — what this project does"
                      value={form.shortDescription || ""}
                      onChange={(e) =>
                        setForm({ ...form, shortDescription: e.target.value })
                      }
                      required
                      style={inputStyle}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "var(--accent)";
                        e.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(0,153,204,0.1)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.35rem",
                    }}
                  >
                    <label style={labelStyle}>Description *</label>
                    <textarea
                      placeholder="Describe the project…"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      required
                      rows={3}
                      style={{ ...inputStyle, resize: "vertical" }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "var(--accent)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.35rem",
                      }}
                    >
                      <label style={labelStyle}>Category</label>
                      <input
                        type="text"
                        list="category-options"
                        placeholder="Type or pick category"
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value })
                        }
                        style={inputStyle}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "var(--accent)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      />
                      <datalist id="category-options">
                        {[
                          "Blockchain",
                          "DeFi",
                          "AI",
                          "Frontend",
                          "Backend",
                          "Full Stack",
                          "Other",
                        ].map((c) => (
                          <option key={c} value={c} />
                        ))}
                      </datalist>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.35rem",
                      }}
                    >
                      <label style={labelStyle}>Featured?</label>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.75rem 0.9rem",
                          background: "var(--bg2)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={form.featured}
                          onChange={(e) =>
                            setForm({ ...form, featured: e.target.checked })
                          }
                          style={{
                            width: 15,
                            height: 15,
                            accentColor: "var(--accent)",
                            cursor: "pointer",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--text2)",
                            userSelect: "none",
                          }}
                        >
                          Featured
                        </span>
                      </label>
                    </div>
                  </div>

                  {formError && (
                    <div
                      style={{
                        padding: "0.6rem 0.9rem",
                        background: "rgba(255,77,77,0.08)",
                        border: "1px solid rgba(255,77,77,0.2)",
                        borderRadius: 8,
                        color: "var(--red)",
                        fontSize: "0.8rem",
                      }}
                    >
                      ⚠️ {formError}
                    </div>
                  )}
                  {formSuccess && (
                    <div
                      style={{
                        padding: "0.6rem 0.9rem",
                        background: "rgba(0,230,118,0.08)",
                        border: "1px solid rgba(0,230,118,0.2)",
                        borderRadius: 8,
                        color: "var(--green)",
                        fontSize: "0.8rem",
                      }}
                    >
                      ✓ {formSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: "0.8rem",
                      borderRadius: 10,
                      border: "none",
                      background: loading ? "var(--border2)" : "var(--accent)",
                      color: loading ? "var(--text3)" : "#fff",
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    {loading ? "Adding…" : "➕ Add to Portfolio"}
                  </button>
                </form>
              </div>

              {/* Projects List */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.1rem",
                  }}
                >
                  <h2 style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                    📋 Projects ({projects.length})
                  </h2>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.68rem",
                      color: "var(--text3)",
                    }}
                  >
                    {projects.filter((p) => p.featured).length} featured
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.65rem",
                  }}
                >
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: "1rem 1.25rem",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 11,
                        display: "flex",
                        gap: "0.75rem",
                        alignItems: "flex-start",
                        transition: "border-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.borderColor =
                          "var(--border2)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.borderColor =
                          "var(--border)")
                      }
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.3rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "0.88rem",
                              wordBreak: "break-word",
                            }}
                          >
                            {p.title}
                          </span>
                          {p.featured && (
                            <span
                              style={{
                                fontSize: "0.6rem",
                                color: "var(--gold)",
                                border: "1px solid rgba(180,83,9,0.3)",
                                borderRadius: 3,
                                padding: "0 4px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              ★
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.4rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'DM Mono', monospace",
                              fontSize: "0.65rem",
                              color: catColors[p.category] || "var(--text2)",
                              fontWeight: 600,
                            }}
                          >
                            {p.category}
                          </span>
                          <span
                            style={{
                              fontFamily: "'DM Mono', monospace",
                              fontSize: "0.65rem",
                              color: "var(--text3)",
                            }}
                          >
                            {String(p.createdAt).split("T")[0]}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.3rem",
                            marginTop: "0.4rem",
                          }}
                        >
                          {p.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              style={{
                                padding: "0.1rem 0.45rem",
                                background: "rgba(0,153,204,0.07)",
                                border: "1px solid rgba(0,153,204,0.15)",
                                borderRadius: 4,
                                fontFamily: "'DM Mono', monospace",
                                fontSize: "0.62rem",
                                color: "var(--accent)",
                              }}
                            >
                              {t}
                            </span>
                          ))}
                          {p.tags.length > 3 && (
                            <span
                              style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: "0.62rem",
                                color: "var(--text3)",
                              }}
                            >
                              +{p.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div
                        style={{
                          display: "flex",
                          gap: "0.35rem",
                          flexShrink: 0,
                        }}
                      >
                        <a
                          href={`/admin/edit/${p.id}`}
                          title="Edit project"
                          style={{
                            width: 30,
                            height: 30,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 7,
                            border: "1px solid var(--border)",
                            color: "var(--text3)",
                            fontSize: "0.75rem",
                            transition: "all 0.15s",
                            flexShrink: 0,
                            textDecoration: "none",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor =
                              "var(--accent)";
                            (e.currentTarget as HTMLElement).style.color =
                              "var(--accent)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor =
                              "var(--border)";
                            (e.currentTarget as HTMLElement).style.color =
                              "var(--text3)";
                          }}
                        >
                          ✏️
                        </a>
                        {p.live && (
                          <a
                            href={p.live}
                            target="_blank"
                            rel="noreferrer"
                            title="Live"
                            style={{
                              width: 30,
                              height: 30,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: 7,
                              border: "1px solid var(--border)",
                              color: "var(--text3)",
                              fontSize: "0.8rem",
                              transition: "all 0.15s",
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.borderColor = "var(--accent)";
                              (e.currentTarget as HTMLElement).style.color =
                                "var(--accent)";
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.borderColor = "var(--border)";
                              (e.currentTarget as HTMLElement).style.color =
                                "var(--text3)";
                            }}
                          >
                            ↗
                          </a>
                        )}
                        <a
                          href={p.github}
                          target="_blank"
                          rel="noreferrer"
                          title="GitHub"
                          style={{
                            width: 30,
                            height: 30,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 7,
                            border: "1px solid var(--border)",
                            color: "var(--text3)",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            fontFamily: "'DM Mono', monospace",
                            transition: "all 0.15s",
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor =
                              "var(--border2)";
                            (e.currentTarget as HTMLElement).style.color =
                              "var(--text)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor =
                              "var(--border)";
                            (e.currentTarget as HTMLElement).style.color =
                              "var(--text3)";
                          }}
                        >
                          GH
                        </a>
                        <button
                          onClick={() => deleteProject(p.id, p.title)}
                          title="Delete"
                          style={{
                            width: 30,
                            height: 30,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 7,
                            border: "1px solid rgba(255,77,77,0.25)",
                            background: "transparent",
                            color: "rgba(255,77,77,0.6)",
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              "rgba(255,77,77,0.1)";
                            (e.currentTarget as HTMLElement).style.color =
                              "var(--red)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              "transparent";
                            (e.currentTarget as HTMLElement).style.color =
                              "rgba(255,77,77,0.6)";
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && !loading && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "var(--text3)",
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "0.8rem",
                      }}
                    >
                      No projects yet. Add your first one →
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── MESSAGES TAB ── */}
          {tab === "messages" && (
            <div>
              <h2
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  marginBottom: "1.25rem",
                }}
              >
                📨 Inbox ({messages.length})
              </h2>

              {messages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "5rem 1rem",
                    color: "var(--text3)",
                  }}
                >
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                    📭
                  </div>
                  <p
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.8rem",
                    }}
                  >
                    No messages yet
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        overflow: "hidden",
                        transition: "border-color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.borderColor =
                          "var(--border2)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.borderColor =
                          "var(--border)")
                      }
                    >
                      {/* Message header — clickable to expand */}
                      <div
                        style={{ padding: "0.9rem 1.1rem", cursor: "pointer" }}
                        onClick={() =>
                          setExpandedMsg(expandedMsg === msg.id ? null : msg.id)
                        }
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            alignItems: "flex-start",
                          }}
                        >
                          {/* Avatar */}
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, var(--accent), var(--accent3))",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "0.82rem",
                              color: "#fff",
                              flexShrink: 0,
                            }}
                          >
                            {msg.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: "0.5rem",
                                flexWrap: "wrap",
                              }}
                            >
                              <div>
                                <span
                                  style={{
                                    fontWeight: 700,
                                    fontSize: "0.88rem",
                                  }}
                                >
                                  {msg.name}
                                </span>
                                <span
                                  style={{
                                    color: "var(--text3)",
                                    fontSize: "0.75rem",
                                    marginLeft: "0.5rem",
                                    fontFamily: "'DM Mono', monospace",
                                  }}
                                >
                                  {new Date(msg.createdAt).toLocaleDateString(
                                    "en-IN",
                                    { day: "numeric", month: "short" },
                                  )}
                                </span>
                              </div>
                              <span
                                style={{
                                  color: "var(--text3)",
                                  fontSize: "0.8rem",
                                  transform:
                                    expandedMsg === msg.id
                                      ? "rotate(180deg)"
                                      : "none",
                                  transition: "transform 0.2s",
                                  flexShrink: 0,
                                }}
                              >
                                ▾
                              </span>
                            </div>
                            <div
                              style={{
                                color: "var(--accent)",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                marginTop: 2,
                              }}
                            >
                              {msg.subject}
                            </div>
                            <div
                              style={{
                                color: "var(--text3)",
                                fontSize: "0.76rem",
                                marginTop: 1,
                              }}
                            >
                              {msg.email}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons row */}
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginTop: "0.75rem",
                            paddingLeft: "2.65rem",
                            flexWrap: "wrap",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              padding: "0.3rem 0.75rem",
                              borderRadius: 6,
                              border: "1px solid var(--border)",
                              color: "var(--text3)",
                              fontSize: "0.74rem",
                              transition: "all 0.15s",
                              whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.borderColor = "var(--accent)";
                              (e.currentTarget as HTMLElement).style.color =
                                "var(--accent)";
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.borderColor = "var(--border)";
                              (e.currentTarget as HTMLElement).style.color =
                                "var(--text3)";
                            }}
                          >
                            ✉️ Reply
                          </a>
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              padding: "0.3rem 0.75rem",
                              borderRadius: 6,
                              border: "1px solid rgba(255,77,77,0.25)",
                              background: "transparent",
                              color: "rgba(255,77,77,0.6)",
                              fontSize: "0.74rem",
                              cursor: "pointer",
                              transition: "all 0.15s",
                              whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "rgba(255,77,77,0.1)";
                              (e.currentTarget as HTMLElement).style.color =
                                "var(--red)";
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "transparent";
                              (e.currentTarget as HTMLElement).style.color =
                                "rgba(255,77,77,0.6)";
                            }}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>

                      {/* Expanded body */}
                      {expandedMsg === msg.id && (
                        <div
                          style={{
                            padding: "0.9rem 1.1rem 1.1rem",
                            borderTop: "1px solid var(--border)",
                            background: "var(--bg2)",
                          }}
                        >
                          <p
                            style={{
                              color: "var(--text2)",
                              fontSize: "0.86rem",
                              lineHeight: 1.8,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {msg.message}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── BLOG TAB ── */}
          {tab === 'blog' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
                <h2 style={{ fontSize:'0.95rem', fontWeight:700 }}>✍️ Blog Posts ({blogPosts.length})</h2>
                <a href="/admin/blog/new" style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.55rem 1.1rem', borderRadius:9, background:'var(--accent)', color:'#fff', fontWeight:700, fontSize:'0.84rem', textDecoration:'none' }}>
                  + New Post
                </a>
              </div>

              {blogPosts.length === 0 ? (
                <div style={{ textAlign:'center', padding:'4rem', color:'var(--text3)', fontFamily:"'DM Mono', monospace", fontSize:'0.8rem' }}>
                  No posts yet. <a href="/admin/blog/new" style={{ color:'var(--accent)' }}>Write your first post →</a>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.7rem' }}>
                  {blogPosts.map(post => (
                    <div key={post.id} style={{ padding:'1rem 1.25rem', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:11, display:'flex', gap:'0.75rem', alignItems:'center', transition:'border-color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor='var(--border2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor='var(--border)'}
                    >
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem', flexWrap:'wrap' }}>
                          <span style={{ fontWeight:700, fontSize:'0.88rem' }}>{post.title}</span>
                          <span style={{ fontSize:'0.63rem', fontWeight:600, padding:'0.12rem 0.45rem', borderRadius:20, background: post.published ? 'rgba(0,230,118,0.1)' : 'rgba(100,116,139,0.1)', color: post.published ? 'var(--green)' : 'var(--text3)', border: post.published ? '1px solid rgba(0,230,118,0.25)' : '1px solid var(--border)' }}>
                            {post.published ? '● Published' : '○ Draft'}
                          </span>
                        </div>
                        <div style={{ display:'flex', gap:'0.5rem', fontFamily:"'DM Mono', monospace", fontSize:'0.65rem', color:'var(--text3)' }}>
                          <span>{post.category}</span><span>·</span><span>{post.reading_time} min</span><span>·</span>
                          <span>{String(post.created_at).split('T')[0]}</span>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'0.35rem', flexShrink:0 }}>
                        {post.published && (
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" title="View post"
                            style={{ width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:7, border:'1px solid var(--border)', color:'var(--text3)', fontSize:'0.8rem', transition:'all 0.15s', textDecoration:'none' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--accent)'; (e.currentTarget as HTMLElement).style.color='var(--accent)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.color='var(--text3)'; }}>↗</a>
                        )}
                        <a href={`/admin/blog/edit/${post.id}`} title="Edit post"
                          style={{ width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:7, border:'1px solid var(--border)', color:'var(--text3)', fontSize:'0.8rem', transition:'all 0.15s', textDecoration:'none' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--accent)'; (e.currentTarget as HTMLElement).style.color='var(--accent)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.color='var(--text3)'; }}>✏️</a>
                        <button title="Delete post" onClick={async () => {
                          if (!confirm(`Delete "${post.title}"?`)) return;
                          const t = JSON.parse(localStorage.getItem('admin_session')||'{}').token||token;
                          const res = await fetch(`/api/blog?id=${post.id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${t}` }});
                          if (res.ok) setBlogPosts(prev => prev.filter(p => p.id !== post.id));
                        }}
                          style={{ width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:7, border:'1px solid rgba(255,77,77,0.25)', background:'transparent', color:'rgba(255,77,77,0.6)', fontSize:'0.78rem', cursor:'pointer', transition:'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,77,77,0.1)'; (e.currentTarget as HTMLElement).style.color='var(--red)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.color='rgba(255,77,77,0.6)'; }}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}




          {/* ── SETTINGS TAB ── */}
          {tab === 'settings' && (
            <div style={{ maxWidth: 600 }}>
              <h2 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:'1.5rem' }}>⚙️ Site Settings</h2>

              {/* Resume */}
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'1.75rem', marginBottom:'1.25rem' }}>
                <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:'0.35rem' }}>📄 Resume / CV</h3>
                <p style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.7rem', color:'var(--text3)', marginBottom:'1.25rem', lineHeight:1.6 }}>
                  Set the URL for your resume. Use <code style={{ color:'var(--accent)' }}>/resume.pdf</code> for the file in your public folder, or paste any external link (Google Drive, Notion, etc).
                </p>

                {/* Current resume preview */}
                <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', padding:'0.85rem 1rem', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:9, marginBottom:'1rem' }}>
                  <span style={{ fontSize:'1.2rem' }}>📎</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--text3)', marginBottom:2 }}>CURRENT RESUME</div>
                    <a href={resumeUrl} target="_blank" rel="noreferrer" style={{ fontSize:'0.85rem', color:'var(--accent)', wordBreak:'break-all' }}>{resumeUrl}</a>
                  </div>
                  <a href={resumeUrl} target="_blank" rel="noreferrer" style={{ padding:'0.35rem 0.75rem', borderRadius:7, border:'1px solid var(--border)', color:'var(--text3)', fontSize:'0.74rem', whiteSpace:'nowrap', transition:'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--accent)'; (e.currentTarget as HTMLElement).style.color='var(--accent)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--border)'; (e.currentTarget as HTMLElement).style.color='var(--text3)'; }}
                  >Preview ↗</a>
                </div>

                {/* Update URL */}
                <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', marginBottom:'0.9rem' }}>
                  <label style={labelStyle}>New Resume URL</label>
                  <input
                    type="text"
                    value={resumeInput}
                    onChange={e => setResumeInput(e.target.value)}
                    placeholder="/resume.pdf or https://drive.google.com/..."
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(0,153,204,0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; }}
                  />
                </div>

                {resumeMsg && (
                  <div style={{ padding:'0.6rem 0.9rem', background: resumeMsg.startsWith('✓') ? 'rgba(0,230,118,0.08)' : 'rgba(255,77,77,0.08)', border: `1px solid ${resumeMsg.startsWith('✓') ? 'rgba(0,230,118,0.2)' : 'rgba(255,77,77,0.2)'}`, borderRadius:8, color: resumeMsg.startsWith('✓') ? 'var(--green)' : 'var(--red)', fontSize:'0.8rem', marginBottom:'0.9rem' }}>
                    {resumeMsg}
                  </div>
                )}

                <button
                  disabled={resumeSaving}
                  onClick={async () => {
                    setResumeSaving(true); setResumeMsg('');
                    try {
                      const res = await fetch('/api/settings', {
                        method:'PUT',
                        headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
                        body: JSON.stringify({ key:'resume_url', value: resumeInput }),
                      });
                      if (res.ok) { setResumeUrl(resumeInput); setResumeMsg('✓ Resume URL updated!'); setTimeout(() => setResumeMsg(''), 3000); }
                      else setResumeMsg('⚠️ Failed to update');
                    } catch { setResumeMsg('⚠️ Network error'); }
                    setResumeSaving(false);
                  }}
                  style={{ padding:'0.75rem 1.5rem', borderRadius:9, border:'none', background: resumeSaving ? 'var(--border2)' : 'var(--accent)', color: resumeSaving ? 'var(--text3)' : '#fff', fontWeight:700, fontSize:'0.86rem', cursor: resumeSaving ? 'not-allowed' : 'pointer', fontFamily:"'Syne', sans-serif" }}
                >
                  {resumeSaving ? 'Saving…' : '💾 Update Resume URL'}
                </button>

                <div style={{ marginTop:'1.25rem', padding:'0.85rem 1rem', background:'rgba(0,153,204,0.04)', border:'1px solid rgba(0,153,204,0.12)', borderRadius:8 }}>
                  <p style={{ fontFamily:"'DM Mono', monospace", fontSize:'0.68rem', color:'var(--text3)', lineHeight:1.7 }}>
                    💡 To replace the PDF file: push a new <code style={{ color:'var(--accent)' }}>resume.pdf</code> to <code style={{ color:'var(--accent)' }}>public/</code> folder and redeploy.<br />
                    To use Google Drive: File → Share → &quot;Anyone with link&quot; → copy link → paste above.
                  </p>
                </div>
              </div>
            </div>
          )}



          {/* ── STATS TAB ── */}
          {tab === "stats" && (
            <div>
              <h2
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  marginBottom: "1.25rem",
                }}
              >
                📊 Stats
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                {[
                  {
                    label: "Projects",
                    value: projects.length,
                    icon: "📁",
                    color: "var(--accent)",
                  },
                  {
                    label: "Featured",
                    value: projects.filter((p) => p.featured).length,
                    icon: "⭐",
                    color: "var(--gold)",
                  },
                  {
                    label: "DeFi",
                    value: projects.filter((p) => p.category === "DeFi").length,
                    icon: "💎",
                    color: "#a855f7",
                  },
                  {
                    label: "Blockchain",
                    value: projects.filter((p) => p.category === "Blockchain")
                      .length,
                    icon: "⛓️",
                    color: "var(--accent)",
                  },
                  {
                    label: "Messages",
                    value: messages.length,
                    icon: "📨",
                    color: "var(--green)",
                  },
                  {
                    label: "Live",
                    value: projects.filter((p) => p.live).length,
                    icon: "🌐",
                    color: "#fb923c",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: "1.1rem",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 11,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{ fontSize: "1.5rem", marginBottom: "0.35rem" }}
                    >
                      {stat.icon}
                    </div>
                    <div
                      style={{
                        fontSize: "1.8rem",
                        fontWeight: 800,
                        color: stat.color,
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "0.62rem",
                        color: "var(--text3)",
                        marginTop: 5,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 11,
                  padding: "1.25rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                    fontFamily: "'DM Mono', monospace",
                    color: "var(--text2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Category Breakdown
                </h3>
                {[
                  "Blockchain",
                  "DeFi",
                  "AI",
                  "Frontend",
                  "Backend",
                  "Other",
                ].map((cat) => {
                  const count = projects.filter(
                    (p) => p.category === cat,
                  ).length;
                  const pct = projects.length
                    ? Math.round((count / projects.length) * 100)
                    : 0;
                  if (!count) return null;
                  return (
                    <div key={cat} style={{ marginBottom: "0.75rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.3rem",
                        }}
                      >
                        <span style={{ fontSize: "0.84rem", fontWeight: 600 }}>
                          {cat}
                        </span>
                        <span
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: "0.7rem",
                            color: "var(--text3)",
                          }}
                        >
                          {count} · {pct}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 5,
                          background: "var(--bg2)",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: catColors[cat] || "var(--accent)",
                            borderRadius: 3,
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom tab bar spacer on mobile */}
        <div className="mobile-tab-spacer" />
      </div>

      <style>{`
        /* ── Keyframes ── */
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.6;transform:scale(1.4);} }

        /* ── Base ── */
        * { box-sizing:border-box; margin:0; padding:0; }
        html { overflow-x:hidden; }
        body { background:var(--bg); }

        /* ── Projects 2-col layout ── */
        .admin-projects-grid {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 1.75rem;
          align-items: start;
        }
        .admin-form-sticky {
          position: sticky;
          top: 64px;
        }

        /* ── Tabs: show in top nav on desktop, bottom bar on mobile ── */
        .admin-tabs-top    { display: flex; }
        .admin-tabs-bottom { display: none; }
        .mobile-tab-spacer { display: none; }
        .view-site-btn     { display: inline; }

        /* ── Tablet ── */
        @media (max-width: 860px) {
          .admin-projects-grid {
            grid-template-columns: 1fr;
          }
          .admin-form-sticky {
            position: static;
          }
        }

        /* ── Mobile ── */
        @media (max-width: 600px) {
          /* Hide top tab labels, keep icons only */
          .tab-label    { display: none; }
          .admin-title  { display: none; }
          .view-site-btn { display: none; }

          /* Show bottom tab bar */
          .admin-tabs-bottom {
            display: flex;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: var(--bg2);
            border-top: 1px solid var(--border);
            z-index: 50;
          }
          .mobile-tab-spacer {
            display: block;
            height: 64px;
          }
        }

        @media (max-width: 400px) {
          .admin-projects-grid { gap: 1rem; }
        }
      `}</style>
    </>
  );
}
