// Runs the backend and frontend dev servers together; stops both if either exits.
import { spawn } from "node:child_process";

const children = ["backend", "frontend"].map((workspace) =>
  spawn(`npm run dev -w ${workspace}`, { shell: true, stdio: "inherit" }),
);

let stopping = false;

function stopAll(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null) continue;
    if (process.platform === "win32") {
      // Windows shells don't forward signals, so kill the process tree.
      spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
        stdio: "ignore",
      });
    } else {
      child.kill("SIGTERM");
    }
  }
  process.exitCode = code;
}

for (const child of children) {
  child.on("exit", (code) => stopAll(code ?? 0));
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
