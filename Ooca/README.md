# Dhittawat — bilingual React portfolio

Home, About, Project และเคสทั้งห้าใช้ **React + TypeScript + Vite + React Router** ทั้งหมด ใช้ Node 24 และ npm เวอร์ชันที่มากับ Node

## รันบนเครื่อง

```powershell
cd 'C:\Users\Admin\Documents\Custom_portfolio\React\Ooca'
npm.cmd ci
npm.cmd run dev -- --port 4174
```

เปิด http://127.0.0.1:4174/ — EN เป็นค่าเริ่มต้น ส่วน TH อยู่ที่ /th/ และเปลี่ยนภาษาหน้าเดิมได้จากเมนู

```powershell
npm.cmd run build
npm.cmd run preview -- --port 4174
npm.cmd test
```

Build สร้าง HTML ล่วงหน้า 16 หน้า พร้อม React สำหรับการกดเปลี่ยนหน้าโดยไม่โหลด document ใหม่ และหน้า 404 สองภาษา ไฟล์ใน dist สร้างใหม่ได้เสมอ ไม่ใช่แหล่งแก้เนื้อหา

## แก้ข้อความและลำดับ

- data/home.json: ทุกส่วนของ Home; เรียง selected.items เพื่อเปลี่ยนลำดับงานเด่น และ foil.lines เพื่อเปลี่ยนรายการข้อความฟอยล์
- data/pages/about.json: บทนำ ประสบการณ์ ทักษะ และการศึกษา
- data/pages/project.json: ตัวกรองและลำดับรายการในหน้า Project
- data/pages/<project-id>.json: บทนำ ข้อมูลโครงการ สารบัญ chapters หลักฐาน และเคสถัดไป
- data/smart-asset-cover.json และ data/smart-asset-evidence.json: flow ส่วนที่สองและ appendix ของ Smart Asset
- data/ui.json: ข้อความส่วนควบคุมที่ใช้ร่วมกัน

ข้อความเก็บเป็นคู่ เช่น `{ "en": "Read case study", "th": "อ่านเคส" }` โดยตำแหน่งในข้อมูลมีรหัสคงที่ ไม่ใช้ข้อความไทยเป็น key ของคำแปล เปลี่ยนข้อความทั้งสองภาษาในตำแหน่งเดียว

เนื้อหาเคสและ About ใช้ ContentNode: text (ข้อความคู่ภาษา), image (mediaId และ alt ของตำแหน่งนั้น), element (semantic tag, attributes, children) จึงยังแก้ย่อหน้า ลิงก์ ตาราง และตัวหนาแยกกันได้โดยไม่ฝัง HTML string เมื่อเปลี่ยนลำดับบท ให้เปลี่ยน chapters และรายการ toc ให้ตรงกัน และรักษา id เพื่อไม่ให้ลิงก์เดิมขาด

รอบย้ายครั้งนี้คงคำตอบ accordion ที่ยังว่างและข้อความข้อจำกัดของหลักฐานตามเดิม

## เปลี่ยนภาพจากข้อมูลกลาง

1. วางไฟล์ใน assets/images แล้วเพิ่มรหัสใน data/media.json พร้อม src และ alt EN/TH
2. เปลี่ยน coverMediaId ใน data/projects.json เพื่อเลือกภาพหลักของโปรเจกต์
3. หน้า Project เปลี่ยนตามภาพหลักทันที; Home ใช้ visual และหน้าเคสใช้ overview เป็นตัวเลือกเฉพาะตำแหน่ง
4. ลบ visual / overview หรือกำหนดเป็น null เมื่อต้องการกลับไปใช้ภาพหลัก
5. ภาพที่ฝังอยู่ในบทความอ้าง mediaId ของหลักฐานแยกต่างหาก จึงไม่เปลี่ยนตาม coverMediaId

