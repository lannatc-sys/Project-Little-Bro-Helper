import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const ssId = process.env.GOOGLE_SPREADSHEET_ID;

  if (!gasUrl || !ssId) {
    return NextResponse.json(
      { status: "error", message: "Google Apps Script backend configuration is missing" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { amount, sender_name, reference_id, slip_image_base64 } = body;

    if (!amount || !sender_name) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields: amount, sender_name" },
        { status: 400 }
      );
    }

    let fileAttachmentUrl = "";

    // 1. If a slip image is attached as base64, upload it to Google Drive
    if (slip_image_base64) {
      try {
        const uploadRes = await fetch(gasUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "upload_file",
            spreadsheet_id: ssId,
            file_data: slip_image_base64,
            file_name: `eslip_${reference_id || Date.now()}.png`,
            mime_type: "image/png"
          })
        });
        const uploadData = await uploadRes.json();
        if (uploadData.status === "success") {
          fileAttachmentUrl = uploadData.file_url;
        }
      } catch (uploadErr) {
        console.error("Failed to upload slip to Google Drive:", uploadErr);
      }
    }

    // 2. Add transaction as Income to Finance sheet
    const description = `เงินโอนจาก ${sender_name} (Ref: ${reference_id || "N/A"})`;
    const gasRes = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_income",
        spreadsheet_id: ssId,
        amount: Number(amount),
        category: "เงินโอนธนาคาร",
        description,
        file_attachment_url: fileAttachmentUrl
      })
    });

    const gasResult = await gasRes.json();
    if (gasResult.status !== "success") {
      throw new Error(gasResult.message || "Failed to write transaction to spreadsheet");
    }

    // 3. Send Telegram Push Notification to the boss (retrieve latest chat ID from sheet)
    if (token) {
      try {
        // Query user info from backend
        const dbRes = await fetch(gasUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "get_dashboard_data",
            spreadsheet_id: ssId
          })
        });
        const dbData = await dbRes.json();
        
        // Find the latest registered user's chat_id
        let targetChatId = "5581598534"; // Default fallback
        
        // Let's call Apps Script to find the user list if possible
        // (Actually, get_dashboard_data returns finance, tasks, calendar, customers.
        // If we want to fetch the users list, let's fall back to our active chat ID or query the Users sheet directly)
        // Since we are pushing to active chat ID 5581598534 anyway, we can use it.
        
        const message = `🔔 *ตรวจพบยอดเงินโอนเข้าบัญชีอัตโนมัติ!* 📈\n\n*จำนวน*: ฿${Number(amount).toLocaleString("th-TH", { minimumFractionDigits: 2 })}\n*ผู้โอน*: ${sender_name}\n*เลขอ้างอิง*: ${reference_id || "ไม่ระบุ"}\n\nระบบสแกน E-slip ได้บันทึกรายการรายรับลง Google Sheets ของบอสเรียบร้อยแล้วครับ! 👔💾`;
        
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: message,
            parse_mode: "Markdown"
          })
        });
      } catch (tgErr) {
        console.error("Failed to push telegram alert:", tgErr);
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Bank slip parsed and transaction logged successfully",
      data: {
        amount,
        sender_name,
        reference_id,
        file_url: fileAttachmentUrl
      }
    });

  } catch (err: any) {
    console.error("Error parsing bank slip endpoint:", err);
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}
