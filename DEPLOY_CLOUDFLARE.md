# คู่มือการเตรียมตัวและ Deploy ขึ้น Cloudflare Pages 🚀

แอปพลิเคชัน **Little Bro Assistant** ถูกเขียนขึ้นโดยใช้เฟรมเวิร์ก Next.js หากบอสต้องการนำขึ้นระบบ **Cloudflare Pages** จะต้องผ่านเงื่อนไขสถาปัตยกรรมเฉพาะของ Cloudflare Workers/Edge Runtime ดังนี้ครับ:

---

## 1. ⚠️ ข้อจำกัดสำคัญ (Cloudflare Edge Runtime vs Node.js)

Cloudflare Pages รันโค้ดส่วน API Routes (Backend) บน **V8 Isolates (Edge Workers)** ซึ่งแตกต่างจากเซิร์ฟเวอร์แบบดั้งเดิม:
* **ไม่มีระบบไฟล์ถาวร (No persistent/writable `fs`):** สคริปต์ที่ใช้การเขียน/อ่านไฟล์ลงดิสก์ เช่นการบันทึกสถานะการขออนุมัติชั่วคราวลงในไฟล์ `registration.json` หรือ `approval.json` ด้วยไลบรารี `fs` ของ Node.js **จะไม่สามารถทำงานได้บน Cloudflare Pages** และจะทำให้ระบบ Error ทันที
* **ไม่รองรับ Node Core APIs บางส่วน:** Edge Workers จะใช้ Web APIs มาตรฐาน (เช่น Web Crypto แทน `crypto` ของ Node.js)

---

## 2. 💡 ทางเลือกและคำแนะนำในการ Deploy

### ทางเลือกที่ 1: Deploy บน Vercel หรือ Railway / Zeabur (แนะนำที่สุด ⭐)
* **ทำไมถึงแนะนำ:** บริการเหล่านี้มี Node.js Serverless Environment ทำให้บอสสามารถรันโค้ดปัจจุบันที่ใช้ `fs` เขียนไฟล์ลงหน่วยความจำชั่วคราวได้ทันที **โดยไม่ต้องแก้ไขโค้ดใดๆ เลย**
* **ค่าใช้จ่าย:** Vercel มีแพ็กเกจ Hobby/Free ที่เพียงพอสำหรับการใช้งานส่วนตัวแบบ 100%

### ทางเลือกที่ 2: ใช้ Cloudflare Pages ร่วมกับฐานข้อมูลไร้เซิร์ฟเวอร์ (Serverless Database)
หากบอสจำเป็นต้องใช้ Cloudflare Pages จริงๆ บอสจะต้องดัดแปลงโค้ดในโฟลเดอร์ `src/app/api/` เพื่อย้ายการจัดเก็บข้อมูลสมัครสมาชิกจากไฟล์ JSON ไปยังระบบจัดเก็บของ Cloudflare:
1. **Cloudflare KV (Key-Value) หรือ D1 (SQL Database):** เพื่อใช้เก็บข้อมูล Registration Status
2. **แก้ไขตัวแปร `fs`:** เปลี่ยนมาดึงข้อมูลผ่านอินเตอร์เฟซ KV/D1 แทนการใช้ `fs.readFileSync` และ `fs.writeFileSync`

---

## 3. 🛠️ ขั้นตอนการคอนฟิกเพื่อ Deploy บน Cloudflare Pages

หากบอสเลือก **ทางเลือกที่ 2 (Cloudflare Pages)** จะต้องดำเนินการติดตั้งตัวแปลงดังนี้ครับ:

### ขั้นที่ 1: ติดตั้ง Cloudflare Adapter ในโปรเจกต์
รันคำสั่งติดตั้งตัวแปลง Next.js สำหรับ Cloudflare:
```bash
npm install --save-dev @cloudflare/next-on-pages
```

### ขั้นที่ 2: เปิดโหมดการทำงาน Edge Runtime ในโค้ด API
ในทุกไฟล์ API ที่อยู่ใน `src/app/api/` (เช่น `status/route.ts`, `bot/route.ts`, `line/route.ts`, `expense/route.ts`) บอสจะต้องเพิ่มคำสั่งเปิดใช้ Edge Runtime ไว้ที่บรรทัดบนสุดของไฟล์:
```typescript
export const runtime = "edge";
```

### ขั้นที่ 3: แก้ไขส่วนการตรวจสอบลายเซ็น (LINE / Telegram Signature Verify)
ในฟังก์ชันที่ใช้ `crypto.createHmac` ให้เปลี่ยนไปใช้มาตรฐาน **Web Crypto API** ซึ่งรองรับบน Edge Workers:
```typescript
// ตัวอย่างการทำ Web Crypto HMAC SHA256 บน Edge
const key = await crypto.subtle.importKey(
  "raw",
  new TextEncoder().encode(channelSecret),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign"]
);
const signatureBuffer = await crypto.subtle.sign(
  "HMAC",
  key,
  new TextEncoder().encode(bodyText)
);
const hash = Buffer.from(signatureBuffer).toString("base64");
```

### ขั้นที่ 4: สั่งบิลด์และ Deploy
1. เชื่อมต่อ Git Repository บนหน้าคอนโซล Cloudflare Dashboard
2. เลือกโปรเจกต์เป็นแบบ **Next.js**
3. ตั้งค่าคำสั่งบิลด์ (Build Command):
   `npx @cloudflare/next-on-pages`
4. ตั้งค่าโฟลเดอร์ปลายทางในการปล่อยเว็บ (Output Directory):
   `.vercel/output` (ผลลัพธ์จากการบิลด์ของ Next-on-Pages)
