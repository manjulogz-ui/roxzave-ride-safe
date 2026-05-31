# Root Cause Report — Login "Network Error"

## Symptom

Login, signup, and guest flows showed **"Network Error"** (axios `ERR_NETWORK`).

## Root causes (verified)

| # | Cause | Impact |
|---|--------|--------|
| 1 | **Backend not running** | No process on port 8000 → connection refused |
| 2 | **PostgreSQL required but unavailable** | `backend/.env` pointed to Postgres; Docker not installed on dev machine → API crashed on startup |
| 3 | **Missing Python `greenlet`** | SQLAlchemy async engine failed before serving requests |
| 4 | **JSONB columns incompatible with SQLite** | Table creation failed when SQLite fallback used |
| 5 | **CORS / cross-origin** | Frontend on `http://localhost:8080`, CORS allowed only `5173` |
| 6 | **No dev proxy** | Browser blocked direct calls to `:8000` from `:8080` |

## Fixes applied

1. **SQLite dev database** (`backend/.env` → `sqlite+aiosqlite:///./roxzave.db`)
2. **`greenlet` + `aiosqlite`** in `requirements.txt`
3. **`JsonType`** instead of PostgreSQL-only `JSONB`
4. **Auto-seed** on startup (`demo@roxzave.com` / `Roxzave123`)
5. **Vite proxy** for `/api`, `/auth`, `/health` in `vite.config.ts`
6. **API client** uses same-origin in dev (`baseURL: ""`)
7. **CORS** includes port 8080 + regex for LAN IPs
8. **PRD auth paths** mounted at `/auth/*` and `/api/auth/*`
9. **`ApiHealthBanner`** on login with start instructions
10. **`npm run backend`** script to start API easily

## How to verify

```powershell
# Terminal 1
npm run backend

# Terminal 2
npm run dev
```

Login page should show **API connected · connected**. Use demo credentials above.
