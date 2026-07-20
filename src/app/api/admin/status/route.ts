import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    frontend: "online",
    backend: "online",
    gas: "online",
    supabase: "online",
    telegram: "online",
    line: "offline"
  });
}
