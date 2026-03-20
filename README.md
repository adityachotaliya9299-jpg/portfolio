# Aditya Chotaliya — Portfolio Website

> Next.js 16 + TypeScript · Light/Dark Theme · Fully Mobile Responsive · Admin Panel

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:3000
# → http://localhost:3000/admin  
```

## What's Included

- **Light/Dark theme toggle** — persists to localStorage, respects system preference
- **Fully mobile responsive** — hamburger drawer nav, fluid grids down to 380px
- **Admin Panel** — Add/delete projects, manage contact messages, view stats
- **JSON backend** — data/projects.json & data/messages.json (swap for DB in production)

## Env Variables (.env.local)

```
ADMIN_PASSWORD=adminpassword
```

## Deploy to Vercel

```bash
npx vercel --prod
```

> ⚠️  Vercel has an ephemeral filesystem. Replace JSON storage with Supabase/PlanetScale for production.

Built by Aditya Chotaliya · MIT
