# คู่มือการ Deploy ขึ้น Vercel สำหรับ Little Bro Assistant 🚀

การ Deploy ขึ้น **Vercel** เป็นทางเลือกที่ง่ายและรวดเร็วที่สุดสำหรับโครงการ Next.js โดยรองรับการทำงานของ Backend API ที่เขียนด้วย Node.js แบบ 100% โดยไม่ต้องดัดแปลงโค้ดใดๆ ครับ

---

## 📋 สิ่งที่ต้องจัดเตรียม (Environment Variables สำหรับ Vercel)

ในระหว่างการกดยืนยัน Deploy บน Vercel ระบบจะมีช่องให้เพิ่มค่า **Environment Variables** บอสสามารถคัดลอกจากไฟล์ `.env.local` ไปกรอกได้ทันทีดังนี้ครับ:

| Key | Value (ตัวอย่าง) | คำอธิบาย |
| :--- | :--- | :--- |
| `TELEGRAM_BOT_TOKEN` | `8838172150:AAEY...` | โทเคนของบอท Telegram |
| `NEXT_PUBLIC_BACKEND_GAS_URL` | `https://script.google.com/macros/s/.../exec` | ลิงก์ API Google Apps Script |
| `GOOGLE_APPS_SCRIPT_URL` | `https://script.google.com/macros/s/.../exec` | ลิงก์ API Google Apps Script (ฝั่งเซิร์ฟเวอร์) |
| `GOOGLE_SPREADSHEET_ID` | `1jANLkV4IxXa3mybLPTs7L...` | ไอดีชีตฐานข้อมูลหลัก |
| `GOOGLE_CLIENT_ID` | `your_google_oauth_client_id...` | ไอดีรับรองสิทธิ์ของ Google Auth |
| `GOOGLE_CLIENT_SECRET` | `your_google_oauth_client_secret...` | คีย์ลับสิทธิ์ Google Auth |
| `LINE_CHANNEL_ACCESS_TOKEN` | `your_line_channel_access_token...` | คีย์ส่งข้อความ LINE OA (ถ้าใช้งาน) |
| `LINE_CHANNEL_SECRET` | `your_line_channel_secret...` | คีย์เช็คลายเซ็น LINE OA (ถ้าใช้งาน) |
| `NEXT_PUBLIC_APP_URL` | `https://your-project-name.vercel.app` | **เปลี่ยนเป็นลิงก์จริงของ Vercel หลังจากสร้างโครงการสำเร็จ** |

---

## 🛠️ ขั้นตอนการ Deploy ทีละสเต็ป

1. **เข้าสู่ระบบ Vercel:** ไปที่ [https://vercel.com/](https://vercel.com/) และล็อกอินด้วยบัญชี GitHub ของบอส
2. **นำเข้าโครงการ (Import Project):**
   - กดปุ่ม **"Add New"** ➔ เลือก **"Project"**
   - เลือกบัญชี GitHub และค้นหาโครงการ `Project-Little-Bro-Helper` ➔ กด **"Import"**
3. **ตั้งค่าคอนฟิกบิลด์ (Build & Development Settings):**
   - ปล่อยค่าเริ่มต้นไว้ทั้งหมด (ระบบ Vercel จะตรวจจับว่าเป็น Next.js อัตโนมัติ)
4. **เพิ่มตัวแปรระบบ (Environment Variables):**
   - นำตารางด้านบนไปกรอกในส่วน **Environment Variables** ให้ครบถ้วน
   - *หมายเหตุ: สำหรับค่า `NEXT_PUBLIC_APP_URL` ในขั้นแรก บอสสามารถใส่ลิงก์ชั่วคราวก่อนได้ หรือรอจนหน้าจอแจ้ง URL Vercel ของบอส แล้วค่อยนำมาอัปเดตภายหลังในหน้าตั้งค่า Vercel Project Settings ➔ Environment Variables*
5. **เริ่มการ Deploy:**
   - กดปุ่ม **"Deploy"** ➔ รอตัวระบบทำการบิลด์และปล่อยหน้าเว็บประมาณ 1-2 นาที เป็นอันเสร็จสิ้นสำเร็จครับ! 🎉

---

## 🔌 ขั้นตอนสุดท้าย: ผูก Webhook ของ Telegram และ LINE OA

หลังจาก Deploy บน Vercel สำเร็จ และได้ URL จริงของ Vercel แล้ว (เช่น `https://little-bro-assistant.vercel.app`):

### 1. ผูกบอท Telegram:
เรียกเปิดบราวเซอร์แล้วไปที่หน้าลิงก์นี้ เพื่อส่งคำสั่งอัปเดตปลายทางบอท:
```
https://<โดเมนย่อยของบอส>.vercel.app/api/bot/setup
```

### 2. ผูกบอท LINE OA:
นำลิงก์ปลายทางนี้ไปกรอกในช่อง Webhook URL ใน LINE Developers Messaging API Settings:
```
https://<โดเมนย่อยของบอส>.vercel.app/api/line
```
*(จากนั้นเปิดใช้สวิตช์ **Use Webhook**)*
