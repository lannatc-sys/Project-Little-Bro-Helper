import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";

const registrationFilePath = path.join(process.cwd(), "apps-script", "registration.json");

function readRegistrations() {
  if (!fs.existsSync(registrationFilePath)) {
    return {};
  }
  try {
    const content = fs.readFileSync(registrationFilePath, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Failed to read registration file:", err);
    return {};
  }
}

function writeRegistrations(data: any) {
  try {
    const dir = path.dirname(registrationFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(registrationFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to write registration file:", err);
  }
}

// 1. Polling access endpoint
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const platformId = searchParams.get("platform_id");

  if (!email && !platformId) {
    return NextResponse.json({ status: "error", message: "Missing email or platform_id parameter" }, { status: 400 });
  }

  // 1. Check by platform_id (e.g. Telegram chat ID or LINE user ID)
  if (platformId) {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", platformId)
        .maybeSingle();

      if (!error && profile) {
        return NextResponse.json({
          status: "approved",
          spreadsheet_id: profile.user_id || "",
          google_email: profile.google_email || "",
          folder_id: ""
        });
      }
    } catch (err) {
      console.error("Supabase profile check by platformId error:", err);
    }
  }

  // 2. Check by email (e.g. during onboarding polling)
  if (email) {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("google_email", email)
        .maybeSingle();

      if (!error && profile) {
        return NextResponse.json({
          status: "approved",
          spreadsheet_id: profile.user_id || "",
          google_email: profile.google_email || "",
          folder_id: ""
        });
      }
    } catch (err) {
      console.error("Supabase profile check by email error:", err);
    }

    // Fallback to local registrations cache for email polling
    const data = readRegistrations();
    const reg = data[email];

    if (reg) {
      return NextResponse.json({
        status: reg.status,
        spreadsheet_id: reg.spreadsheet_id || "",
        folder_id: reg.folder_id || ""
      });
    }
  }

  // Fallback default response for multi-account onboarding
  return NextResponse.json({
    status: "approved",
    spreadsheet_id: "1jANLkV4IxXa3mybLPTs7L1RoHtfik7lVLtTlB0Ay1X8",
    folder_id: ""
  });
}

// 2. Submit access request endpoint (Auto-Approve Multi-Account Support)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, telegram_chat_id } = body;

    if (!email || !username) {
      return NextResponse.json({ status: "error", message: "Missing email or username" }, { status: 400 });
    }

    const effectiveUserId = telegram_chat_id || "5581598534";
    const data = readRegistrations();

    // Generate or retrieve spreadsheet ID for multi-account
    const spreadsheetId = data[email]?.spreadsheet_id || "1jANLkV4IxXa3mybLPTs7L1RoHtfik7lVLtTlB0Ay1X8";

    // Auto-approve and register multi-account
    data[email] = {
      status: "approved",
      username,
      telegram_chat_id: effectiveUserId,
      timestamp: Date.now(),
      spreadsheet_id: spreadsheetId,
      folder_id: ""
    };

    writeRegistrations(data);

    // Upsert user profile into Supabase safely
    try {
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: effectiveUserId,
          google_email: email,
          username: username,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      );
      if (error) console.error("Supabase profile upsert error:", error.message);
    } catch (e) {
      console.error("Supabase upsert exception for multi-account:", e);
    }

    // Notify Telegram Admin about new account switch/registration
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = "5581598534";

    if (token) {
      const escapedUsername = (username || "User").replace(/[_*`[\]()]/g, "\\$&");
      const escapedEmail = (email || "").replace(/[_*`[\]()]/g, "\\$&");
      const message = `🟢 *เข้าใช้งานสำเร็จด้วยบัญชีใหม่*\n\n*ชื่อผู้ใช้*: ${escapedUsername}\n*อีเมล Google*: ${escapedEmail}\n*Chat ID*: ${effectiveUserId}\n\nระบบเปิดสิทธิ์รองรับการใช้งานหลายบัญชีเรียบร้อยแล้ว ✨`;

      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: message,
          parse_mode: "Markdown"
        })
      }).catch(err => console.error("Telegram admin notify error:", err));
    }

    return NextResponse.json({
      status: "approved",
      spreadsheet_id: spreadsheetId,
      folder_id: ""
    });

  } catch (error: any) {
    console.error("Error in onboarding registration API:", error);
    return NextResponse.json({ status: "approved", spreadsheet_id: "1jANLkV4IxXa3mybLPTs7L1RoHtfik7lVLtTlB0Ay1X8" });
  }
}

// 3. Delete registration endpoint (Reset/Wipe Cache)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ status: "error", message: "Missing email parameter" }, { status: 400 });
    }

    // Wipe from Supabase
    try {
      await supabase.from("profiles").delete().eq("google_email", email);
    } catch (err) {
      console.error("Failed to delete profile from Supabase:", err);
    }

    const data = readRegistrations();
    if (data[email]) {
      delete data[email];
      writeRegistrations(data);
      return NextResponse.json({ status: "success", message: `Registration for ${email} wiped successfully.` });
    }

    return NextResponse.json({ status: "none", message: "No registration found to delete." });

  } catch (error: any) {
    console.error("Error in deleting registration API:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
