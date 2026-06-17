# PriceRadar TH

[English](./README.md)

[![Release](https://img.shields.io/github/v/release/stoprider/priceradar)](https://github.com/stoprider/priceradar/releases)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Web-0B5A72)](https://github.com/stoprider/priceradar/releases)
[![License](https://img.shields.io/github/license/stoprider/priceradar)](./LICENSE)

PriceRadar TH คือแอปติดตามราคาสินค้าสำหรับอีคอมเมิร์ซในประเทศไทย รองรับทั้งแบบเว็บและโปรแกรมติดตั้งบน Windows

## ดาวน์โหลด
ดาวน์โหลดเดสก์ท็อปล่าสุดได้จากหน้า [Releases](https://github.com/stoprider/priceradar/releases)

เวอร์ชันแนะนำตอนนี้:
- ตัวติดตั้ง Windows: `v0.1.8`
- หน้า release: `https://github.com/stoprider/priceradar/releases/tag/v0.1.8`

## จุดเด่น
- ติดตามสินค้า ดูแดชบอร์ด รายละเอียดสินค้า และรายการเฝ้าดูได้ในแอปเดียว
- แจ้งเตือนผ่าน Telegram ได้ทั้งตอนราคาลดลงและตอนถึงราคาเป้าหมาย
- มีหน้า Settings สำหรับตั้งค่า bot token, chat ID, สถานะ และปุ่มทดสอบส่ง
- มีตัวติดตั้ง Windows พร้อมระบบอัปเดตผ่าน GitHub Releases
- รู้จักลิงก์ Shopee, Lazada และ Temu แต่ยังบล็อกไว้ใน production จนกว่าจะมีเส้นทางดึงข้อมูลที่เสถียร

## เทคโนโลยีที่ใช้
- Next.js 16 + TypeScript
- Tailwind CSS
- Prisma + SQLite
- Electron + electron-builder
- Playwright

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

4. รันเซิร์ฟเวอร์สำหรับพัฒนา

```bash
npm run dev
```

เปิด `http://localhost:3000`

## คำสั่งที่ใช้บ่อย
```bash
npm run lint
npm run build
npm run prices:check
npm run desktop:dev
npm run build:desktop
npm run build:desktop:beta
```

## สร้างโปรแกรม Windows
สร้างตัวติดตั้ง:

```bash
npm run build:desktop
```

ไฟล์ผลลัพธ์จะอยู่ใน `dist-desktop/`

ถ้าเครื่องมี `ELECTRON_RUN_AS_NODE=1` อยู่แล้ว shortcut ที่ติดตั้งจากโปรแกรมจะเรียก launcher ที่ล้างค่านี้ให้อัตโนมัติ

## ตัวแปรสำหรับปล่อยจริง
ดูตัวอย่างได้ใน `.env.release.example`

ค่าที่ใช้บ่อย:
- `GH_TOKEN`
- `PR_UPDATE_CHANNEL=latest` หรือ `beta`
- `CSC_LINK`
- `CSC_KEY_PASSWORD`

## หมายเหตุ
- ถ้าจะใช้ production จริง ควรเปลี่ยน `SESSION_SECRET` ให้แข็งแรง
- ถ้าจะเปิด Telegram alerts ต้องใส่ credential จริง
- selector สำหรับ scraping อาจต้องปรับเมื่อหน้าเว็บร้านค้ามีการเปลี่ยนแปลง
- Shopee, Lazada และ Temu ยังไม่เปิด production tracking จนกว่าจะมีเส้นทางดึงข้อมูลที่เชื่อถือได้
