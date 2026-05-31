/**
 * Starts Roxzave FastAPI: bootstrap DB → uvicorn on dynamic port.
 */
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");
const { readBackendPort, portFilePath } = require("./port-utils.cjs");
const { isWindows } = require("./spawn-utils.cjs");

const backendDir = path.join(__dirname, "..", "backend");
const python = process.env.PYTHON || (isWindows() ? "python" : "python3");
const port = readBackendPort();

function runPython(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(python, args, {
      cwd: backendDir,
      stdio: "inherit",
      shell: false,
      windowsHide: true,
    });
    proc.on("error", reject);
    proc.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${python} exited ${code}`))));
  });
}

function waitForHealth(maxWaitMs = 90_000) {
  const url = `http://127.0.0.1:${port}/health`;
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode === 200) {
          resolve();
        } else if (Date.now() - started > maxWaitMs) {
          reject(new Error(`Health returned ${res.statusCode}`));
        } else {
          setTimeout(attempt, 500);
        }
      });
      req.on("error", () => {
        if (Date.now() - started > maxWaitMs) {
          reject(new Error(`API not reachable at ${url}`));
        } else {
          setTimeout(attempt, 500);
        }
      });
      req.setTimeout(3000, () => {
        req.destroy();
        if (Date.now() - started > maxWaitMs) {
          reject(new Error("Health check timeout"));
        } else {
          setTimeout(attempt, 500);
        }
      });
    };
    attempt();
  });
}

async function main() {
  console.log(`\n[BACKEND] Port: ${port} (${portFilePath})\n`);
  console.log("[BACKEND] Bootstrapping database…\n");

  await runPython(["scripts/bootstrap.py"]);
  console.log("\n[BACKEND] Database bootstrap: OK\n");
  console.log(`[BACKEND] Starting FastAPI → http://127.0.0.1:${port}\n`);

  const server = spawn(
    python,
    ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", String(port), "--reload"],
    {
      cwd: backendDir,
      stdio: "inherit",
      shell: false,
      windowsHide: true,
      env: { ...process.env, ROXZAVE_BACKEND_PORT: String(port) },
    },
  );

  server.on("error", (err) => {
    console.error("[BACKEND] Failed to start:", err.message);
    process.exit(1);
  });

  server.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[BACKEND] Exited with code ${code}`);
      process.exit(code);
    }
  });

  waitForHealth()
    .then(() => {
      console.log(`[BACKEND] API healthy → http://127.0.0.1:${port}/health\n`);
    })
    .catch(() => {
      /* frontend will retry */
    });

  process.on("SIGINT", () => {
    server.kill();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    server.kill();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("[BACKEND] Startup failed:", err.message);
  process.exit(1);
});
