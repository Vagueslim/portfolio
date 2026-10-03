# Dhittawat's portfolio

เว็บไซต์หลัก: https://vagueslim.github.io/portfolio/

โค้ดที่ใช้งานจริงอยู่ใน [`Ooca/`](Ooca/README.md): Home ใช้ React + TypeScript + Vite ส่วน About, Project และหน้าเคสทั้งห้ายังคงเป็น HTML ที่ build รวมไปด้วยกัน

```sh
cd Ooca
npm ci
npm run dev
```

แก้ข้อความและภาพ Home ที่ `Ooca/data/` แล้วตรวจด้วย `npm run build` และ `npm test` ตามรายละเอียดใน README ของโปรเจกต์

GitHub Pages ใช้ GitHub Actions ใน `.github/workflows/deploy-react.yml` เมื่อโค้ด `Ooca/` ถูก merge เข้า `main` ระบบจะตรวจ TypeScript/ข้อมูลกลาง, build และเผยแพร่เฉพาะ `Ooca/dist/` PR จะตรวจ build โดยไม่เผยแพร่

ไฟล์ HTML และโฟลเดอร์ของเว็บไซต์รุ่นก่อนที่ root เก็บไว้เป็นประวัติ ไม่ใช่ต้นทางของ deployment ปัจจุบัน
