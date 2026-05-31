/**
 * Waits for backend health on dynamic port, then starts Vite.
 */
const path = require("path");
const http = require("http");
const { waitForPortFile } = require("./port-utils.cjs");
const { spawnNpx, resolveViteBin, spawnNodeScript } = require("./spawn-utils.cjs");
const fs = require("fs");

const rootDir = path.join(__dirname, "..");

function waitForHealth(port, maxWaitMs = 120_000) {
  const url = `http://127.0.0.1:${port}/health`;
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(body));
            } catch {
              resolve({ status: "healthy" });
            }
          } else if (Date.now() - started > maxWaitMs) {
            reject(new Error(`Health HTTP ${res.statusCode}`));
          } else {
            setTimeout(attempt, 750);
          }
        });
      });
      req.on("error", () => {
        if (Date.now() - started > maxWaitMs) {
          reject(new Error(`Cannot reach ${url}`));
        } else {
          setTimeout(attempt, 750);
        }
      });
      req.setTimeout(5000, () => {
        req.destroy();
        setTimeout(attempt, 750);
      });
    };
    attempt();
  });
}

function spawnVite(env) {
  const viteJs = resolveViteBin(rootDir);
  if (fs.existsSync(viteJs)) {
    return spawnNodeScript(viteJs, ["dev", "--open"], { cwd: rootDir, env });
  }
  return spawnNpx(["vite", "dev", "--open"], { cwd: rootDir, env });
}

async function main() {
  console.log("\n[FRONTEND] Reading backend port…\n");
  const port = await waitForPortFile();
  console.log(`[FRONTEND] Backend port: ${port}`);
  console.log(`[FRONTEND] Waiting for health endpoint → http://127.0.0.1:${port}/health\n`);

  let health;
  try {
    health = await waitForHealth(port);
  } catch (err) {
    console.error("[FRONTEND] API not ready yet:", err.message);
    console.log("[FRONTEND] Retrying (database bootstrap may still be running)…\n");
    health = await waitForHealth(port, 180_000);
  }

  console.log("[FRONTEND] Health check passed");
  console.log("[FRONTEND] API status:", health.status ?? "healthy");
  console.log("[FRONTEND] Database:", health.database ?? "connected");
  console.log(`[FRONTEND] Starting Vite (proxy → 127.0.0.1:${port})…\n`);

  const env = {
    ROXZAVE_BACKEND_PORT: String(port),
    VITE_BACKEND_PORT: String(port),
    VITE_API_URL: "",
  };

  const vite = spawnVite(env);

  vite.on("error", (err) => {
    console.error("[FRONTEND] Vite failed:", err.message);
    process.exit(1);
  });

  vite.on("spawn", () => {
    console.log("[FRONTEND] Frontend started successfully.\n");
    console.log("[FRONTEND] Open the URL shown below in your browser.\n");
  });

  vite.on("exit", (code) => process.exit(code ?? 0));

  process.on("SIGINT", () => vite.kill("SIGINT"));
  process.on("SIGTERM", () => vite.kill("SIGTERM"));
}

main().catch((err) => {
  console.error("[FRONTEND] Startup failed:", err.message);
  process.exit(1);
});
