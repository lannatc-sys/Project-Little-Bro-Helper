const fs = require("fs");
const path = require("path");

const token = "8838172150:AAEYqB68iIygAtTxG1TqChycBXrBulB0BcQ";
const chatId = "5581598534"; // active user iGAMER
const approvalFilePath = path.join(__dirname, "apps-script", "approval.json");

console.log("Approval monitor daemon started... checking every 3 minutes.");

setInterval(async () => {
  if (fs.existsSync(approvalFilePath)) {
    try {
      const approvalData = JSON.parse(fs.readFileSync(approvalFilePath, "utf8"));
      
      if (approvalData.status === "awaiting_reason") {
        console.log("Awaiting reason... sending Telegram reminder.");
        const text = "⚠️ *แจ้งเตือนภัยซ้ำ (ทุก 3 นาที)*:\n\nบอสครับ ผมยังรอเหตุผลหรือคำแนะนำแก้ไขรายการที่บอสปฏิเสธล่าสุดอยู่นะครับ รบกวนพิมพ์ข้อความตอบกลับเข้ามาในห้องแชทได้เลยครับบอส! 👔";
        await sendTelegram(text);
      }
      
      if (approvalData.status === "pending_approval") {
        console.log("Pending approval... sending Telegram reminder.");
        const text = "⚠️ *แจ้งเตือนภัยซ้ำ (ทุก 3 นาที)*:\n\nบอสครับ ผมยังรอการกดปุ่ม [🟢 อนุมัติรันงานต่อ] เพื่อรันขั้นตอนถัดไปในระบบอยู่นะครับ รบกวนกดเลือกที่การ์ดด้านบนได้เลยครับบอส! 👔";
        await sendTelegram(text);
      }
    } catch (err) {
      console.error("Error reading approval file:", err);
    }
  }
}, 180000); // 3 minutes

async function sendTelegram(text) {
  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown"
      })
    });
    if (!response.ok) {
      console.error("Failed to send message:", await response.text());
    } else {
      console.log("Reminder sent successfully.");
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
