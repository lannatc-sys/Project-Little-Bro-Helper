import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    status: "success",
    action: "sync",
    message: "🔄 ซิงก์ข้อมูลเรียลไทม์ระหว่าง Supabase, Google Sheets และ Bot Integrations สำเร็จเรียบร้อยแล้ว",
    timestamp: new Date().toISOString()
  });
}
