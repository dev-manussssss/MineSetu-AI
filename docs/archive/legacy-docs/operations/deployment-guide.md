# Vercel Deployment Guide — MDMS + Mindsetu AI

## 1. Project Deployment Overview

MDMS + Mindsetu AI is architected for seamless hosting on Vercel with zero local filesystem dependencies and automated preview deployments.

- **Platform**: Vercel Serverless & Static CDN
- **Framework Preset**: Vite
- **Root Directory**: `frontend/` (or repository root with configured build)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: `20.x` or `22.x`

---

## 2. Environment Variables Configuration

Set these in the Vercel Dashboard under **Project Settings → Environment Variables**:

| Variable Name | Environment | Target & Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Production / Preview | Supabase project REST URL |
| `VITE_SUPABASE_ANON_KEY` | Production / Preview | Supabase public anonymous API key |
| `VITE_APP_ENV` | Production / Preview | `production` or `preview` |
| `VITE_APP_DEMO_MODE` | Production / Preview | `true` (enables synthetic fallback data) |
| `SUPABASE_SERVICE_ROLE_KEY` | Serverless / Edge Only | Privileged database admin key |
| `GROK_API_KEY_PRIMARY` | Serverless / Edge Only | Primary xAI Grok API key |
| `GROK_API_KEY_FALLBACK` | Serverless / Edge Only | Backup failover xAI Grok API key |

> **CRITICAL SECURITY RULE**: Never prefix server-side keys (`GROK_API_KEY_*`, `SUPABASE_SERVICE_ROLE_KEY`) with `VITE_`. Vercel ensures that variables without `VITE_` are never baked into client bundles.

---

## 3. Serverless Functions & Routing

In `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
This guarantees client-side SPA routing (React Router) functions properly without 404 errors on deep linking.

---

## 4. Pre-Deployment Verification Checklist

Before triggering a production build:
- [ ] `npm run lint` passes without errors.
- [ ] `npm run typecheck` passes with zero TypeScript diagnostic errors.
- [ ] `npm run build` generates clean bundles in `dist/`.
- [ ] Verified that no secrets are committed in git or printed in logs.
- [ ] Demo persona switching and fallback mode function properly.

---

## 5. Rollback & Troubleshooting

- **Instant Rollback**: If a regression occurs, navigate to **Deployments** in the Vercel dashboard and click **Promote to Production** on the previous stable build.
- **Common Issue**: Blank screen on nested route refresh → Check that `vercel.json` rewrites are present.
