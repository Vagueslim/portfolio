# Dhittawat — Ooca portfolio

Home เป็น **React + TypeScript + Vite** โดยย้ายหน้าฟอยล์ล่าสุดมาใช้ที่ `/` และ `index.html` คงหน้าตา ข้อความ และลำดับส่วนเดิม หน้า About, Project และเคสทั้ง 5 ยังเป็น HTML เดิม

ใน repository นี้ โปรเจกต์อยู่ที่ `Ooca/` ก่อนใช้คำสั่งด้านล่างให้ `cd Ooca` เว็บหลักที่ https://vagueslim.github.io/portfolio/ เผยแพร่จาก `Ooca/dist/` ผ่าน GitHub Actions เมื่อแก้โค้ดในโฟลเดอร์นี้แล้ว merge เข้า `main` ระบบจะ build และเผยแพร่อัตโนมัติ

## เปิดและตรวจงาน

ต้องมี Node.js 22.18+ (เครื่องนี้ทดสอบด้วย Node 24) ใน PowerShell ใช้:

```powershell
npm.cmd ci
npm.cmd run dev
```

เปิด http://127.0.0.1:4173/ — ข้อความ/ภาพใน JSON และ React/CSS จะอัปเดตระหว่างแก้ไข

```powershell
npm.cmd run typecheck
npm.cmd run check:content
npm.cmd run build
npm.cmd test
```

- `build` ตรวจชนิดข้อมูลและไฟล์อ้างอิง แล้วรวม Home ใหม่ + HTML เดิม 7 หน้า + assets ไว้ใน `dist/`
- `test` ใช้ Microsoft Edge ที่ติดตั้งในเครื่อง เปิด production preview ที่ 4175 และ dev fixture ที่ 4176 อัตโนมัติ
- ดู production ด้วย `npm.cmd run preview` ที่ 4173 หลังหยุด dev server ด้วย Ctrl+C; หรือใช้ `npm.cmd run preview -- --port 4174`
- ต้องเปิดผ่าน server เมื่อพัฒนา React; `index.html` ต้นทางไม่ได้ออกแบบให้ดับเบิลคลิกผ่าน `file://`
- GitHub Pages ใช้ workflow `../.github/workflows/deploy-react.yml` เผยแพร่ไฟล์ทั้งหมดใน `dist/` ที่ URL หลัก `/portfolio/`; Vite ใช้ relative base เพื่อให้ภาพ ฟอนต์ และลิงก์ทำงานภายใต้ path นี้
- ใน PR จะรัน `npm ci` และ `npm run build` เพื่อตรวจโค้ดก่อน merge; เผยแพร่เฉพาะ `main` โดยใช้ environment `github-pages`

## เปลี่ยนข้อความและภาพ Home

| จุดแก้ | ไฟล์ |
|---|---|
| ข้อความ ลำดับงานในแต่ละส่วน และภาพเฉพาะ Home | `data/home.json` |
| ชื่อโปรเจกต์ URL และภาพหลักสำรอง | `data/projects.json` |
| รหัสภาพ → ไฟล์, alt และขนาดจริง | `data/media.json` |
| ไฟล์ภาพ | `assets/images/` |
| สี ฟอนต์ ขนาดหัวเรื่อง และระยะหลัก | `src/styles/theme.css` |
| โครงหน้าและลำดับส่วน | `src/Home.tsx` |
| Component รายส่วน | `src/components/` |
| Liquid effect และ lifecycle | `src/hooks/useLiquidText.ts` |

เนื้อหาใช้ข้อความธรรมดา ถ้าต้องการขึ้นบรรทัดใหม่ใช้ `\n` ไม่ต้องเขียน HTML ลง JSON

**ตัวอย่างเปลี่ยนเฉพาะภาพ Home ของ WCF**

1. เพิ่มภาพใหม่ใน `assets/images/`
2. เพิ่มรายการใน `data/media.json` เช่น:

