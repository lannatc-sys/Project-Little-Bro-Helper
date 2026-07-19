import { NextResponse } from "next/server";
import crypto from "crypto";

// LINE OA Webhook Bridge
export async function POST(request: Request) {
  try {
    const channelSecret = process.env.LINE_CHANNEL_SECRET || "";
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
    const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL || "";
    const ssId = process.env.GOOGLE_SPREADSHEET_ID || "";

    const signature = request.headers.get("x-line-signature") || "";
    const bodyText = await request.text();

    // 1. Signature Verification
    if (channelSecret) {
      const hash = crypto
        .createHmac("SHA256", channelSecret)
        .update(bodyText)
        .digest("base64");
      
      if (hash !== signature) {
        return new Response("Invalid signature", { status: 401 });
      }
    }

    const body = JSON.parse(bodyText);
    const events = body.events || [];

    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        const replyToken = event.replyToken;
        const userText = event.message.text.trim();
        const userId = event.source.userId;

        let replyMessage = "";

        // 2. Parse money items or checklist from LINE text
        const numberMatches = userText.match(/\b\d+(?:\.\d+)?\b/);
        if (numberMatches) {
          const amount = parseFloat(numberMatches[0]);
          let isIncome = false;
          let action = "add_expense";
          let category = "อื่นๆ";
          let desc = userText;

          if (userText.includes("รายรับ") || userText.includes("รายได้") || userText.includes("บวก") || userText.includes("ได้เงิน") || userText.includes("รับ")) {
            isIncome = true;
            action = "add_income";
            category = "รายได้อื่นๆ";
          }

          if (userText.includes("ข้าว") || userText.includes("อาหาร") || userText.includes("กิน") || userText.includes("คาเฟ่") || userText.includes("กาแฟ")) {
            category = isIncome ? "รายรับทั่วไป" : "ค่าอาหาร";
          } else if (userText.includes("น้ำมัน") || userText.includes("รถ") || userText.includes("เดินทาง") || userText.includes("แท็กซี่")) {
            category = "ค่าเดินทาง";
          } else if (userText.includes("ไฟ") || userText.includes("น้ำ") || userText.includes("เน็ต") || userText.includes("โทรศัพท์")) {
            category = "ค่าสาธารณูปโภค";
          }

          // Write directly to Supabase first for sub-100ms speed!
          let supaSuccess = false;
          try {
            const { supabase } = await import("@/lib/supabase");
            const { error } = await supabase.from("finance").insert({
              transaction_type: isIncome ? "Income" : "Expense",
              category,
              amount,
              description: desc,
              timestamp: new Date().toISOString()
            });
            if (!error) {
              supaSuccess = true;
            } else {
              console.error("Supabase insert error returned:", error);
            }
          } catch (supaErr) {
            console.error("Supabase insert from LINE failed:", supaErr);
          }

          if (supaSuccess) {
            replyMessage = `✅ บันทึกรายการลงบัญชีสำเร็จ!\n\n• ประเภท: ${isIncome ? "📈 รายรับ" : "📉 รายจ่าย"}\n• จำนวน: ฿${amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}\n• หมวดหมู่: ${category}\n• รายละเอียด: ${desc}\n\nข้อมูลซิงก์เรียบร้อยแล้วครับ!`;

            // Fire-and-forget sync to Google Sheets in background
            if (gasUrl && ssId) {
              fetch(gasUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action,
                  spreadsheet_id: ssId,
                  amount,
                  category,
                  description: desc
                })
              }).catch(e => console.error("GAS sync background error from LINE:", e));
            }
          } else {
            // Fallback to legacy wait for GAS
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
                  replyMessage = `✅ บันทึกรายการลงบัญชีสำเร็จ!\n\n• ประเภท: ${isIncome ? "📈 รายรับ" : "📉 รายจ่าย"}\n• จำนวน: ฿${amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}\n• หมวดหมู่: ${category}\n• รายละเอียด: ${desc}`;
                } else {
                  replyMessage = `❌ เกิดข้อผิดพลาดในระบบชีต: ${gasResult.message}`;
                }
              } catch (err: any) {
                replyMessage = `⚠️ ระบบขัดข้องขณะซิงก์ข้อมูล: ${err.message}`;
              }
            } else {
              replyMessage = `⚠️ ระบบหลังบ้านยังไม่ได้เปิดตาราง Google Sheets สำหรับรับรายการจากแชทบอทครับ`;
            }
          }
        } else {
          // Default response / Help commands
          replyMessage = `สวัสดีครับพี่! ผมคือน้องชาย Little Bro Assistant 👔 ยินดีที่ได้ดูแลและช่วยพี่ทาง LINE OA นะครับ\n\nพี่สามารถสั่งงานผมได้ดังนี้เลยครับ:\n1. พิมพ์จดบันทึกรายรับ-รายจ่าย เช่น "ค่าข้าว 120" หรือ "รายได้ 5000"\n2. เปิดดูข้อมูลแดชบอร์ดการเงินและตารางงานที่เชื่อมต่อได้ตลอดเวลาเลยนะพี่`;
        }

        // 3. Send Reply Message back to LINE
        if (channelAccessToken && replyToken) {
          await fetch("https://api.line.me/v2/bot/message/reply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${channelAccessToken}`
            },
            body: JSON.stringify({
              replyToken,
              messages: [
                {
                  type: "text",
                  text: replyMessage
                }
              ]
            })
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Error in /api/line:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
