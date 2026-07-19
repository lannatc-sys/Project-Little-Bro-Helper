const fs = require("fs");
const path = require("path");

// Load .env.local manually
try {
  const envPath = path.join(__dirname, ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach(line => {
      const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (err) {
  console.error("Failed to load .env.local:", err);
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = "5581598534"; // active user iGAMER
const approvalFilePath = path.join(__dirname, "apps-script", "approval.json");

console.log("Approval monitor daemon started... checking every 3 minutes.");

setInterval(async () => {
  if (fs.existsSync(approvalFilePath)) {
    try {
      const approvalData = JSON.parse(fs.readFileSync(approvalFilePath, "utf8"));
      
      if (approvalData.status === "awaiting_reason") {
        console.log("Awaiting reason... sending Telegram reminder.");
        const text = "⚠️ *แจ้งเตือนทวนความจำ (ทุก 3 นาที)*:\n\nระบบยังรอข้อแนะนำเพิ่มเติมเกี่ยวกับรายการที่ระงับล่าสุดอยู่นะครับ รบกวนพิมพ์รายละเอียดส่งเข้ามาได้เลยครับ";
        await sendTelegram(text);
      }
      
      if (approvalData.status === "pending_approval") {
        console.log("Pending approval... sending Telegram reminder.");
        const text = "⚠️ *แจ้งเตือนทวนความจำ (ทุก 3 นาที)*:\n\nระบบยังรอการกดปุ่มอนุมัติดำเนินงานต่ออยู่นะครับ รบกวนกดเลือกที่การ์ดด้านบนได้เลยครับ";
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
