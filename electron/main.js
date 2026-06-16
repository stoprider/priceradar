const { app, BrowserWindow, dialog, shell } = require("electron");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const DESKTOP_PORT = 3230;
const DESKTOP_HOST = "127.0.0.1";
const desktopLogPath = path.join(app.getPath("temp"), "priceradar-desktop.log");

let mainWindow = null;

function writeLog(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(desktopLogPath, line, "utf8");
}

function getRootPath(...segments) {
  const basePath = app.isPackaged ? process.resourcesPath : app.getAppPath();
  return path.join(basePath, ...segments);
}

function getStandaloneDirectory() {
  const bundledStandaloneDir = getRootPath("desktop", "bundle", "standalone");

  if (fs.existsSync(bundledStandaloneDir)) {
    return bundledStandaloneDir;
  }

  return getRootPath(".next", "standalone");
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function toPrismaSqliteUrl(filePath) {
  return `file:/${filePath.replace(/\\/g, "/")}`;
}

function ensureDesktopDatabase() {
  const userDataPath = app.getPath("userData");
  const runtimePath = path.join(userDataPath, "runtime");
  const databasePath = path.join(runtimePath, "priceradar.db");
  const bundledDatabasePath = getRootPath("desktop", "assets", "priceradar.db");

  ensureDirectory(runtimePath);

  if (!fs.existsSync(databasePath)) {
    writeLog(`Copying bundled database from ${bundledDatabasePath} to ${databasePath}`);
    fs.copyFileSync(bundledDatabasePath, databasePath);
  }

  return databasePath;
}

function ensureRuntimeSecrets() {
  const userDataPath = app.getPath("userData");
  const runtimePath = path.join(userDataPath, "runtime");
  const secretPath = path.join(runtimePath, "desktop-secrets.json");

  ensureDirectory(runtimePath);

  if (!fs.existsSync(secretPath)) {
    const payload = {
      sessionSecret: crypto.randomBytes(32).toString("hex"),
    };

    fs.writeFileSync(secretPath, JSON.stringify(payload, null, 2), "utf8");
    writeLog(`Created desktop secrets at ${secretPath}`);
    return payload;
  }

  return JSON.parse(fs.readFileSync(secretPath, "utf8"));
}

async function waitForServer(url, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) {
        return;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Desktop server did not become ready within ${timeoutMs}ms`);
}

function startBundledServer() {
  const secrets = ensureRuntimeSecrets();
  const databasePath = ensureDesktopDatabase();
  const standaloneDir = getStandaloneDirectory();
  const serverEntry = path.join(standaloneDir, "server.js");
  writeLog(`Starting bundled server from ${serverEntry}`);
  writeLog(`Database path: ${databasePath}`);

  process.env.NODE_ENV = "production";
  process.env.PORT = String(DESKTOP_PORT);
  process.env.HOSTNAME = DESKTOP_HOST;
  process.env.PR_DESKTOP = "1";
  process.env.DATABASE_URL = toPrismaSqliteUrl(databasePath);
  process.env.SESSION_SECRET = secrets.sessionSecret;
  process.env.NEXTAUTH_SECRET = secrets.sessionSecret;
  process.env.NEXTAUTH_URL = `http://${DESKTOP_HOST}:${DESKTOP_PORT}`;

  process.chdir(standaloneDir);
  writeLog(`Changed cwd to ${standaloneDir}`);
  require(serverEntry);
  writeLog("Bundled server required successfully");
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1180,
    minHeight: 760,
    title: "PriceRadar TH",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (process.env.ELECTRON_START_URL) {
    writeLog(`Loading dev URL ${process.env.ELECTRON_START_URL}`);
    await mainWindow.loadURL(process.env.ELECTRON_START_URL);
    return;
  }

  const appUrl = `http://${DESKTOP_HOST}:${DESKTOP_PORT}`;

  startBundledServer();
  writeLog(`Waiting for server health at ${appUrl}/api/health`);
  await waitForServer(`${appUrl}/api/health`);
  writeLog(`Loading desktop URL ${appUrl}`);
  await mainWindow.loadURL(appUrl);
}

app.whenReady().then(async () => {
  try {
    writeLog("Electron app is ready");
    await createWindow();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown desktop startup error";
    writeLog(`Startup failure: ${message}`);
    dialog.showErrorBox("PriceRadar TH เริ่มระบบไม่สำเร็จ", message);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});
