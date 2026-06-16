# PriceRadar TH

[English](./README.md)

[![Release](https://img.shields.io/github/v/release/stoprider/priceradar)](https://github.com/stoprider/priceradar/releases)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Web-0B5A72)](https://github.com/stoprider/priceradar/releases)
[![License](https://img.shields.io/github/license/stoprider/priceradar)](./LICENSE)

PriceRadar TH คือแอปติดตามราคาสินค้าสำหรับอีคอมเมิร์ซในประเทศไทย รองรับทั้งแบบเว็บและโปรแกรมติดตั้งบน Windows

## ดาวน์โหลด
ดาวน์โหลด desktop build ล่าสุดได้จากหน้า [Releases](https://github.com/stoprider/priceradar/releases)

เวอร์ชันที่แนะนำตอนนี้:
- ตัวติดตั้ง Windows: `v0.1.3`
- หน้า release: `https://github.com/stoprider/priceradar/releases/tag/v0.1.3`

## ภาพหน้าจอ
หน้าแรก

![PriceRadar TH หน้าแรก](./docs/screenshots/home.png)

แดชบอร์ด

![PriceRadar TH แดชบอร์ด](./docs/screenshots/dashboard.png)

หน้าสินค้าที่ติดตาม

![PriceRadar TH หน้าสินค้า](./docs/screenshots/products.png)

หน้ารายการเฝ้าดู

![PriceRadar TH หน้ารายการเฝ้าดู](./docs/screenshots/watchlists.png)

## จุดเด่น
- ระบบติดตามสินค้า, watchlist, dashboard, และหน้ารายละเอียดสินค้า
- ระบบล็อกอินด้วย signed cookie พร้อมบัญชี demo
- desktop runtime บน Windows ที่ใช้ SQLite
- ระบบเช็กอัปเดตจาก GitHub Releases
- pipeline สำหรับ build ตัวติดตั้ง Windows ด้วย Electron

## เทคโนโลยีที่ใช้
- Next.js 16 + TypeScript
- Tailwind CSS
- Prisma + SQLite
- Recharts
- Playwright
- Electron + electron-builder

## พัฒนาในเครื่อง
1. ติดตั้ง dependency

```bash
npm install
```

2. สร้างไฟล์ environment

```bash
copy .env.example .env
```

3. เตรียมฐานข้อมูล

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

บัญชี demo:

```text
email: demo@priceradar.th
password: demo12345
```

4. รันเว็บแอป

```bash
npm run dev
```

เปิด `http://localhost:3000`

## คำสั่งที่ใช้บ่อย
```bash
npm run lint
npm run prices:check
npm run desktop:dev
npm run assets:icons
npm run build:desktop
npm run build:desktop:beta
```

## Build โปรแกรม Windows
สร้างตัวติดตั้ง Windows:

```bash
npm run build:desktop
```

ถ้าต้องการ build สำหรับ beta channel:

```bash
npm run build:desktop:beta
```

ไฟล์ output จะอยู่ใน `dist-desktop/`

desktop release ปัจจุบันมี:
- ไอคอนแอปและไอคอนตัวติดตั้งแบบ branded
- ระบบเช็กอัปเดตจาก GitHub Releases
- ไฟล์ `latest.yml` สำหรับ desktop update flow

ถ้า shell ของคุณมี `ELECTRON_RUN_AS_NODE=1` ให้ใช้:

```bash
npm run desktop:dev
```

## Environment สำหรับปล่อยจริง
ค่าที่ใช้ตอนปล่อย release จริงอยู่ใน `.env.release.example`

ตัวแปรสำคัญ:
- `GH_TOKEN`
- `PR_UPDATE_CHANNEL=stable` หรือ `beta`
- `CSC_LINK`
- `CSC_KEY_PASSWORD`

## Docker
รันแอปผ่าน Docker:

```bash
docker compose up --build
```

Endpoints:
- app: `http://localhost:3000`
- health: `http://localhost:3000/api/health`

## หมายเหตุ
- ถ้าจะใช้ production จริง ควรเปลี่ยน `SESSION_SECRET` ให้แข็งแรง
- ถ้าจะเปิด Telegram alerts ต้องใส่ credential จริง
- selector สำหรับ scraping อาจต้องปรับเมื่อหน้าเว็บร้านค้ามีการเปลี่ยนแปลง
