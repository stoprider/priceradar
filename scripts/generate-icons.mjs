import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const sourceSvgPath = path.join(projectRoot, "assets", "branding", "app-icon.svg");
const buildDir = path.join(projectRoot, "build");
const publicDir = path.join(projectRoot, "public");
const appDir = path.join(projectRoot, "src", "app");

const pngTargets = [
  { size: 1024, filePath: path.join(buildDir, "icon-1024.png") },
  { size: 512, filePath: path.join(buildDir, "icon-512.png") },
  { size: 256, filePath: path.join(buildDir, "icon-256.png") },
  { size: 64, filePath: path.join(buildDir, "icon-64.png") },
  { size: 32, filePath: path.join(buildDir, "icon-32.png") },
  { size: 16, filePath: path.join(buildDir, "icon-16.png") },
];

async function ensureDirectories() {
  await Promise.all([mkdir(buildDir, { recursive: true }), mkdir(publicDir, { recursive: true }), mkdir(appDir, { recursive: true })]);
}

async function main() {
  await ensureDirectories();

  const svg = await readFile(sourceSvgPath);

  for (const target of pngTargets) {
    await sharp(svg)
      .resize(target.size, target.size)
      .png()
      .toFile(target.filePath);
  }

  const icoBuffer = await pngToIco([
    path.join(buildDir, "icon-16.png"),
    path.join(buildDir, "icon-32.png"),
    path.join(buildDir, "icon-64.png"),
    path.join(buildDir, "icon-256.png"),
  ]);

  await writeFile(path.join(buildDir, "icon.ico"), icoBuffer);
  await writeFile(path.join(publicDir, "icon.png"), await readFile(path.join(buildDir, "icon-512.png")));
  await writeFile(path.join(appDir, "favicon.ico"), icoBuffer);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
