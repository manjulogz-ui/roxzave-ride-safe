// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

function resolveBackendPort(): number {
  const root = path.resolve(import.meta.dirname ?? __dirname);
  const portFile = path.join(root, ".dev-backend-port");
  if (fs.existsSync(portFile)) {
    const parsed = parseInt(fs.readFileSync(portFile, "utf8").trim(), 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  const fromEnv = Number(process.env.VITE_BACKEND_PORT || process.env.ROXZAVE_BACKEND_PORT);
  if (!Number.isNaN(fromEnv) && fromEnv > 0) return fromEnv;
  return 8000;
}

const backendPort = resolveBackendPort();
const backendOrigin = `http://127.0.0.1:${backendPort}`;
const wsOrigin = `ws://127.0.0.1:${backendPort}`;

console.log(`[Roxzave] Vite proxy → ${backendOrigin}`);

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    server: {
      proxy: {
        "/api": { target: backendOrigin, changeOrigin: true },
        "/auth": { target: backendOrigin, changeOrigin: true },
        "/health": { target: backendOrigin, changeOrigin: true },
        "/docs": { target: backendOrigin, changeOrigin: true },
        "/ws": { target: wsOrigin, ws: true },
      },
    },
  },
});