การเปลี่ยน src ของ mediaId เดิมมีผลทุกตำแหน่งที่อ้างรหัสนั้น หากต้องการเปลี่ยนเพียงตำแหน่งเดียว ให้เพิ่ม mediaId ใหม่ Caption และ alt เฉพาะตำแหน่งยังแก้ในข้อมูลหน้านั้นได้

รูปแบบภาพ: single ใช้ mediaId, pair/collage ใช้ mediaIds สองรหัส, statistics ใช้ข้อมูลตัวเลขเดิม หน้าเคสยังรองรับ flow ที่เก็บ blocks ของคำอธิบาย เช่น Change Date

## โครงโค้ด

- src/App.tsx: เลือกหน้าจาก URL; components/SiteLayout.tsx: ส่วนกลาง ภาษา metadata และ scroll/focus
- src/pages/: About, Project และแม่แบบ Case
- src/components/: Header/Footer, rich content, ภาพ, dialog, SystemFlow และ FlowEvidence
- src/content/: types, ตัวเลือกภาพ, ข้อมูลตามภาษา; src/routes.ts เป็นทะเบียน URL
- src/hooks/: การทำงานและ cleanup ของฟอยล์ dialog และลูกศร
- src/styles/theme.css: สี ฟอนต์ ระยะ และขนาด; styles/pages*.css แยกขอบเขตดีไซน์หน้าด้านในจาก Home
- src/entry-server.tsx + scripts/prerender.mjs: สร้าง HTML จาก React โดยไม่ต้องมี server ตอนเผยแพร่

Home คงชื่อขนาดใหญ่และฟอยล์ ส่วนหน้าเคสเรียงบทนำ → ภาพรวม → เนื้อหาและสารบัญ → หลักฐานเพิ่มเติม (ถ้ามี) → เคสถัดไป Smart Asset คง interactive flow เป็นส่วนที่สอง

## ตรวจรับและเผยแพร่

```powershell
npm.cmd run typecheck
npm.cmd run check:content
npm.cmd test
$env:PORTFOLIO_BASE_PATH = '/portfolio/'
npm.cmd run build
npm.cmd run verify:pages
Remove-Item Env:PORTFOLIO_BASE_PATH
```

verify:pages ตรวจไฟล์ที่ build แล้วผ่าน static server ภายใต้ /portfolio/ ทั้งลิงก์ตรง refresh ภาษา และ client navigation ไม่ deploy เว็บ

สำหรับภาพ QA ให้รัน preview บน 4177 แล้ว `npm.cmd run qa:visual` หรือ `node scripts/capture-migration.mjs http://127.0.0.1:4174` ตรวจ 80 หน้าจอหลักและ About อีก 4 ขนาด รายงานและ screenshots อยู่ใน qa/react-migration/

ชุดทดสอบเทียบเนื้อหากับ qa/react-migration/content-baseline.json และ Home กับ baseline เดิม ห้ามอัปเดต baseline เพื่อกลบข้อความหายหรือ layout regression

GitHub Actions ทดสอบก่อน build ด้วยฐาน /portfolio/ และเผยแพร่ Ooca/dist เมื่อ merge/push main การทำงานบน branch ไม่เปลี่ยนเว็บจริง

## ต้นฉบับและการย้อนกลับ

legacy/ เป็นหลักฐานก่อนย้าย ไม่ถูก import, generate หรือเผยแพร่ใน build ใหม่ อย่ารันตัวสร้าง Python ใน legacy; ใช้ข้อมูล JSON และ React ด้านบน ต้นฉบับเต็มก่อนย้ายอยู่ที่ Git commit 59290b69e5b8f198261f97e6d7e09c2d84924ddf

รายละเอียดศัพท์อยู่ใน CONTEXT.md และการเลือกสถาปัตยกรรมอยู่ใน docs/adr/0001-react-static-pages.md เว็บไซต์เก่านอกโฟลเดอร์ Ooca ไม่อยู่ในขอบเขตการย้ายนี้
