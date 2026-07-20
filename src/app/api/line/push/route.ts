import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!channelAccessToken) {
      return NextResponse.json(
        { status: "error", message: "LINE_CHANNEL_ACCESS_TOKEN is missing in environment" },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const targetUserId = body.to || body.user_id;
    const messageText = body.message || body.text || "🔔 *แจ้งเตือนจาก Little Bro Assistant*: ทดสอบระบบ Push Message ผ่าน LINE OA สำเร็จเรียบร้อยแล้วครับ! 👔✨";

    if (!targetUserId) {
      return NextResponse.json({
        status: "warning",
        message: "กรุณาระบุ 'to' หรือ 'user_id' ของผู้ใช้งาน LINE ที่ต้องการส่งข้อความดัน (Push Message)",
        bot_info: {
          name: "Little Bro Assistant",
          basic_id: "@320futtz",
          status: "Token Active & Ready 🟢"
        }
      });
    }

    const lineRes = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${channelAccessToken}`
      },
      body: JSON.stringify({
        to: targetUserId,
        messages: [
          {
            type: "text",
            text: messageText
          }
        ]
      })
    });

    const data = await lineRes.json().catch(() => ({}));

    if (!lineRes.ok) {
      return NextResponse.json(
        {
          status: "error",
          message: data.message || "Failed to push message via LINE API",
          details: data
        },
        { status: lineRes.status }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "ส่งข้อความ Push Message ผ่าน LINE OA สำเร็จเรียบร้อยครับ! 📲",
      to: targetUserId
    });

  } catch (error: any) {
    console.error("Error pushing LINE message:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
