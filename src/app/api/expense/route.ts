import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_BACKEND_GAS_URL;

    // หากยังไม่มีการตั้งค่า Apps Script URL จริง ให้ตอบกลับเป็น Mock Response เพื่อการทดสอบ UI
    if (!appsScriptUrl || appsScriptUrl.includes("placeholder")) {
      console.warn("Using mockup response since GOOGLE_APPS_SCRIPT_URL is not set.");
      return NextResponse.json({
        status: "success",
        message: "บันทึกธุรกรรมเรียบร้อย (Mock Mode)",
        mocked: true,
        data: {
          timestamp: new Date().toISOString(),
          transaction_type: body.transaction_type,
          category: body.category,
          amount: Number(body.amount),
          description: body.description
        }
      });
    }

    // เตรียมส่งข้อมูลไปยัง Google Apps Script
    const payload = {
      ...body,
      spreadsheet_id: spreadsheetId
    };

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script returned status ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Error in /api/expense:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
