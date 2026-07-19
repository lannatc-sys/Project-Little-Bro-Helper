import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                 (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) || 
                 (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (!token) {
    return NextResponse.json({ status: "error", message: "TELEGRAM_BOT_TOKEN is not configured" }, { status: 500 });
  }
  if (!appUrl) {
    return NextResponse.json({ status: "error", message: "NEXT_PUBLIC_APP_URL and VERCEL_URL are not configured" }, { status: 500 });
  }

  let cleanUrl = appUrl.trim();
  const mdLinkRegex = /\[.*?\]\((.*?)\)/;
  const match = cleanUrl.match(mdLinkRegex);
  if (match) {
    cleanUrl = match[1];
  }
  cleanUrl = cleanUrl.replace(/\/+$/, "");

  const webhookUrl = `${cleanUrl}/api/bot`;

  try {
    // 1. ตั้งค่า Webhook URL
    const webhookRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
    const webhookResult = await webhookRes.json();

    // 2. ตั้งค่ารายการคำสั่งด่วน (Bot Menu Commands)
    const commandsPayload = {
      commands: [
        { command: "start", description: "ลงทะเบียนและเปิดหน้าเชื่อมต่อ Google Workspace" },
        { command: "home", description: "เปิดหน้าหลัก Mission Control บน Mini App" },
        { command: "money", description: "เปิดทางลัดหน้าฟอร์มกรอกบันทึกการเงินรายรับ-รายจ่าย" },
        { command: "task", description: "ดึงรายการงานด่วน 5 รายการล่าสุดจากระบบ" }
      ]
    };

    const commandsRes = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(commandsPayload)
    });
    const commandsResult = await commandsRes.json();

    return NextResponse.json({
      status: "success",
      message: "ตั้งค่าบอทและ Webhook สำเร็จ!",
      details: {
        webhook_setup: webhookResult,
        menu_commands_setup: commandsResult,
        configured_webhook_url: webhookUrl
      }
    });

  } catch (error: any) {
    console.error("Error setting up bot:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
