# Production Readiness Checklist

## Infrastructure
- [x] FastAPI backend with Docker Compose (PostgreSQL + Redis)
- [x] JWT access + refresh tokens
- [x] WebSocket guardian channel
- [x] CORS configuration
- [ ] HTTPS / TLS termination (nginx/Caddy)
- [ ] Alembic migrations (dev uses `create_all`)
- [ ] Redis session/rate-limit integration

## Frontend (PWA)
- [x] 25+ routes — auth, profile, SOS, community, AI, features
- [x] Axios API client with token refresh
- [x] Route guards on protected pages
- [x] Live map (OSM embed + API layers)
- [x] `npm run build` passes
- [x] `npm run mobile-build` for Capacitor
- [ ] Web Push notifications
- [ ] Offline cache (service worker)

## Mobile
- [x] Capacitor Android project
- [x] API service templates (`mobile/services/`)
- [ ] Expo app (separate repo recommended)
- [ ] Expo Push notifications

## Security
- [x] bcrypt password hashing
- [ ] Rate limiting (slowapi wired in requirements)
- [ ] Production JWT secrets
- [ ] S3 presigned uploads

## Data
- [x] Full PostgreSQL schema (20+ tables)
- [x] Seed script for demo user + petrol/community
- [ ] Automated backups

## Hardware
- [x] ESP32 device API (`/api/device/*`)
