# CostSignal Portal

Developer portal for [CostSignal](https://costsignal.io) — manage API keys, monitor usage, and integrate economic data series (BLS, FRED, EIA) into your applications.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/GERRYKL-0325/costsignal-portal&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,ADMIN_SECRET)

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **Clerk** — auth, OAuth, MFA
- **Supabase** — PostgreSQL (users, api_keys, usage_logs)
- **Vercel** — hosting

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/GERRYKL-0325/costsignal-portal.git
cd costsignal-portal
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [Clerk Dashboard](https://dashboard.clerk.com) → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase](https://app.supabase.com) → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (keep secret!) |
| `ADMIN_SECRET` | Generate: `openssl rand -hex 32` |

### 3. Set up Supabase schema

Option A — Supabase CLI:
```bash
npx supabase db push
```

Option B — Paste into Supabase SQL editor:
```
supabase/migrations/001_init.sql
```

### 4. Configure Clerk

In your [Clerk Dashboard](https://dashboard.clerk.com):

1. Create a new application
2. Set **Redirect URLs**:
   - Sign-in: `/sign-in`
   - Sign-up: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`
3. Enable any OAuth providers you want (Google, GitHub, etc.)

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Architecture

```
app/
  layout.tsx              # ClerkProvider, Inter font, dark theme
  page.tsx                # Landing → redirects authed users to /dashboard
  sign-in/[[...sign-in]]/ # Clerk sign-in UI
  sign-up/[[...sign-up]]/ # Clerk sign-up UI
  dashboard/
    layout.tsx            # Sidebar nav + top bar
    page.tsx              # Usage overview (stats, recent calls, key copy)
    keys/page.tsx         # Key management (view, regenerate, reveal)
    usage/page.tsx        # Usage logs (date filter, table, CSV export)
  api/
    validate-key/         # POST — FastAPI backend calls this to verify keys
    keys/generate/        # POST — generate or rotate a key
    keys/revoke/          # POST — revoke active key
lib/
  supabase.ts             # Supabase clients (browser anon + server service_role)
  api-keys.ts             # generateApiKey, hashKey, rotateKey, lookupKeyByHash
middleware.ts             # Clerk: protect /dashboard/*
supabase/migrations/
  001_init.sql            # users, api_keys, usage_logs schema + RLS
```

---

## API Reference

### `POST /api/validate-key`

Called by the CostSignal FastAPI backend to verify a key and log usage.

**Headers:** `x-admin-secret: <ADMIN_SECRET>`

**Request:**
```json
{
  "key": "cs_abc123...",
  "endpoint": "/series/CPIAUCSL",
  "series": ["CPIAUCSL"],
  "status_code": 200,
  "response_time_ms": 142
}
```

**Response:**
```json
{ "valid": true, "user_id": "uuid", "plan": "free" }
```

### `POST /api/keys/generate`

Authenticated. Generates a new key (or rotates existing).

**Body:** `{ "rotate": true }` (omit to just generate without revoking)

**Response:** `{ "rawKey": "cs_...", "key": { id, key_prefix, ... } }`

### `POST /api/keys/revoke`

Authenticated. Revokes all active keys for the user.

---

## Security

- API keys: `cs_` + 32 random hex chars — stored as `sha256(raw)`, shown **once**
- No PII in `usage_logs` — only `key_prefix` (first 10 chars)
- Clerk handles all auth — no password storage
- Server-side Supabase always uses `service_role` key
- Client uses `anon` key + RLS (no direct write access)
- `validate-key` protected by `ADMIN_SECRET` header

---

## Deploy to Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com/new)
3. Add all env vars from `.env.example`
4. Set custom domain: `portal.costsignal.io`

Or use the button at the top ↑

---

## FastAPI Integration

In your CostSignal FastAPI backend, verify keys by calling this portal:

```python
import httpx

async def verify_api_key(key: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://portal.costsignal.io/api/validate-key",
            headers={"x-admin-secret": ADMIN_SECRET},
            json={
                "key": key,
                "endpoint": "/series/CPIAUCSL",
                "series": ["CPIAUCSL"],
                "status_code": 200,
                "response_time_ms": 150,
            },
        )
    return response.json()
```

---

## Local DB

For local development with real Supabase, just use the hosted project — there's no need for a local Supabase instance unless you want full isolation.

---

*Built for [CostSignal](https://costsignal.io) — Economic data infrastructure for developers.*
