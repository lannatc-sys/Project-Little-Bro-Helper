import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const registrationFilePath = path.join(process.cwd(), "apps-script", "registration.json");

function readRegistrations() {
  if (!fs.existsSync(registrationFilePath)) {
    return {};
  }
  try {
    const content = fs.readFileSync(registrationFilePath, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Failed to read registration file:", err);
    return {};
  }
}

function writeRegistrations(data: any) {
  try {
    const dir = path.dirname(registrationFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(registrationFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to write registration file:", err);
  }
}

// 1. Polling access endpoint
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ status: "error", message: "Missing email parameter" }, { status: 400 });
  }

  const data = readRegistrations();
  const reg = data[email];

  if (!reg) {
    return NextResponse.json({ status: "none", message: "No registration found" });
  }

  return NextResponse.json({
    status: reg.status,
    spreadsheet_id: reg.spreadsheet_id || "",
    folder_id: reg.folder_id || ""
  });
}

// 2. Submit access request endpoint
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, telegram_chat_id } = body;

    if (!email || !username) {
      return NextResponse.json({ status: "error", message: "Missing email or username" }, { status: 400 });
    }

    const data = readRegistrations();
    
    // Check if already approved or pending
    if (data[email] && data[email].status === "approved") {
      return NextResponse.json({ 
        status: "approved", 
        spreadsheet_id: data[email].spreadsheet_id, 
        folder_id: data[email].folder_id 
      });
    }

    // Set or overwrite as pending
    data[email] = {
      status: "pending_approval",
      username,
      telegram_chat_id: telegram_chat_id || "",
      timestamp: Date.now(),
      spreadsheet_id: "",
      folder_id: ""
    };

    writeRegistrations(data);

    // Trigger Telegram Admin Alert (we'll notify via Telegram in the same flow or separate)
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = "5581598534"; // active user iGAMER

    if (token) {
      const message = `👤 *คำขอเปิดใช้งานระบบผู้ช่วยส่วนตัว*\n\n*ชื่อผู้ใช้*: ${username}\n*อีเมล*: ${email}\n*Chat ID*: ${telegram_chat_id || "ไม่ได้ระบุ"}\n\nกรุณาพิจารณาอนุมัติหรือปฏิเสธคำขอเข้าใช้งานนี้ด้วยครับ`;
      
      const inlineKeyboard = [
        [
          { text: "🟢 อนุมัติการสร้างระบบ", callback_data: `reg_approve:${email}` },
          { text: "❌ ปฏิเสธคำขอ", callback_data: `reg_reject:${email}` }
        ]
      ];

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: message,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: inlineKeyboard
          }
        })
      });
    }

    return NextResponse.json({ status: "pending_approval" });

  } catch (error: any) {
    console.error("Error in onboarding registration API:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
