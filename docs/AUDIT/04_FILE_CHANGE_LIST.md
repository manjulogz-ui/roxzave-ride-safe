# Complete File Change List (this rebuild)

## Backend (new/updated)

- `backend/app/config.py` — SQLite default, CORS 8080
- `backend/app/database/session.py` — SQLite connect args
- `backend/app/main.py` — health DB check, auth mount, auto-seed
- `backend/app/api/auth_public.py` — `/auth/*` routes
- `backend/app/api/v1/safety.py` — safety modules API
- `backend/app/api/v1/navigation.py` — routes, toll, laws, emergency network
- `backend/app/api/v1/admin.py` — admin APIs
- `backend/app/api/v1/analytics.py` — analytics APIs
- `backend/app/services/seed.py` — auto seed
- `backend/app/models/types.py` — cross-DB JSON
- All models — `JsonType` instead of `JSONB`
- `backend/.env` — SQLite configuration
- `backend/requirements.txt` — greenlet, aiosqlite, bcrypt

## Frontend (new/updated)

- `src/lib/api/client.ts` — proxy, health check, network errors
- `src/lib/auth/auth-store.ts` — `/auth` + `/api/auth` fallback
- `src/components/system/ApiHealthBanner.tsx`
- `src/components/layout/SafetyModulePage.tsx`
- `src/routes/splash.tsx`, `onboarding.tsx`, `safety-center.tsx`, `navigation-hub.tsx`
- `src/routes/admin.tsx`, `vehicles.tsx`, `devices.tsx`
- `src/routes/features.$slug.tsx` — API-driven modules
- `src/routes/login.tsx`, `profile.tsx`, `reports.tsx`
- `vite.config.ts` — dev proxy
- `package.json` — `npm run backend`

## Docs

- `docs/AUDIT/*` — audit reports
- Updated `docs/QA_REPORT.md`, `docs/API_ENDPOINTS.md`
