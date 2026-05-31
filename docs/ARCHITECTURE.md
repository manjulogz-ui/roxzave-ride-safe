# Roxzave Full-Stack Architecture

```mermaid
flowchart TB
  subgraph clients [Clients]
    PWA[React PWA - Vite + TanStack Router]
    RN[React Native / Capacitor Android]
  end
  subgraph api [Backend]
    FastAPI[FastAPI API :8000]
    WS[WebSockets /ws]
    Redis[(Redis Cache)]
  end
  subgraph data [Data]
    PG[(PostgreSQL)]
    S3[AWS S3 / Supabase Storage]
  end
  subgraph external [External]
    Maps[Google Maps / OSM]
    ESP[ESP32 + MPU6050]
  end
  PWA --> FastAPI
  RN --> FastAPI
  PWA --> WS
  RN --> WS
  FastAPI --> PG
  FastAPI --> Redis
  FastAPI --> Maps
  ESP --> FastAPI
  FastAPI --> S3
```

## Repositories

| Path | Purpose |
|------|---------|
| `src/` | PWA + Capacitor web bundle |
| `backend/` | FastAPI, SQLAlchemy, WebSockets |
| `android/` | Capacitor native shell |
| `mobile/services/` | RN API service templates |

## Auth Flow

JWT access (30m) + refresh (7d) → `Authorization: Bearer` on all protected routes.

## Real-time

- `/ws/guardian/{user_id}` — live location fan-out
- `/ws/{channel}` — generic pub/sub
