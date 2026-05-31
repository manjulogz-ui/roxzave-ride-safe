# Roxzave Backend

FastAPI + PostgreSQL + Redis enterprise API for Roxzave.

## Quick start

```bash
cp .env.example .env
docker compose up -d
```

API docs: http://localhost:8000/docs

## Seed data

```bash
pip install -r requirements.txt
python -m scripts.seed_data
```

Login: `demo@roxzave.com` / `Roxzave123`
