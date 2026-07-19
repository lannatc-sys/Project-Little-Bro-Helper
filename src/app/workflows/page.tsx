"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function WorkflowsScreen() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_settings" })
      });
      const data = await res.json();
      if (data.status === "success" && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleWorkflow = async (key: string, currentValue: string) => {
    const newValue = currentValue === "active" ? "inactive" : "active";
    setSavingKey(key);
    setMessage("");

    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_settings",
          setting_key: key,
          setting_value: newValue
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setSettings(prev => ({ ...prev, [key]: newValue }));
        setMessage("✅ บันทึกการตั้งค่าเวิร์กโฟลว์สำเร็จ!");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (err: any) {
      setMessage("❌ บันทึกการตั้งค่าล้มเหลว: " + err.message);
    } finally {
      setSavingKey(null);
    }
  };

  const workflowItems = [
    {
      key: "workflow_daily_finance_summary",
      title: "📊 สรุปยอดการเงินประจำวัน",
      description: "ประมวลผลยอดเงินรายรับ-รายจ่ายทั้งหมด และส่งรายงานสรุปเข้า Telegram ของบอสทุกเช้าเวลา 09:00 น.",
      badge: "Telegram Push"
    },
    {
      key: "workflow_weekly_backup",
      title: "💾 สำรองฐานข้อมูลอัตโนมัติรายสัปดาห์",
      description: "สั่งโคลนคัดลอกไฟล์ Google Sheets ทั้งใบ เพื่อแอบแบ็กอัปเก็บลงโฟลเดอร์ Google Drive ทุกคืนวันอาทิตย์",
      badge: "Google Drive"
    },
    {
      key: "workflow_high_expense_alert",
      title: "🚨 แจ้งเตือนเมื่อค่าใช้จ่ายเกินตัว",
      description: "ยิงสัญญาณแจ้งเตือนเข้าช่อง Telegram ทันทีหากมีการทำธุรกรรมสั่งจ่ายรายการเงินมูลค่าเกิน 10,000 บาท",
      badge: "Instant Trigger"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* Header link */}
        <header className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm text-text-sub hover:text-text-main transition-colors flex items-center gap-1">
            <span>←</span> กลับหน้าหลัก
          </Link>
        </header>

        <h2 className="text-xl font-bold mb-2 text-center text-text-main">
          ⚙️ ระบบรันสูตรทำงานอัตโนมัติ (Workflows)
        </h2>
        <p className="text-[10px] text-text-sub text-center mb-8">
          เปิด-ปิดสูตรคำสั่ง Hard-coded เพื่อรัน Trigger ข้อมูลลงแผ่นงานและคลาวด์อัตโนมัติ
        </p>

        {message && (
          <div className="mb-4 p-3 bg-surface/40 border border-white/5 text-[10px] rounded-2xl text-center text-text-main">
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-xs text-text-sub">
            กำลังดาวน์โหลดการตั้งค่าคิวเวิร์กโฟลว์...
          </div>
        ) : (
          <div className="space-y-4">
            {workflowItems.map((wf) => {
              const isActive = settings[wf.key] === "active";
              const isSaving = savingKey === wf.key;

              return (
                <div 
                  key={wf.key}
                  className="p-4 bg-surface/30 border border-white/5 rounded-2xl space-y-3.5 shadow-sm flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold bg-[#5B5CEB]/10 text-[#5B5CEB] border border-[#5B5CEB]/20 px-2 py-0.5 rounded-full">
                        {wf.badge}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-text-main mt-1">{wf.title}</h4>
                    <p className="text-[10px] text-text-sub leading-relaxed">{wf.description}</p>
                  </div>

                  <div className="flex items-center justify-center pt-2">
                    <button
                      onClick={() => handleToggleWorkflow(wf.key, settings[wf.key])}
                      disabled={isSaving}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isActive ? "bg-[#10B981]" : "bg-white/15"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer className="mt-8 text-center text-[10px] text-text-sub/40">
        <p>Little Bro Helper v1.0.0 • Antigravity Product Team</p>
      </footer>
    </div>
  );
}
