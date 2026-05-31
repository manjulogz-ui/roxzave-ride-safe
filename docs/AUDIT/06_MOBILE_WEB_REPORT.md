# Mobile & Web Compatibility Report

## Web (TanStack Start + Vite)

| Check | Status |
|-------|--------|
| Dev server port 8080 | OK |
| API via Vite proxy | OK — no CORS issues |
| `npm run build` | OK |
| All routes in `routeTree.gen.ts` | OK |
| Auth session in localStorage | OK |

## PWA / Capacitor

| Check | Status |
|-------|--------|
| `npm run mobile-build` | OK |
| `mobile-dist/` output | OK |
| `capacitor.config.ts` | OK |
| Set `VITE_API_URL` to LAN IP for device testing | Required for physical device |

## Expo (React Native)

| Check | Status |
|-------|--------|
| Standalone Expo app | Not in repo |
| `mobile/services/*.ts` | Ready for Expo — set `EXPO_PUBLIC_API_URL` |

## Recommendation

For Android emulator: `VITE_API_URL=http://10.0.2.2:8000`  
For physical phone: `http://<your-pc-ip>:8000` + backend bound to `0.0.0.0`
