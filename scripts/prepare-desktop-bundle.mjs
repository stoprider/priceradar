import { spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const standaloneRoot = path.join(projectRoot, ".next", "standalone");
const bundledStandaloneRoot = path.join(projectRoot, "desktop", "bundle", "standalone");
const standaloneStaticPath = path.join(bundledStandaloneRoot, ".next", "static");
const standalonePublicPath = path.join(bundledStandaloneRoot, "public");
const nextStaticPath = path.join(projectRoot, ".next", "static");
const publicPath = path.join(projectRoot, "public");
const desktopAssetsPath = path.join(projectRoot, "desktop", "assets");
const desktopBundlePath = path.join(projectRoot, "desktop", "bundle");
const databasePath = path.join(desktopAssetsPath, "priceradar.db");

function runCommand(command, args, env = process.env, shell = process.platform === "win32") {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: "inherit",
      shell,
      env,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

function copyDirectory(source, destination) {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true, dereference: true });
}

async function main() {
  mkdirSync(desktopAssetsPath, { recursive: true });
  mkdirSync(desktopBundlePath, { recursive: true });
  rmSync(databasePath, { force: true });

  const databaseUrl = "file:./../desktop/assets/priceradar.db";
  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
  };

  const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

  await runCommand(process.execPath, [path.join(projectRoot, "scripts", "sync-sqlite-schema.mjs")], env, false);
  await runCommand(npxCommand, ["tsx", "prisma/seed.ts"], env, process.platform === "win32");

  if (!existsSync(standaloneRoot)) {
    throw new Error("Missing .next/standalone. Run `npm run build` before preparing the desktop bundle.");
  }

  copyDirectory(standaloneRoot, bundledStandaloneRoot);

  if (existsSync(nextStaticPath)) {
    copyDirectory(nextStaticPath, standaloneStaticPath);
  }

  if (existsSync(publicPath)) {
    copyDirectory(publicPath, standalonePublicPath);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
