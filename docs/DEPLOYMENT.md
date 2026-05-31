# Roxzave Deployment Guide

## Prerequisites

- Node.js 20+
- Python 3.12+
- Docker & Docker Compose
- PostgreSQL 16 (via Docker)

## Backend

```bash
cd backend
cp .env.example .env
docker compose up -d
# API: http://localhost:8000/docs
```

Seed demo data:

```bash
cd backend
pip install -r requirements.txt
# Set DATABASE_URL_SYNC in .env
python -m scripts.seed_data
```

Demo login: `demo@roxzave.com` / `Roxzave123`

## PWA

```bash
cp .env.example .env
# VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

## Mobile (Capacitor)

```bash
npm run cap:sync
npm run cap:android
```

## Production checklist

- [ ] Change `JWT_SECRET_KEY` and `JWT_REFRESH_SECRET_KEY`
- [ ] Enable HTTPS (reverse proxy)
- [ ] Configure `CORS_ORIGINS` for production domains
- [ ] Run Alembic migrations (replace `create_all` in dev)
- [ ] Set `GOOGLE_MAPS_API_KEY` or `MAPBOX_ACCESS_TOKEN`
- [ ] Configure S3 for file uploads
- [ ] Enable Redis for rate limiting & sessions
