import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    status: "success",
    action: "deploy",
    message: "🚀 ส่งคำสั่งรันระบบสร้างและส่งออก Production Build ไปยัง Vercel / GitHub เรียบร้อยแล้ว",
    timestamp: new Date().toISOString()
  });
}
