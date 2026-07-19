import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!token) {
    return NextResponse.json({ status: "error", message: "TELEGRAM_BOT_TOKEN is not configured" }, { status: 500 });
  }

  try {
    const update = await request.json();
    console.log("Telegram update received:", JSON.stringify(update));

    if (!update.message) {
      return NextResponse.json({ status: "ok", message: "No message in update" });
    }

    const chatId = update.message.chat.id;
    const text = update.message.text || "";
    const username = update.message.from?.username || "Boss";

    let replyText = "";
    let inlineKeyboard: any[] = [];

    // Parse Bot Commands
    if (text.startsWith("/start")) {
      replyText = `สวัสดีครับคุณ ${username}! ยินดีต้อนรับสู่ระบบ Little Bro Helper 👔\nผมคือผู้ช่วยส่วนตัวในการจัดการฐานข้อมูลและบันทึกการเงินของคุณครับ\n\nกรุณากดปุ่มด้านล่างเพื่อเปิดใช้งานหน้ากากระบบช่วยเหลือครับ`;
      inlineKeyboard = [
        [
          {
            text: "🚀 เปิดระบบช่วยเหลือ (Mini App)",
            web_app: { url: appUrl }
          }
        ]
      ];
    } else if (text.startsWith("/home")) {
      replyText = `เปิดหน้าหลัก Mission Control ของบอสที่ปุ่มด้านล่างได้เลยครับ:`;
      inlineKeyboard = [
        [
          {
            text: "🏠 หน้าหลัก Mission Control",
            web_app: { url: appUrl }
          }
        ]
      ];
    } else if (text.startsWith("/money")) {
      replyText = `บอสสามารถเปิดหน้าจอเพื่อบันทึกรายการรายจ่ายด่วนลง Google Sheets ได้เลยครับ:`;
      inlineKeyboard = [
        [
          {
            text: "💸 บันทึกรายจ่ายด่วน",
            web_app: { url: `${appUrl}/add-expense` }
          }
        ]
      ];
    } else if (text.startsWith("/task")) {
      replyText = `📋 รายการงานด่วนล่าสุดของบอส:\n\n1. ตรวจสอบระบบงานฐานข้อมูล (เสร็จสิ้น)\n2. ทดลองรันระบบ Next.js หน้าบ้าน (เสร็จสิ้น)\n3. ทำการตั้งค่าบอทและ Webhook (กำลังดำเนินการ)\n\n*บอสสามารถตรวจสอบงานทั้งหมดบนหน้าหลักได้เลยครับ!*`;
      inlineKeyboard = [
        [
          {
            text: "📂 ดูภารกิจทั้งหมด",
            web_app: { url: appUrl }
          }
        ]
      ];
    } else {
      replyText = `สวัสดีครับบอส ผมได้รับการติดต่อจากคุณแล้ว แต่อาจยังไม่เข้าใจคำสั่งนี้\n\nลองใช้คำสั่งเหล่านี้ในการเรียกคุยกับผมนะครับ:\n/home - เปิดหน้าหลัก\n/money - บันทึกการเงิน\n/task - ตรวจสอบงานด่วน`;
    }

    // Send Message back to Telegram
    const telegramApiUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload: any = {
      chat_id: chatId,
      text: replyText,
      parse_mode: "Markdown"
    };

    if (inlineKeyboard.length > 0) {
      payload.reply_markup = {
        inline_keyboard: inlineKeyboard
      };
    }

    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to send telegram message:", errorText);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Error in Telegram Webhook:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
