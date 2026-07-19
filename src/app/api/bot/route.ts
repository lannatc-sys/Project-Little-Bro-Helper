import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                 (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) || 
                 (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

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
        responseText = "🟢 *บันทึกและดำเนินการเรียบร้อยครับ!*\nระบบได้รับสิทธิ์และกำลังรันขั้นตอนทำงานต่อทันทีครับ 💻";
      } else if (callbackData === "ai_reject") {
        fs.writeFileSync(approvalFilePath, JSON.stringify({ status: "awaiting_reason", timestamp: Date.now() }, null, 2));
        responseText = "❌ *ระงับการทำงานชั่วคราวครับ!*\n\nกรุณาพิมพ์ข้อแนะนำสิ่งที่ต้องการให้แก้ไขส่งเข้ามาได้เลยครับ ระบบจะบันทึกข้อคิดเห็นเพื่อตรวจสอบแก้ไขต่อไปครับ";
      } else if (callbackData.startsWith("reg_approve:") || callbackData.startsWith("reg_reject:")) {
        const isApprove = callbackData.startsWith("reg_approve:");
        const email = callbackData.split(":")[1];
        const regFilePath = path.join(process.cwd(), "apps-script", "registration.json");
        
        let regData: any = {};
        if (fs.existsSync(regFilePath)) {
          try {
            regData = JSON.parse(fs.readFileSync(regFilePath, "utf8"));
          } catch(e) {
            console.error(e);
          }
        }

        const reg = regData[email];
        if (reg) {
          if (isApprove) {
            // Call GAS to create database
            const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
            const ssId = process.env.GOOGLE_SPREADSHEET_ID; // active setup template ID
            if (gasUrl && ssId) {
              try {
                const gasRes = await fetch(gasUrl, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "create_user_database",
                    spreadsheet_id: ssId, // needed for check but create doesn't need it
                    user_name: reg.username
                  })
                });
                const gasResult = await gasRes.json();
                if (gasResult.status === "success") {
                  reg.spreadsheet_id = gasResult.spreadsheet_id;
                  reg.folder_id = gasResult.folder_id;
                  reg.status = "approved";
                  responseText = `🟢 *อนุมัติคำขอเรียบร้อยแล้ว!*\nระบบจัดตั้งฐานข้อมูลและเชื่อม Workspace ให้ผู้ใช้แล้วครับ 💻\n\n*ID ชีต*: \`${gasResult.spreadsheet_id}\``;
                  
                  // Notify user if Telegram ID exists
                  if (reg.telegram_chat_id) {
                    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        chat_id: reg.telegram_chat_id,
                        text: `🎉 *ยินดีด้วยครับ! บัญชีผู้ช่วยส่วนตัวได้รับการอนุมัติเรียบร้อยแล้ว*\n\nระบบผู้ช่วยได้จัดเตรียมโฟลเดอร์ Google Drive และ Spreadsheet บัญชีส่วนตัวให้เรียบร้อยแล้วครับ 💾\n\nสามารถเปิดหน้าต่างแอปเพื่อเข้าใช้งานได้ทันที!`,
                        parse_mode: "Markdown"
                      })
                    });
                  }
                } else {
                  responseText = `❌ เกิดข้อผิดพลาดในระบบหลังบ้าน Google Apps Script: ${gasResult.message}`;
                }
              } catch (gasErr: any) {
                responseText = `❌ การติดต่อ Apps Script ขัดข้อง: ${gasErr.message}`;
              }
            } else {
              responseText = `❌ ล้มเหลว: ไม่พบตัวแปรสภาพแวดล้อมระบบหลังบ้าน`;
            }
          } else {
            reg.status = "rejected";
            responseText = `❌ *ไม่อนุมัติคำขอการเข้าใช้งานเรียบร้อยครับ*`;
            
            // Notify user
            if (reg.telegram_chat_id) {
              await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: reg.telegram_chat_id,
                  text: `⚠️ *คำขอเปิดใช้งานบัญชีของคุณไม่ได้รับการอนุมัติ*\n\nหากคิดว่านี่คือข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์เชื่อมต่ออีกครั้งครับ`,
                  parse_mode: "Markdown"
                })
              });
            }
          }
          fs.writeFileSync(regFilePath, JSON.stringify(regData, null, 2));
        } else {
          responseText = `⚠️ ไม่พบข้อมูลคำขอของอีเมล: ${email}`;
        }
      }

      // 1. ตอบกลับ callback query ของ Telegram เพื่อให้ปุ่มหยุดหมุนโหลด
      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: callbackId, text: "รับทราบคำสั่งดำเนินการ!" })
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
    const rawUsername = update.message.from?.username || "User";
    const username = rawUsername.replace(/[_*`[\]()]/g, "\\$&");

    // B.1 Check if we are currently awaiting a rejection reason
    if (fs.existsSync(approvalFilePath)) {
      try {
        const approvalData = JSON.parse(fs.readFileSync(approvalFilePath, "utf8"));
        if (approvalData.status === "awaiting_reason") {
          // บันทึกคำสั่งเหตุผลการระงับลงไฟล์
          fs.writeFileSync(
            approvalFilePath,
            JSON.stringify({ status: "rejected", reason: text, timestamp: Date.now() }, null, 2)
          );

          // ตอบแชทกลับเพื่อรับทราบเหตุผล
          const telegramApiUrl = `https://api.telegram.org/bot${token}/sendMessage`;
          await fetch(telegramApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ *รับทราบข้อคิดเห็นเพื่อตรวจสอบแก้ไขเรียบร้อยครับ!*\n\n*ข้อแนะนำ*: "${text}"\n\nระบบบันทึกความคิดเห็นลงฐานข้อมูลเพื่อรอการตรวจสอบแก้ไขแล้วครับ 💻`,
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
      // ลงทะเบียน หรืออัปเดตสิทธิ์ Chat ID ปัจจุบันลงชีต Profiles หลังบ้าน
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

      replyText = `สวัสดีครับคุณ ${username}! เริ่มต้นใช้งานระบบผู้ช่วยส่วนตัว Little Bro Assistant เรียบร้อยแล้วครับ 📲\nผมพร้อมช่วยบันทึกการเงินและเตือนความจำกิจกรรมต่างๆ ของคุณแล้วครับ\n\nสามารถพิมพ์คุยบันทึกบัญชี หรือกดปุ่มเปิดหน้าต่างแอปด้านล่างได้เลยครับ`;
      inlineKeyboard = [
        [
          {
            text: "🚀 เปิดแอปผู้ช่วยส่วนตัว",
            web_app: { url: appUrl }
          }
        ]
      ];
    } else if (text.startsWith("/home")) {
      replyText = `เปิดหน้าหลักของคุณได้ที่ปุ่มด้านล่างนี้ครับ:`;
      inlineKeyboard = [
        [
          {
            text: "🏠 หน้าหลักระบบผู้ช่วย",
            web_app: { url: appUrl }
          }
        ]
      ];
    } else if (text.startsWith("/money")) {
      replyText = `เปิดหน้าจอบันทึกรายรับ/รายจ่ายด่วนได้เลยครับ:`;
      inlineKeyboard = [
        [
          {
            text: "💸 บันทึกบัญชีส่วนตัว",
            web_app: { url: `${appUrl}/add-expense` }
          }
        ]
      ];
    } else if (text.startsWith("/task")) {
      replyText = `📋 เปิดคลังจัดการรายการสิ่งที่ต้องทำได้ที่ปุ่มด้านล่างนี้ครับ:`;
      inlineKeyboard = [
        [
          {
            text: "📂 ดูสิ่งที่ต้องทำทั้งหมด",
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
          category = isIncome ? "รายรับทั่วไป" : "ค่าอาหาร";
        } else if (text.includes("น้ำมัน") || text.includes("รถ") || text.includes("เดินทาง") || text.includes("แท็กซี่")) {
          category = "ค่าเดินทาง";
        } else if (text.includes("ไฟ") || text.includes("น้ำ") || text.includes("เน็ต") || text.includes("โทรศัพท์")) {
          category = "ค่าสาธารณูปโภค";
        } else if (text.includes("ห้อง") || text.includes("เช่า") || text.includes("หอพัก")) {
          category = isIncome ? "รายรับทั่วไป" : "ค่าที่พัก";
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
              replyText = `✅ *บันทึกรายการลงบัญชีสำเร็จเรียบร้อยครับ!*\n\n*ประเภท*: ${isIncome ? "📈 รายรับ" : "📉 รายจ่าย"}\n*จำนวน*: ฿${amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}\n*หมวดหมู่*: ${category}\n*รายละเอียด*: ${desc}\n\nข้อมูลการเงินถูกซิงก์ซ้อนเรียบร้อยแล้วครับ!`;
            } else {
              replyText = `❌ เกิดข้อผิดพลาดในการเขียนแผ่นงาน: ${gasResult.message}`;
            }
          } catch (err: any) {
            replyText = `⚠️ ระบบขัดข้องขณะซิงก์ข้อมูล: ${err.message}`;
          }
        } else {
          replyText = `⚠️ ระบบหลังบ้านยังไม่ได้เปิดตาราง Google Sheets สำหรับรับรายการจากแชทบอทครับ`;
        }
      } else {
        // Default text parser response
        replyText = `สวัสดีครับ ผมคือ Little Bro 👔 ผู้ช่วยส่วนตัวประจำแชทของคุณ\n\nสามารถคุยและสั่งงานผมได้ดังนี้ครับ:\n\n1. *จดบัญชีด่วน*: พิมพ์รายการเงิน เช่น "ค่าข้าว 150" หรือ "รายรับ 4500" ได้ทันที!\n2. *เรียกใช้คำสั่งระบบ*:\n   /home - เปิดแดชบอร์ดหลัก\n   /money - หน้าจอรับ-จ่าย\n   /task - ดูรายการสิ่งที่ต้องทำ`;
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
