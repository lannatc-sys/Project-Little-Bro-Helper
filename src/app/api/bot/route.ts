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
    const text = (update.message.text || "").trim();
    const username = update.message.from?.username || "Boss";

    let replyText = "";
    let inlineKeyboard: any[] = [];

    // Parse Bot Commands
    if (text.startsWith("/start")) {
      replyText = `สวัสดีครับคุณ ${username}! ยินดีต้อนรับสู่ระบบ Little Bro Helper 👔\nผมคือผู้ช่วยส่วนตัวในการจัดการฐานข้อมูลและบันทึกการเงินของคุณครับ\n\nบอสสามารถพิมพ์คุยกับผมด่วน เช่น "จ่ายค่าข้าว 120 บาท" เพื่อบันทึกบัญชีลง Sheets ได้ทันที หรือกดเปิด Mini App ด้านล่างได้เลยครับ`;
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
