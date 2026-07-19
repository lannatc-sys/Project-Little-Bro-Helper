import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!token) {
    return NextResponse.json({ status: "error", message: "TELEGRAM_BOT_TOKEN is not configured" }, { status: 500 });
  }

  try {
    const update = await request.json();
    console.log("Telegram update received:", JSON.stringify(update));

    const approvalFilePath = path.join(process.cwd(), "apps-script", "approval.json");

    // A. Handle Inline Button Callback Queries (AI Agent Approvals)
    if (update.callback_query) {
      const callbackId = update.callback_query.id;
      const callbackData = update.callback_query.data;
      const chatId = update.callback_query.message.chat.id;
      const messageId = update.callback_query.message.message_id;

      let responseText = "";

      if (callbackData === "ai_approve") {
        fs.writeFileSync(approvalFilePath, JSON.stringify({ status: "approved", timestamp: Date.now() }, null, 2));
        responseText = "🟢 *บอสอนุมัติเรียบร้อยครับ!*\nเอเจนต์รับสิทธิ์และกำลังดำเนินงานต่อในเครื่องคอมพิวเตอร์ทันทีครับบอส 👔💻";
      } else if (callbackData === "ai_reject") {
        fs.writeFileSync(approvalFilePath, JSON.stringify({ status: "awaiting_reason", timestamp: Date.now() }, null, 2));
        responseText = "❌ *บอสปฏิเสธการรันคำสั่งครับ!*\n\nกรุณาพิมพ์เหตุผล หรือระบุสิ่งที่ต้องการให้ปรับปรุงแก้ไข ส่งกลับเข้าในแชทนี้ได้เลยครับบอส เอเจนต์หลังบ้านในคอมพิวเตอร์รอรับข้อความแก้ไขของบอสอยู่ครับ 👔";
      }

      // 1. ตอบกลับ callback query ของ Telegram เพื่อให้ปุ่มหยุดหมุนโหลด
      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: callbackId, text: "รับทราบคำสั่งอนุมัติ!" })
      });

      // 2. อัปเดตข้อความเดิมเพื่อล็อกสถานะให้บอสเห็น
      await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: responseText,
          parse_mode: "Markdown"
        })
      });

      return NextResponse.json({ status: "ok" });
    }

    // B. Handle regular text messages
    if (!update.message) {
      return NextResponse.json({ status: "ok", message: "No message in update" });
    }

    const chatId = update.message.chat.id;
    const text = (update.message.text || "").trim();
    const username = update.message.from?.username || "Boss";

    // B.1 Check if we are currently awaiting a rejection reason from the boss
    if (fs.existsSync(approvalFilePath)) {
      try {
        const approvalData = JSON.parse(fs.readFileSync(approvalFilePath, "utf8"));
        if (approvalData.status === "awaiting_reason") {
          // บันทึกคำสั่งเหตุผลในการปฏิเสธลงไฟล์
          fs.writeFileSync(
            approvalFilePath,
            JSON.stringify({ status: "rejected", reason: text, timestamp: Date.now() }, null, 2)
          );

          // ตอบแชทกลับเพื่อรับทราบเหตุผลในการแก้ไข
          const telegramApiUrl = `https://api.telegram.org/bot${token}/sendMessage`;
          await fetch(telegramApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ *รับทราบข้อแนะนำการแก้ไขครับบอส!*\n\n*สิ่งที่ต้องการให้ปรับปรุง*: "${text}"\n\nระบบบันทึกความต้องการลงไฟล์คอมพิวเตอร์เรียบร้อยแล้ว เอเจนต์จะเปิดอ่านข้อความเพื่อนำไปพัฒนาตรวจสอบแก้ไขระบบทันทีครับบอส! 👔💻`,
              parse_mode: "Markdown"
            })
          });

          return NextResponse.json({ status: "ok" });
        }
      } catch (err) {
        console.error("Error reading approval file:", err);
      }
    }

    let replyText = "";
    let inlineKeyboard: any[] = [];

    // Parse Bot Commands
    if (text.startsWith("/start")) {
      // ลงทะเบียน หรืออัปเดตสิทธิ์ Chat ID ปัจจุบันลงชีต Users หลังบ้าน
      const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
      const ssId = process.env.GOOGLE_SPREADSHEET_ID;
      if (gasUrl && ssId) {
        try {
          await fetch(gasUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "add_user",
              spreadsheet_id: ssId,
              user_id: chatId,
              telegram_username: username
            })
          });
        } catch (err) {
          console.error("Failed to auto-register new chat ID in GAS:", err);
        }
      }

      replyText = `สวัสดีครับคุณ ${username}! ยินดีต้อนรับสู่ระบบ Little Bro Helper 👔\nผมคือผู้ช่วยส่วนตัวในการจัดการฐานข้อมูลและบันทึกการเงินของคุณครับ\n\nผมได้ทำการสลับช่องทางการส่ง Push Notification และการเชื่อมโยงระบบมารายงานที่ห้องแชทนี้สำเร็จเรียบร้อยแล้วครับบอส! 📲\n\nบอสสามารถพิมพ์คุยบันทึกบัญชีด่วน หรือกดเปิด Mini App ด้านล่างได้เลยครับ`;
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
            text: "💸 บันทึกรายรับ/รายจ่าย",
            web_app: { url: `${appUrl}/add-expense` }
          }
        ]
      ];
    } else if (text.startsWith("/task")) {
      replyText = `📋 เปิดคลังจัดการงานสะสมเพื่ออัปเดตงานเช็คลิสต์บน Google Sheets ได้ที่ปุ่มด้านล่างครับบอส:`;
      inlineKeyboard = [
        [
          {
            text: "📂 ดูภารกิจสะสมทั้งหมด",
            web_app: { url: `${appUrl}/tasks` }
          }
        ]
      ];
    } else {
      // Natural Language Processing Parser (NLP text-to-sheet)
      const numberMatches = text.match(/\b\d+(?:\.\d+)?\b/);
      if (numberMatches) {
        const amount = parseFloat(numberMatches[0]);
        let isIncome = false;
        let action = "add_expense";
        let category = "อื่นๆ";
        let desc = text;

        // Classify Transaction Type
        if (text.includes("รายรับ") || text.includes("รายได้") || text.includes("บวก") || text.includes("ได้เงิน") || text.includes("รับ")) {
          isIncome = true;
          action = "add_income";
          category = "รายได้อื่นๆ";
        }

        // Classify Category from Keywords
        if (text.includes("ข้าว") || text.includes("อาหาร") || text.includes("กิน") || text.includes("คาเฟ่") || text.includes("กาแฟ")) {
          category = isIncome ? "ขายสินค้า" : "ค่าอาหาร";
        } else if (text.includes("น้ำมัน") || text.includes("รถ") || text.includes("เดินทาง") || text.includes("แท็กซี่")) {
          category = "ค่าน้ำมันรถ";
        } else if (text.includes("ไฟ") || text.includes("น้ำ") || text.includes("เน็ต") || text.includes("โทรศัพท์")) {
          category = "ค่าสาธารณูปโภค";
        } else if (text.includes("ห้อง") || text.includes("เช่า") || text.includes("หอพัก")) {
          category = isIncome ? "ค่าเช่าห้องพัก" : "ค่าสิ่งของ";
        }

        const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
        const ssId = process.env.GOOGLE_SPREADSHEET_ID;

        if (gasUrl && ssId) {
          try {
            const gasRes = await fetch(gasUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action,
                spreadsheet_id: ssId,
                amount,
                category,
                description: desc
              })
            });
            const gasResult = await gasRes.json();
            if (gasResult.status === "success") {
              replyText = `✅ *บันทึกบัญชีลง Sheets สำเร็จครับบอส!*\n\n*ประเภท*: ${isIncome ? "📈 รายรับ" : "📉 รายจ่าย"}\n*จำนวน*: ฿${amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}\n*หมวดหมู่*: ${category}\n*รายละเอียด*: ${desc}\n\nตัวเลขถูกซิงก์เข้าสู่ Google Sheets เรียบร้อยครับ! 👔`;
            } else {
              replyText = `❌ เกิดข้อผิดพลาดในการเขียนสเปรดชีต: ${gasResult.message}`;
            }
          } catch (err: any) {
            replyText = `⚠️ ระบบขัดข้องขณะซิงก์ข้อมูล: ${err.message}`;
          }
        } else {
          replyText = `⚠️ ระบบหลังบ้านยังไม่ได้เปิดตาราง Google Sheets สำหรับรับรายการจากแชทบอทครับบอส`;
        }
      } else {
        // Default text parser response
        replyText = `สวัสดีครับบอส ผมคือ Little Bro 👔 ผู้ช่วยส่วนตัวประจำแชทของบอส\n\nบอสสามารถคุยและสั่งงานผมได้ดังนี้ครับ:\n\n1. *จดบัญชีด่วน*: พิมพ์รายการเงิน เช่น "จ่ายค่าข้าว 150" หรือ "รายรับค่าห้อง 4500" ได้ทันที!\n2. *เรียกใช้คำสั่งระบบ*:\n   /home - เปิดแดชบอร์ดหลัก\n   /money - หน้าจอรับ-จ่าย\n   /task - ดูรายการงานสะสม`;
        inlineKeyboard = [
          [
            {
              text: "🚀 เปิดแดชบอร์ดหลัก",
              web_app: { url: appUrl }
            }
          ]
        ];
      }
    }

    // Send Message back to Telegram Chat
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
