/**
 * Cross-platform process spawning (no shell string parsing).
 * On Windows, .cmd files (npm.cmd) cannot spawn with shell:false (EINVAL).
 * We invoke npm via node + npm-cli.js, or run dev scripts with process.execPath directly.
 */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

function isWindows() {
  return process.platform === "win32";
}

function resolveNpmCli() {
  const candidates = [
    path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js"),
    path.join(path.dirname(process.execPath), "..", "lib", "node_modules", "npm", "bin", "npm-cli.js"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * npm run <script> — cross-platform via node npm-cli.js (shell:false).
 */
function spawnNpmRun(scriptName, options = {}) {
  const { cwd, env, stdio = "inherit", label } = options;
  if (label) {
    console.log(`[Roxzave] Launching ${label}… (npm run ${scriptName})`);
  }

  const npmCli = resolveNpmCli();
  if (npmCli) {
    return spawn(process.execPath, [npmCli, "run", scriptName], {
      cwd,
      env: { ...process.env, ...env },
      stdio,
      shell: false,
      windowsHide: true,
    });
  }

  if (isWindows()) {
    return spawn("npm.cmd", ["run", scriptName], {
      cwd,
      env: { ...process.env, ...env },
      stdio,
      shell: true,
      windowsHide: true,
    });
  }

  return spawn("npm", ["run", scriptName], {
    cwd,
    env: { ...process.env, ...env },
    stdio,
    shell: false,
    windowsHide: true,
  });
}

/**
 * Run scripts/dev-<name>.cjs directly (same as npm run backend / frontend).
 */
function spawnDevScript(name, options = {}) {
  const { cwd, env, stdio = "inherit", label } = options;
  const scriptPath = path.join(__dirname, `dev-${name}.cjs`);
  if (label) {
    console.log(`[Roxzave] Launching ${label}… (node scripts/dev-${name}.cjs)`);
  }
  return spawn(process.execPath, [scriptPath], {
    cwd,
    env: { ...process.env, ...env },
    stdio,
    shell: false,
    windowsHide: true,
  });
}

function spawnNodeScript(scriptPath, args = [], options = {}) {
  const { cwd, env, stdio = "inherit" } = options;
  return spawn(process.execPath, [scriptPath, ...args], {
    cwd,
    env: { ...process.env, ...env },
    stdio,
    shell: false,
    windowsHide: true,
  });
}

function npxExecutable() {
  return isWindows() ? "npx.cmd" : "npx";
}

function spawnNpx(args, options = {}) {
  const { cwd, env, stdio = "inherit" } = options;
  const viteJs = path.join(cwd || process.cwd(), "node_modules", "vite", "bin", "vite.js");
  if (args[0] === "vite" && fs.existsSync(viteJs)) {
    return spawnNodeScript(viteJs, args.slice(1), { cwd, env, stdio });
  }

  if (isWindows()) {
    const npxCli = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npx-cli.js");
    if (fs.existsSync(npxCli)) {
      return spawn(process.execPath, [npxCli, ...args], {
        cwd,
        env: { ...process.env, ...env },
        stdio,
        shell: false,
        windowsHide: true,
      });
    }
  }

  return spawn(npxExecutable(), args, {
    cwd,
    env: { ...process.env, ...env },
    stdio,
    shell: false,
    windowsHide: true,
  });
}

function resolveViteBin(rootDir) {
  return path.join(rootDir, "node_modules", "vite", "bin", "vite.js");
}

module.exports = {
  isWindows,
  spawnNpmRun,
  spawnDevScript,
  spawnNodeScript,
  spawnNpx,
  resolveViteBin,
  resolveNpmCli,
};
