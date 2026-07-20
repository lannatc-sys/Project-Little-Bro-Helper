# 📜 Little Bro Assistant (Omnichannel Platform)
> **เวอร์ชันระบบและนโยบายข้อตกลง:** v1.4.0 (Enterprise Governance & Compliance Release)  
> **วันที่มีผลบังคับใช้:** 20 กรกฎาคม 2569 (2026)  
> **สถาปัตยกรรมความปลอดภัย:** Zero Server Data Storage & Privacy-First Architecture  

---

## 🏛️ คู่มือกำกับการบริหารจัดการและนโยบายความปลอดภัยข้อมูลส่วนบุคคลระดับองค์กร
*(Enterprise Governance & Compliance Manual v1.4.0)*

### 1. ปรัชญาการออกแบบระบบ (Data Isolation by Design)
แพลตฟอร์ม **Little Bro Assistant** ในรูปแบบ Enterprise SaaS ถูกออกแบบขึ้นบนสถาปัตยกรรม **"Zero Server Data Storage"** เซิร์ฟเวอร์ส่วนกลางคลาวด์ Middleware (Next.js บน Vercel และหลังบ้านบน Google Apps Script Web App) จะทำหน้าที่เป็นเพียง *"ท่อส่งผ่านข้อมูลดิบ (Data Pipeline Middleware)"* เท่านั้น ไม่มีการจัดเก็บ พักไฟล์ ทำสำเนา หรือบันทึกข้อมูลธุรกรรมส่วนบุคคล ไฟล์ ภาพถ่าย หรือบันทึกใด ๆ ของผู้ใช้ไว้ที่ส่วนกลางอย่างถาวร ข้อมูลทั้งหมดจะถูกส่งตรงไปประมวลผลและจัดเก็บแยกถังข้อมูลเดี่ยว (Data Isolation) ภายในบัญชีคลาวด์องค์กรหรือบัญชีส่วนบุคคลบน Google Workspace ของผู้ใช้งานรายนั้น ๆ 100%

---

## 🌟 ฟีเจอร์หลักและการส่งมอบ (System Features & Blueprint)

### 🔹 Phase 1: ระบบฐานราก & ท่อรับส่งข้อมูลหลัก
- **Google OAuth 2.0 Protocol:** ระบบยืนยันสิทธิ์ความปลอดภัยเข้าใช้งานแบบไร้รหัสผ่าน
- **Workspace Initializer:** สั่งสร้างโฟลเดอร์หลัก `📁 Little Bro Assistant Files` และโครงสร้าง 6 ตารางฐานข้อมูลมาตรฐาน (`Profiles`, `Finance`, `Task`, `Calendar`, `Contacts`, `Settings`) ลงบน Google Drive ของผู้ใช้โดยอัตโนมัติ

### 🔹 Phase 2: Dynamic Dashboard & Omnichannel Integration
- **Dual-Sync Pipeline (Supabase ↔ Google Sheets):** โหลดประมวลผลข้อมูลรวดเร็วผ่าน Supabase REST API พร้อมซิงก์สองทางกับ Google Sheets เบื้องหลัง
- **🎨 Shan Heritage & Multi-Theme Architecture:** ธีม 4 สไตล์ (Shan Light, Shan Dark, Dark Modern, Light Modern) พร้อมมาสคอต Little Bro ทึบแสง 100%
- **👑 Admin Console & Admin Chat Box:** แผงควบคุมระบบด้วย PIN 1234, System Health Monitor, Feature Toggles, User Directory, System Logs และกล่องแชทโต้ตอบ
- **Google Tasks UI & Google Calendar Integration:** ฟอร์มสร้างงานสไตล์ Google Tasks (Dark UI) เชื่อมต่อ Google Tasks API (`tasks.google.com`) และ Google Calendar อัตโนมัติ

