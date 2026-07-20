import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_BACKEND_GAS_URL;
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    // Background sync function to Google Sheets (GAS)
    const syncToGAS = (payload: any) => {
      const targetSpreadsheetId = payload.spreadsheet_id || spreadsheetId;
      if (appsScriptUrl && !appsScriptUrl.includes("placeholder")) {
        fetch(appsScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, spreadsheet_id: targetSpreadsheetId })
        }).catch(err => console.error("GAS sync background error:", err));
      }
    };

    // 1. GET DASHBOARD DATA (Dual-Sync: Supabase + Google Sheets Fallback)
    if (action === "get_dashboard_data") {
      let financeData: any[] = [];
      let tasksData: any[] = [];
      let calendarData: any[] = [];
      let settingsData: any[] = [];
      let profilesData: any[] = [];

      try {
        const [financeRes, tasksRes, calendarRes, settingsRes, profilesRes] = await Promise.all([
          supabase.from("finance").select("*").order("timestamp", { ascending: false }),
          supabase.from("tasks").select("*").order("task_id", { ascending: false }),
          supabase.from("calendar_events").select("*").order("start_time", { ascending: true }),
          supabase.from("settings").select("*"),
          supabase.from("profiles").select("*")
        ]);

        financeData = financeRes.data || [];
        tasksData = tasksRes.data || [];
        calendarData = calendarRes.data || [];
        settingsData = settingsRes.data || [];
        profilesData = profilesRes.data || [];
      } catch (err) {
        console.error("Supabase query error:", err);
      }

      // If Supabase is empty or missing data, auto-sync from Google Sheets (GAS)
      if (appsScriptUrl && !appsScriptUrl.includes("placeholder") && (financeData.length === 0 || tasksData.length === 0)) {
        try {
          const gasRes = await fetch(appsScriptUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "get_dashboard_data",
              spreadsheet_id: body.spreadsheet_id || spreadsheetId
            })
          });
          const gasResult = await gasRes.json();
          if (gasResult.status === "success" && gasResult.data) {
            const gasData = gasResult.data;
            const gasFinance = gasData.finance || [];
            const gasTasks = gasData.tasks || [];
            const gasCalendar = gasData.calendar || [];

            // Auto-populate Supabase if Supabase was empty
            if (financeData.length === 0 && gasFinance.length > 0) {
              financeData = gasFinance;
              const financeInserts = gasFinance.map((f: any) => ({
                transaction_type: f.transaction_type || "Expense",
                category: f.category || "อื่นๆ",
                amount: Number(f.amount) || 0,
                description: f.description || "",
                file_attachment_url: f.file_attachment_url || "",
                timestamp: f.timestamp ? new Date(f.timestamp).toISOString() : new Date().toISOString()
              }));
              supabase.from("finance").insert(financeInserts).then();
            }

            if (tasksData.length === 0 && gasTasks.length > 0) {
              tasksData = gasTasks;
              const taskInserts = gasTasks.map((t: any) => ({
                task_id: t.task_id || ("TASK_" + Date.now()),
                task_name: t.task_name || "Untitled Task",
                details: t.details || "",
                status: t.status || "Pending",
                due_date: t.due_date || "",
                reminder_time: t.reminder_time || "",
                google_task_id: t.google_task_id || ""
              }));
              supabase.from("tasks").insert(taskInserts).then();
            }

            if (calendarData.length === 0 && gasCalendar.length > 0) {
              calendarData = gasCalendar;
              const calendarInserts = gasCalendar.map((c: any) => ({
                event_id: c.event_id || ("EVT_" + Date.now()),
                event_title: c.event_title || "Untitled Event",
                start_time: c.start_time || "",
                end_time: c.end_time || "",
                location: c.location || "",
                notes: c.notes || ""
              }));
              supabase.from("calendar_events").insert(calendarInserts).then();
            }
          }
        } catch (gasErr) {
          console.error("GAS fallback error:", gasErr);
        }
      }

      return NextResponse.json({
        status: "success",
        data: {
          finance: financeData,
          tasks: tasksData,
          calendar: calendarData,
          settings: settingsData,
          profiles: profilesData
        }
      });
    }

    // 2. ADD TRANSACTION (Income or Expense)
    if (action === "add_expense" || action === "add_income") {
      const txType = action === "add_income" ? "Income" : "Expense";
      const { data, error } = await supabase.from("finance").insert({
        transaction_type: txType,
        category: body.category || "อื่นๆ",
        amount: Number(body.amount),
        description: body.description || "",
        file_attachment_url: body.file_attachment_url || "",
        timestamp: new Date().toISOString()
      }).select();

      if (error) throw new Error(error.message);

      // Trigger background sync to Google Sheets
      syncToGAS({ ...body, spreadsheet_id: spreadsheetId });

      return NextResponse.json({
        status: "success",
        message: "บันทึกธุรกรรมเรียบร้อยครับ",
        data: data?.[0]
      });
    }

    // 3. DELETE TRANSACTION
    if (action === "delete_expense") {
      let query = supabase.from("finance").delete();
      
      if (body.id) {
        query = query.eq("id", body.id);
      } else {
        query = query
          .eq("transaction_type", body.transaction_type)
          .eq("category", body.category)
          .eq("amount", Number(body.amount));
        
        if (body.description) {
          query = query.eq("description", body.description);
        }
      }

      const { error } = await query;
      if (error) throw new Error(error.message);

      // Trigger background sync to Google Sheets
      syncToGAS({ ...body, spreadsheet_id: spreadsheetId });

      return NextResponse.json({
        status: "success",
        message: "ลบรายการธุรกรรมเรียบร้อยครับ"
      });
    }

    // 4. ADD TASK
    if (action === "add_task") {
      const taskId = "TASK_" + Date.now();
      const { data, error } = await supabase.from("tasks").insert({
        task_id: taskId,
        task_name: body.task_name || "Untitled Task",
        details: body.details || "",
        status: body.status || "Pending",
        due_date: body.due_date || "",
        reminder_time: body.reminder_time || "",
        google_task_id: ""
      }).select();

      if (error) throw new Error(error.message);

      // Trigger background sync to Google Sheets and Google Tasks API
      syncToGAS({ ...body, spreadsheet_id: spreadsheetId, task_id: taskId });

      return NextResponse.json({
        status: "success",
        message: "เพิ่มภารกิจใหม่สำเร็จ",
        data: data?.[0]
      });
    }

    // 5. UPDATE TASK STATUS
    if (action === "update_task_status") {
      const { error } = await supabase.from("tasks")
        .update({ status: body.status })
        .eq("task_id", body.task_id);

      if (error) throw new Error(error.message);

      // Trigger background sync
      syncToGAS({ ...body, spreadsheet_id: spreadsheetId });

      return NextResponse.json({
        status: "success",
        message: "อัปเดตสถานะภารกิจสำเร็จ"
      });
    }

    // 6. ADD EVENT
    if (action === "add_event") {
      const eventId = "EVT_" + Date.now();
      const { data, error } = await supabase.from("calendar_events").insert({
        event_id: eventId,
        event_title: body.event_title || "Untitled Event",
        start_time: body.start_time || "",
        end_time: body.end_iso || body.end_time || "",
        location: body.location || "",
        notes: body.notes || ""
      }).select();

      if (error) throw new Error(error.message);

      // Trigger background sync
      syncToGAS({ ...body, spreadsheet_id: spreadsheetId });

      return NextResponse.json({
        status: "success",
        message: "บันทึกนัดหมายสำเร็จ",
        data: data?.[0]
      });
    }

    // 7. RUN FINANCIAL HEALTH REPORT
    if (action === "run_financial_health_report") {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const { data: txs, error } = await supabase.from("finance").select("*");
      if (error) throw new Error(error.message);

      let totalIncome = 0;
      let totalSaving = 0;
      let totalDebt = 0;

      txs?.forEach((item: any) => {
        const date = new Date(item.timestamp);
        if (!isNaN(date.getTime()) && date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          const amt = Number(item.amount) || 0;
          if (item.transaction_type === "Income") {
            totalIncome += amt;
          } else if (item.transaction_type === "Expense") {
            const cat = (item.category || "").toString();
            const desc = (item.description || "").toString();
            
            const isSaving = cat.includes("ออม") || cat.includes("ลงทุน") || desc.includes("ออม") || desc.includes("ลงทุน");
            const isDebt = cat.includes("หนี้") || cat.includes("ผ่อน") || cat.includes("กู้") || desc.includes("หนี้") || desc.includes("ผ่อน");

            if (isSaving) {
              totalSaving += amt;
            } else if (isDebt) {
              totalDebt += amt;
            }
          }
        }
      });

      if (appsScriptUrl && !appsScriptUrl.includes("placeholder")) {
        const response = await fetch(appsScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "run_financial_health_report",
            spreadsheet_id: spreadsheetId
          })
        });
        const result = await response.json();
        return NextResponse.json(result);
      }

      return NextResponse.json({
        status: "success",
        message: "วิเคราะห์ข้อมูลเรียบร้อย (ระบบจำลองส่งแจ้งเตือน)"
      });
    }

    if (appsScriptUrl && !appsScriptUrl.includes("placeholder")) {
      const payload = {
        spreadsheet_id: body.spreadsheet_id || spreadsheetId,
        ...body
      };
      const response = await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      return NextResponse.json(result);
    }

    return NextResponse.json({ status: "error", message: `Action '${action}' not supported in fallback.` });

  } catch (error: any) {
    console.error("Error in /api/expense:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
