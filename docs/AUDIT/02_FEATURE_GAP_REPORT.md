# Feature Gap Analysis — Roxzave Enterprise PRD

## Legend

- **Implemented** — UI + API + persistence working
- **Partial** — UI or API only; needs depth
- **Missing** — Not built

---

## Authentication

| Feature | Status |
|---------|--------|
| Login | **Implemented** |
| Signup | **Implemented** |
| Guest | **Implemented** |
| Forgot / Reset password | **Partial** (token in-memory) |
| JWT + Refresh | **Implemented** |
| Remember me | **Implemented** (client storage) |
| Logout | **Implemented** |

---

## Core platform pages

| Page | Status |
|------|--------|
| Splash | **Implemented** `/splash` |
| Onboarding | **Implemented** `/onboarding` |
| Login / Signup | **Implemented** |
| Home dashboard | **Implemented** |
| Navigation hub | **Implemented** `/navigation-hub` |
| Safety center | **Implemented** `/safety-center` |
| Emergency (SOS) | **Implemented** |
| Women safety | **Implemented** |
| Trip history | **Partial** (API; empty without trips) |
| Vehicles | **Implemented** `/vehicles` |
| Profile / Settings | **Implemented** |
| Notifications | **Implemented** |
| Admin dashboard | **Implemented** `/admin` |
| BLE / ESP32 | **Implemented** `/devices` |

---

## 20 PRD safety modules

| # | Module | Status |
|---|--------|--------|
| 1 | Drowsiness detection | **Partial** — API events + module UI |
| 2 | Auto crash detection | **Partial** — API + device endpoint |
| 3 | Golden hour SOS | **Partial** — SOS + status API |
| 4 | Trauma assistant | **Partial** — guidance API + SOS link |
| 5 | Pothole detection | **Partial** — reports API + map layers |
| 6 | Safe route engine | **Partial** — score API; GraphHopper not wired |
| 7 | Fuel cost prediction | **Implemented** |
| 8 | Petrol bunk intelligence | **Implemented** |
| 9 | Toll intelligence | **Partial** — estimate API |
| 10 | Traffic law engine | **Partial** — static laws API |
| 11 | Voice co-pilot (5 langs) | **Missing** — UI stub only |
| 12 | Driving scorecard | **Implemented** |
| 13 | Insurance telematics | **Partial** — dashboard template |
| 14 | Emergency network map | **Partial** — API list |
| 15 | School safety | **Partial** — zones in map layers |
| 16 | Women safety shield | **Partial** |
| 17 | Women safe route | **Partial** — uses safe-route API |
| 18 | Guardian tracking | **Partial** — WebSocket client |
| 19 | Voice distress | **Partial** — UI + SOS link |
| 20 | AI road quality | **Partial** — feature page |

---

## Admin portal

| Area | Status |
|------|--------|
| User list | **Implemented** |
| Analytics overview | **Implemented** |
| SOS monitor | **Implemented** |
| Heatmaps | **Missing** |
| Moderation | **Missing** |

---

## Hardware

| Item | Status |
|------|--------|
| Device register / telemetry | **Implemented** |
| Crash / pothole events | **Implemented** |
| BLE pairing UI | **Partial** (HTTP register, not BLE stack) |

---

## Mobile / Expo

| Item | Status |
|------|--------|
| Capacitor Android | **Implemented** |
| API services (`mobile/services/`) | **Implemented** |
| Expo iOS/Android app | **Missing** (templates only) |

---

## Summary counts

- **Fully implemented:** ~12 areas
- **Partial:** ~22 areas  
- **Missing:** ~8 areas (voice AI, GraphHopper, push, S3, Expo app, heatmaps, full BLE)
