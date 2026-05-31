/**
 * Roxzave unified dev entry — port allocation, then backend + frontend (no shell strings).
 */
const path = require("path");
const {
  allocateBackendPort,
  writeDevPortFiles,
  printStartupDiagnostics,
} = require("./port-utils.cjs");
const { spawnDevScript } = require("./spawn-utils.cjs");

const rootDir = path.join(__dirname, "..");

/** @type {import('child_process').ChildProcess[]} */
const children = [];

function shutdown(signal) {
  console.log(`\n[Roxzave] Shutting down (${signal})…\n`);
  for (const child of children) {
    if (child && !child.killed) {
      try {
        child.kill();
      } catch {
        /* ignore */
      }
    }
  }
}

async function main() {
  let port;
  let skipped = [];
  try {
    const result = await allocateBackendPort();
    port = result.port;
    skipped = result.skipped;
  } catch (err) {
    console.error("\n[Roxzave] Port allocation failed:", err.message);
    process.exit(1);
  }

  writeDevPortFiles(port);
  await printStartupDiagnostics(port, skipped);

  const env = {
    ROXZAVE_BACKEND_PORT: String(port),
    VITE_BACKEND_PORT: String(port),
  };

  const backendProc = spawnDevScript("backend", {
    cwd: rootDir,
    env,
    label: "backend",
  });
  children.push(backendProc);

  const frontendProc = spawnDevScript("frontend", {
    cwd: rootDir,
    env,
    label: "frontend",
  });
  children.push(frontendProc);

  backendProc.on("error", (err) => {
    console.error("[Roxzave] Backend process error:", err.message);
  });

  frontendProc.on("error", (err) => {
    console.error("[Roxzave] Frontend process error:", err.message);
  });

  backendProc.on("exit", (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`[Roxzave] Backend exited (code=${code}, signal=${signal})`);
    }
  });

  frontendProc.on("exit", (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`[Roxzave] Frontend exited (code=${code}, signal=${signal})`);
    }
    if (children.every((c) => c.exitCode !== null)) {
      process.exit(code ?? 1);
    }
  });

  process.on("SIGINT", () => {
    shutdown("SIGINT");
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    shutdown("SIGTERM");
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("[Roxzave] Dev startup failed:", err.message);
  process.exit(1);
});
