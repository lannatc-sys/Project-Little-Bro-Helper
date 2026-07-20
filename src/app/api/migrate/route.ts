import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_BACKEND_GAS_URL;
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!appsScriptUrl || appsScriptUrl.includes("placeholder")) {
      return NextResponse.json({ status: "error", message: "Google Apps Script URL is not set" }, { status: 400 });
    }

    // 1. Fetch all data from GAS
    const gasRes = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get_dashboard_data",
        spreadsheet_id: spreadsheetId
      })
    });

    const gasData = await gasRes.json();
    if (gasData.status !== "success" || !gasData.data) {
      return NextResponse.json({ status: "error", message: "Failed to fetch data from Google Sheets: " + gasData.message }, { status: 400 });
    }

    const { finance = [], tasks = [], calendar = [], settings = [], profiles = [] } = gasData.data;

    // 2. Clear existing data in Supabase to prevent duplicates
    await Promise.all([
      supabase.from("finance").delete().neq("transaction_type", "invalid_placeholder"),
      supabase.from("tasks").delete().neq("task_id", "invalid_placeholder"),
      supabase.from("calendar_events").delete().neq("event_id", "invalid_placeholder"),
      supabase.from("profiles").delete().neq("user_id", "invalid_placeholder")
    ]);

    // 3. Migrate Profiles
    if (profiles.length > 0) {
      const profileInserts = profiles.map((p: any) => ({
        user_id: p.user_id || spreadsheetId || "unknown_user",
        telegram_username: p.telegram_username || "",
        google_email: p.google_email || "",
        registered_at: p.registered_at ? new Date(p.registered_at).toISOString() : new Date().toISOString()
      }));
      await supabase.from("profiles").insert(profileInserts);
    } else if (spreadsheetId) {
      await supabase.from("profiles").insert({
        user_id: spreadsheetId,
        telegram_username: "User",
        google_email: "",
        registered_at: new Date().toISOString()
      });
    }

    // 4. Migrate Finance Transactions
    if (finance.length > 0) {
      const financeInserts = finance.map((f: any) => ({
        transaction_type: f.transaction_type || "Expense",
        category: f.category || "อื่นๆ",
        amount: Number(f.amount) || 0,
        description: f.description || "",
        file_attachment_url: f.file_attachment_url || "",
        timestamp: f.timestamp ? new Date(f.timestamp).toISOString() : new Date().toISOString()
      }));
      const { error } = await supabase.from("finance").insert(financeInserts);
      if (error) console.error("Error migrating finance:", error);
    }

    // 5. Migrate Tasks
    if (tasks.length > 0) {
      const taskInserts = tasks.map((t: any) => ({
        task_id: t.task_id || ("TASK_" + Math.random()),
        task_name: t.task_name || "Untitled Task",
        details: t.details || "",
        status: t.status || "Pending",
        due_date: t.due_date || "",
        reminder_time: t.reminder_time || "",
        google_task_id: t.google_task_id || ""
      }));
      const { error } = await supabase.from("tasks").insert(taskInserts);
      if (error) console.error("Error migrating tasks:", error);
    }

    // 6. Migrate Calendar Events
    if (calendar.length > 0) {
      const calendarInserts = calendar.map((c: any) => ({
        event_id: c.event_id || ("EVT_" + Math.random()),
        event_title: c.event_title || "Untitled Event",
        start_time: c.start_time || "",
        end_time: c.end_time || "",
        location: c.location || "",
        notes: c.notes || ""
      }));
      const { error } = await supabase.from("calendar_events").insert(calendarInserts);
      if (error) console.error("Error migrating calendar:", error);
    }

    // 7. Migrate Settings
    if (settings.length > 0) {
      const settingsInserts = settings.map((s: any) => ({
        setting_key: s.setting_key || s[0],
        setting_value: s.setting_value || s[1]
      }));
      await supabase.from("settings").upsert(settingsInserts);
    }

    return NextResponse.json({
      status: "success",
      message: "ย้ายฐานข้อมูลจาก Google Sheets ไปยัง Supabase สำเร็จเรียบร้อยครับพี่! 🎉",
      stats: {
        profiles: profiles.length || 1,
        finance: finance.length,
        tasks: tasks.length,
        calendar: calendar.length,
        settings: settings.length
      }
    });

  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ status: "error", message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