### 🔹 Phase 3: Omnichannel & Enterprise Compliance
- **💬 LINE OA & Telegram Chatbots:** รองรับการสั่งงานภาษาไทยธรรมชาติผ่าน Telegram (`@BotFather`) และ LINE Official Account (`LIFF SDK`)
- **🛡️ Self-Service Data Deletion:** ปุ่ม "Disconnect & Delete Account" ในหน้าตั้งค่า สั่งลบโทเค็นและล้างข้อมูลออกจากระบบ Middleware ภายใน 60 วินาที
- **📋 Google Verification Checklist Complete:** ผ่านเกณฑ์การประเมินความปลอดภัย Google Restricted Scopes และนโยบาย PDPA (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562)

---

## 🛡️ นโยบายการกำกับดูแลทั้ง 16 ข้อระดับ Enterprise (Governance Modules Summary)

1. **Data Retention Policy:** Logs จัดเก็บสูงสุด 30 วัน, Cache RAM ไม่เกิน 24 ชม., ข้อมูลหลักอยู่บน Google Workspace ของผู้ใช้ 100%
2. **Data Subject Rights (PDPA):** ผู้ใช้มีสิทธิ์เข้าถึง, แก้ไข, ดาวน์โหลด (Data Portability), สั่งลบทำลาย (Right to Erasure) และถอนความยินยอมได้ตลอดเวลา
3. **Incident Response Policy (SOP):** ทีมวิศวกรเข้าควบคุมเหตุภายใน 60 นาที และรายงานต่อ สคส. ภายใน 72 ชั่วโมงหากเกิด Data Breach
4. **Security Policy:** เข้ารหัสสัญญาณ HTTPS TLS 1.3, เข้ารหัสคีย์ Token ด้วย AES-256 Bit Encryption, ทำ Secret Rotation ทุก 90 วัน
5. **Backup & Recovery:** ฝากระบบสำรองข้อมูลไว้กับ Google Workspace Cloud, มีระบบกู้คืนอัตโนมัติ (Re-authentication) เมื่อย้ายโฮสติ้ง
6. **Third-party Providers:** Google Cloud Platform, Telegram Messenger, LY Corporation (LINE), Vercel, Supabase, GitHub
7. **Acceptable Use Policy (AUP):** ห้ามใช้ฟอกเงิน, หลอกลวงส่งสลิปปลอม, ส่งสแปม/มัลแวร์ หรือละเมิด พ.ร.บ. คอมพิวเตอร์
8. **Governing Law:** บังคับใช้ภายใต้กฎหมายแห่งราชอาณาจักรไทยและเขตอำนาจศาลไทย
9. **Force Majeure:** ข้อจำกัดความรับผิดชอบกรณีเหตุสุดวิสัยจากผู้ให้บริการคลาวด์ต้นทาง (Google, LINE, Telegram)
10. **Intellectual Property:** ซอร์สโค้ดและไอเดียเป็นของ Little Bro Assistant / ข้อมูลธุรกรรมทั้งหมดเป็นของผู้ใช้ 100%
11. **API Scope Justification:** รายละเอียดความจำเป็นของ Google Sheets, Drive, Calendar, Photos และ LINE Messaging APIs
12. **Privacy Contact (DPO):** `privacy@littlebroassistant.com` / เทคนิค: `support@littlebroassistant.com`
13. **Version History:** v1.0 -> v1.1 -> v1.2 -> v1.4.0 (Enterprise Compliance Release)
14. **Risk Assessment:** มาตรการควบคุมความเสี่ยง Token รั่วไหล, เซิร์ฟเวอร์ขัดข้อง และการสลับคิวรอส่งแจ้งเตือน (Message Queue)
15. **Google Verification Checklist:** ครบถ้วนทั้ง Privacy Policy, Terms of Service, Demo Video และ Data Deletion Navigation
16. **AI Governance Policy:** ระบบ AI ทำหน้าที่สกัดคำสั่ง (Human-in-the-Loop) การอนุมัติขั้นสุดท้ายขึ้นอยู่กับผู้ใช้เสมอ

---

## 🚀 การรันใช้งานระบบ (Getting Started)

```bash
# ติดตั้ง Dependencies
npm install

# รัน Development Server (Port 3000)
npm run dev

# สร้าง Production Build
npm run build
```

เปิด [http://localhost:3000](http://localhost:3000) บนบราวเซอร์เพื่อเริ่มใช้งานระบบ **Little Bro Assistant**
