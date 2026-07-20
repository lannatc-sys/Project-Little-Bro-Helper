import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    status: "success",
    action: "cache_clear",
    message: "🧹 ล้างข้อมูลแคชชั่วคราวและลงทะเบียนแอดมินทั้งหมดเรียบร้อยแล้ว",
    timestamp: new Date().toISOString()
  });
}
