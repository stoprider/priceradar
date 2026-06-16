import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const prismaDir = path.join(projectRoot, "prisma");
const schemaPath = path.join(prismaDir, "schema.prisma");
const envFilePath = path.join(projectRoot, ".env");

function loadDotEnv() {
  if (!existsSync(envFilePath)) {
    return;
  }

  const file = readFileSync(envFilePath, "utf8");

  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const unquoted =
      rawValue.startsWith("\"") && rawValue.endsWith("\"") ? rawValue.slice(1, -1) : rawValue;

    if (!(key in process.env)) {
      process.env[key] = unquoted;
    }
  }
}

function runCommand(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "inherit"],
      shell: process.platform === "win32",
      env,
    });

    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      process.stdout.write(chunk);
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

function resolveSqliteFilePath(databaseUrl) {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error("This helper currently supports SQLite DATABASE_URL values only.");
  }

  const filePart = databaseUrl.slice("file:".length);
  const normalized = filePart.replace(/^\/([A-Za-z]:\/)/, "$1");

  if (path.isAbsolute(normalized)) {
    return normalized;
  }

  return path.resolve(prismaDir, normalized);
}

function toPrismaRelativeSqliteUrl(filePath) {
  const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, "/");
  const normalized = relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
  return `file:${normalized}`;
}

async function main() {
  loadDotEnv();
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL");
  }

  const sqliteFilePath = resolveSqliteFilePath(databaseUrl);
  const prismaRelativeDatabaseUrl = toPrismaRelativeSqliteUrl(sqliteFilePath);
  mkdirSync(path.dirname(sqliteFilePath), { recursive: true });

  const sourceFlag = existsSync(sqliteFilePath)
    ? ["--from-url", prismaRelativeDatabaseUrl]
    : ["--from-empty"];

  const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
  const tempDir = mkdtempSync(path.join(os.tmpdir(), "priceradar-schema-"));
  const sqlFilePath = path.join(tempDir, "schema.sql");

  try {
    const sql = await runCommand(
      npxCommand,
      ["prisma", "migrate", "diff", ...sourceFlag, "--to-schema-datamodel", schemaPath, "--script"],
      process.env,
    );

    const normalizedSql = sql.trim();

    if (!normalizedSql) {
      return;
    }

    writeFileSync(sqlFilePath, `${normalizedSql}\n`, "utf8");
    await runCommand(
      npxCommand,
      ["prisma", "db", "execute", "--file", sqlFilePath, "--url", prismaRelativeDatabaseUrl],
      process.env,
    );

    const result = readFileSync(sqlFilePath, "utf8");
    if (!result.trim()) {
      throw new Error("Generated schema SQL was unexpectedly empty.");
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
