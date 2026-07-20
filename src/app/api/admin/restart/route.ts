import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    status: "success",
    action: "restart",
    message: "⚡ ส่งคำสั่งรีสตาร์ทกระบวนการทำงานของเซิร์ฟเวอร์สำนักงานใหญ่เรียบร้อยแล้ว",
    timestamp: new Date().toISOString()
  });
}
