import { NextResponse } from "next/server";

/**
 * E-SLIP ROUTE STUB
 * The complete implementation logic has been archived to:
 * `src/archive/e-slip/e-slip-backup.ts.disabled`
 */
export async function POST() {
  return NextResponse.json(
    {
      status: "disabled",
      message: "ระบบ E-Slip ถูกแยกออกไปเก็บไว้ใน archive เรียบร้อยแล้วครับ (Disabled)"
    },
    { status: 503 }
  );
}