```json
"wcf-home-new": {
  "src": "assets/images/wcf-home-new.png",
  "alt": "ภาพรวม flow งาน WCF",
  "width": 810,
  "height": 630
}
```

3. เปลี่ยน `wcf.visual` ใน `data/home.json` เป็น:

```json
{ "kind": "single", "mediaId": "wcf-home-new" }
```

ลบ `visual` หรือกำหนดเป็น `null` เมื่อต้องการใช้ `coverMediaId` จากข้อมูลโปรเจกต์แทน

รูปแบบที่รองรับ:

- `single`: `mediaId` หนึ่งภาพ
- `pair`: `mediaIds` สองภาพ เช่น Buddy
- `collage`: `mediaIds` สองภาพ โดยภาพแรกเป็นฐาน ภาพที่สองซ้อนด้านบน เช่น Smart Asset
- `statistics`: ตัวเลขและคำอธิบาย Change Date ตามข้อมูลเดิม โดยระบุชัดว่าเป็นข้อมูลที่ศึกษา

จุดที่อ้างรหัสภาพเดียวกันจะใช้ไฟล์เดียวกัน เปลี่ยน `src` ใน registry จุดเดียวได้เลย หากต้องการเปลี่ยนเฉพาะ Home ให้เพิ่มไฟล์ใหม่แทนการเขียนทับไฟล์ที่ HTML เดิมใช้อยู่

**ข้อมูลกลางรอบนี้ใช้กับ Home เท่านั้น** การแก้ JSON ยังไม่เปลี่ยนรูปหรือข้อความใน About, Project และเคสเดิม

## หน้า HTML เดิมและต้นฉบับ

- `scripts/build.py`: ข้อมูล/แม่แบบของ Project และเคส; `scripts/about_page.py` + `data/about-profile.json`: About
- ถ้าแก้แหล่งข้อมูลเหล่านี้ ให้รัน `python scripts/build.py` ก่อน `npm.cmd run build`
- ตัวสร้าง Python เขียนเฉพาะ 7 หน้าเดิม ไม่เขียนทับ `index.html` ของ React
- `assets/site.css` และ `assets/site.js` ดูแลหน้าเดิม ส่วน Home ใช้ CSS ใน `src/styles/`
- `text-intro-examples.html` และ `assets/portfolio-editorial.css` เป็นหน้าฟอยล์ต้นฉบับพร้อมตัวเลือกข้อความทดลอง ไม่ใช่ไฟล์ต้นทางของ React และไม่ถูกคัดลอกเป็นหน้าสาธารณะใน `dist`
- สำเนาก่อนย้าย React และเอกสารร่างยังเก็บอยู่ในโฟลเดอร์งานต้นฉบับบนเครื่อง ไม่ได้รวมไว้ใน repository นี้

## หลักฐานตรวจรับ

ตรวจล่าสุดก่อนอัปโหลด: production build, TypeScript, ข้อมูลกลาง และการทดสอบอัตโนมัติ 11 ข้อผ่าน ครอบคลุมขนาด 320, 390, 552, 768, 1440px รวมภาพ Change Date และ WCF ล่าสุด

`npm.cmd test` ตรวจ layout กับ baseline เดิม, ข้อความ, ลิงก์, ภาพ, keyboard, accordion, reduced motion, การหยุดเอฟเฟกต์, StrictMode/cleanup และหน้า legacy หากตั้งใจปรับดีไซน์หรือข้อความในอนาคต ให้รีวิวและปรับ baseline ด้วย; การทดสอบชุดนี้ตั้งใจจับความเปลี่ยนแปลงจากหน้าฟอยล์ที่อนุมัติ

`node scripts/qa.mjs` เรียกชุดทดสอบปัจจุบันเช่นเดียวกับ `npm.cmd test` ใน repository เก็บ `qa/react-home/baseline.json` ซึ่งชุดทดสอบต้องใช้ ส่วนภาพและรายงานที่สร้างระหว่างทดสอบถูกละเว้นจาก Git
