import { NextResponse } from "next/server";
import { validateEnvironmentVariables } from "@/lib/env-checker";

export async function GET() {
  try {
    const report = validateEnvironmentVariables();
    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      report
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to perform environment diagnostic check: " + err.message
      },
      { status: 500 }
    );
  }
}
