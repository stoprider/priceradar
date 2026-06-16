const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const electron = require("electron");
const { autoUpdater } = require("electron-updater");

const { app, BrowserWindow, dialog, shell } = electron;

const APP_TITLE = "PriceRadar TH";
const DESKTOP_PORT = 3230;
const DESKTOP_HOST = "127.0.0.1";
const UPDATE_CHECK_INTERVAL_MS = 1000 * 60 * 60 * 6;
const desktopLogPath = path.join(os.tmpdir(), "priceradar-desktop.log");

let mainWindow = null;
let updatePromptVisible = false;
let updateChannel = "stable";

function writeLog(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(desktopLogPath, line, "utf8");
}

function showDesktopErrorBox(title, message) {
  dialog.showErrorBox(title, message);
}

function getRootPath(...segments) {
  return path.join(app.getAppPath(), ...segments);
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

function isDesktopReleaseBuild() {
  return app.isPackaged && !process.env.ELECTRON_START_URL;
}

function getRuntimeDirectory() {
  return path.join(app.getPath("userData"), "runtime");
}

function ensureDesktopDatabase() {
  const runtimePath = getRuntimeDirectory();
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
  const runtimePath = getRuntimeDirectory();
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

function resolveUpdateChannel() {
  const forcedChannel = process.env.PR_UPDATE_CHANNEL?.trim().toLowerCase();

  if (forcedChannel === "beta") {
    return "beta";
  }

  if (forcedChannel === "stable") {
    return "stable";
  }

  return app.getVersion().includes("-beta") ? "beta" : "stable";
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
  const runtimePath = getRuntimeDirectory();
  const standaloneDir = getStandaloneDirectory();
  const serverEntry = path.join(standaloneDir, "server.js");

  writeLog(`Starting bundled server from ${serverEntry}`);
  writeLog(`Database path: ${databasePath}`);
  writeLog(`Runtime path: ${runtimePath}`);

  process.env.NODE_ENV = "production";
  process.env.PORT = String(DESKTOP_PORT);
  process.env.HOSTNAME = DESKTOP_HOST;
  process.env.PR_DESKTOP = "1";
  process.env.DATABASE_URL = "file:./priceradar.db";
  process.env.SESSION_SECRET = secrets.sessionSecret;
  process.env.NEXTAUTH_SECRET = secrets.sessionSecret;
  process.env.NEXTAUTH_URL = `http://${DESKTOP_HOST}:${DESKTOP_PORT}`;

  process.chdir(runtimePath);
  writeLog(`Changed cwd to ${runtimePath}`);
  require(serverEntry);
  writeLog("Bundled server required successfully");
}

function setProgressState(progress) {
  if (!mainWindow) {
    return;
  }

  if (progress == null) {
    mainWindow.setProgressBar(-1);
    mainWindow.setTitle(APP_TITLE);
    return;
  }

  const bounded = Math.max(0, Math.min(progress, 1));
  mainWindow.setProgressBar(bounded);
  mainWindow.setTitle(`${APP_TITLE} • กำลังดาวน์โหลดอัปเดต ${Math.round(bounded * 100)}%`);
}

function wireAutoUpdater() {
  if (!isDesktopReleaseBuild()) {
    writeLog("Skipping auto-update setup for non-packaged or dev runtime");
    return;
  }

  updateChannel = resolveUpdateChannel();
  autoUpdater.channel = updateChannel;
  autoUpdater.allowPrerelease = updateChannel === "beta";
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    writeLog(`Checking for updates on ${updateChannel} channel`);
  });

  autoUpdater.on("update-available", async (info) => {
    writeLog(`Update available: ${info.version}`);

    if (updatePromptVisible) {
      return;
    }

    updatePromptVisible = true;
    const result = await dialog.showMessageBox({
      type: "info",
      buttons: ["ดาวน์โหลดตอนนี้", "ภายหลัง"],
      defaultId: 0,
      cancelId: 1,
      title: "มีอัปเดตใหม่",
      message: `พบ ${APP_TITLE} เวอร์ชัน ${info.version}`,
      detail: `ช่องทางอัปเดตปัจจุบัน: ${updateChannel}\nต้องการดาวน์โหลดตอนนี้หรือไม่`,
    });
    updatePromptVisible = false;

    if (result.response === 0) {
      writeLog(`Downloading update ${info.version}`);
      setProgressState(0);
      void autoUpdater.downloadUpdate();
    }
  });

  autoUpdater.on("download-progress", (progress) => {
    const fraction = (progress.percent ?? 0) / 100;
    writeLog(`Update download progress: ${progress.percent?.toFixed?.(1) ?? progress.percent}%`);
    setProgressState(fraction);
  });

  autoUpdater.on("update-not-available", () => {
    writeLog("No updates available");
  });

  autoUpdater.on("error", (error) => {
    const message = error instanceof Error ? error.message : String(error);
    writeLog(`Auto-update error: ${message}`);
    setProgressState(null);
  });

  autoUpdater.on("update-downloaded", async (info) => {
    writeLog(`Update downloaded: ${info.version}`);
    setProgressState(null);

    const result = await dialog.showMessageBox({
      type: "info",
      buttons: ["ติดตั้งและเปิดใหม่", "ภายหลัง"],
      defaultId: 0,
      cancelId: 1,
      title: "พร้อมติดตั้งอัปเดต",
      message: `ดาวน์โหลด ${APP_TITLE} เวอร์ชัน ${info.version} เรียบร้อยแล้ว`,
      detail: "สามารถติดตั้งและเปิดแอปใหม่ได้ทันที",
    });

    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1180,
    minHeight: 760,
    title: APP_TITLE,
    autoHideMenuBar: true,
    backgroundColor: "#0E2338",
    icon: getRootPath("build", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
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

if (!app || typeof app.whenReady !== "function") {
  const reason =
    "Electron runtime is unavailable. Clear ELECTRON_RUN_AS_NODE and relaunch PriceRadar TH.";

  writeLog(reason);
  throw new Error(reason);
}

app.whenReady().then(async () => {
  try {
    writeLog("Electron app is ready");
    wireAutoUpdater();
    await createWindow();

    if (isDesktopReleaseBuild()) {
      void autoUpdater.checkForUpdates();
      setInterval(() => {
        void autoUpdater.checkForUpdates();
      }, UPDATE_CHECK_INTERVAL_MS);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown desktop startup error";
    writeLog(`Startup failure: ${message}`);
    showDesktopErrorBox("PriceRadar TH เริ่มระบบไม่สำเร็จ", message);
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
