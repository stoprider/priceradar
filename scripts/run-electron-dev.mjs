import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const electronBinary = path.join(projectRoot, "node_modules", "electron", "dist", "electron.exe");

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
env.ELECTRON_START_URL = env.ELECTRON_START_URL || "http://127.0.0.1:3000";

const child = spawn(electronBinary, ["."], {
  cwd: projectRoot,
  stdio: "inherit",
  env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
