# Aditya Chotaliya — Developer Portfolio

> Personal portfolio website built with **Next.js 16 + TypeScript** — showcasing blockchain projects, services, research, and a full admin panel.

[![Live Demo](https://img.shields.io/badge/Live-Portfolio-00d4ff?style=for-the-badge&logo=vercel)](https://portfolio-one-bice-xqt0376aiu.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## ✨ Features

- **Light / Dark Theme** — toggle with one click, persists to localStorage, respects system preference
- **Fully Mobile Responsive** — slide-out drawer nav, fluid grids down to 380px
- **Sections** — Hero · About · Services · Projects · Process · Research · Testimonials · Contact
- **GATE Achievements** — AIR 61 (2026) & AIR 154 (2025) with downloadable PDF scorecards
- **Admin Panel** (`/admin`) — add/delete projects, read contact messages, view stats
- **Contact Form** — saves messages + sends instant Gmail notification to you
- **OG Image** — auto-generated social preview card for WhatsApp / LinkedIn shares
- **Google Analytics** — ready, just add your `NEXT_PUBLIC_GA_ID`
- **Custom 404 Page** — themed, on-brand error page
- **Zero UI Library** — pure CSS with CSS variables, no Tailwind, no MUI

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (Pages Router) |
| Language | TypeScript 5 |
| Styling | Pure CSS — CSS Variables + `clamp()` |
| Fonts | Syne (display) · DM Mono (code) |
| Email | Nodemailer + Gmail SMTP |
| OG Image | `@vercel/og` |
| Storage | Neon PostgreSQL (serverless) |
| ORM | @neondatabase/serverless |
| Deployment | Vercel |

---

## 📁 Project Structure

```
portfolio/
├── components/
│   ├── Navbar.tsx          # Sticky nav — theme toggle + mobile drawer
│   └── ThemeContext.tsx     # Light/dark theme provider
├── data/
│   ├── projects.json        # Projects database (editable via admin)
│   └── messages.json        # Contact form submissions
├── pages/
│   ├── index.tsx            # Main portfolio page (all sections)
│   ├── admin.tsx            # Password-protected admin dashboard
│   ├── 404.tsx              # Custom not-found page
│   ├── _app.tsx             # ThemeProvider wrapper
│   ├── _document.tsx        # OG tags + fonts + Google Analytics
│   └── api/
│       ├── auth.ts          # Admin login
│       ├── projects.ts      # GET / POST / DELETE projects
│       ├── contact.ts       # Contact form + Gmail notification
│       ├── messages.ts      # Admin: read/delete messages
│       └── og.tsx           # Auto-generated OG social image
├── public/
│   ├── gate-2026.pdf        # GATE 2026 scorecard (AIR 61)
│   └── gate-2025.pdf        # GATE 2025 scorecard (AIR 154)
├── styles/
│   └── globals.css          # Design system — CSS variables, dark + light themes
└── .env.local               # Environment variables (never commit)
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/adityachotaliya9299-jpg/portfolio.git
cd portfolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
# Admin panel password
ADMIN_PASSWORD=yourSecurePasswordHere

# Gmail notifications (contact form)
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

> **Gmail App Password:** Google Account → Security → 2-Step Verification must be ON → search "App Passwords" → create one → use the 16-character code.

### 4. Run locally

```bash
npm run dev
# → http://localhost:3000
# → http://localhost:3000/admin
```

### 5. Build for production

```bash
npm run build
npm start
```

---

## 🔐 Admin Panel

Visit `/admin` and log in with your `ADMIN_PASSWORD`.

| Tab | What it does |
|---|---|
| **Projects** | Add new projects (title, desc, tags, GitHub, live URL, category, featured toggle) · Delete existing |
| **Messages** | Expandable inbox · Reply via mailto · Delete messages |
| **Stats** | Project count · Category breakdown bar chart · Message count · Live projects |

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/projects` | Public | Fetch all projects |
| `POST` | `/api/projects` | Admin | Add a project |
| `DELETE` | `/api/projects?id=` | Admin | Delete a project |
| `POST` | `/api/contact` | Public | Submit contact form + send Gmail |
| `GET` | `/api/messages` | Admin | Fetch all messages |
| `DELETE` | `/api/messages?id=` | Admin | Delete a message |
| `POST` | `/api/auth` | Public | Verify admin password |
| `GET` | `/api/og` | Public | Generate OG social preview image |

---

## 🌐 Deploy to Vercel

**Via Vercel Dashboard (recommended):**
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import this repo
3. Add environment variables (see above)
4. Click Deploy

**Or via CLI:**
```bash
npm install -g vercel
vercel --prod
```

> ⚠️ **Important:** Vercel's filesystem is ephemeral — data written to `data/*.json` resets on each deploy. For persistent storage, replace JSON files with **neon.tech** (free tier).

---

## 🗃️ Database — Neon PostgreSQL

This project uses [Neon](https://neon.tech) as a serverless PostgreSQL backend.

### Tables
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  github TEXT NOT NULL,
  live TEXT DEFAULT '',
  category TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  created_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Environment Variable

Add to `.env.local` and Vercel:
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/portfolio?sslmode=require
```

## 🏆 Achievements

| Exam | Year | Organising Institute | AIR | Score | Marks |
|---|---|---|---|---|---|
| GATE — Computer Science | 2026 | IIT Guwahati | **61** | 914 | 70.9 / 100 |
| GATE — Computer Science | 2025 | IIT Roorkee | **154** | 853 | 78.64 / 100 |

---

## 📬 Contact

**Aditya Chotaliya** — Blockchain Developer & Smart Contract Engineer

- 📧 adityachotaliya9299@gmail.com
- 💼 [GitHub](https://github.com/adityachotaliya9299-jpg)
- 🔗 [LinkedIn](https://linkedin.com/in/aditya-chotaliya)

---

## 📄 License

MIT © 2025 Aditya Chotaliya
