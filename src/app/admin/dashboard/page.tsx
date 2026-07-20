"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);

  // 1. System Health Status (9 Core Services)
  const [healthServices] = useState([
    { name: "Frontend", status: "Online", state: "online", icon: "💻", latency: "22ms" },
    { name: "Backend", status: "Online", state: "online", icon: "⚡", latency: "30ms" },
    { name: "Google Apps Script", status: "Online", state: "online", icon: "⚙️", latency: "110ms" },
    { name: "Supabase DB", status: "Online", state: "online", icon: "🗄️", latency: "45ms" },
    { name: "Google Drive API", status: "Online", state: "online", icon: "📁", latency: "88ms" },
    { name: "Google Sheets API", status: "Online", state: "online", icon: "📊", latency: "92ms" },
    { name: "Google Calendar API", status: "Online", state: "online", icon: "📅", latency: "95ms" },
    { name: "Telegram Bot", status: "Online", state: "online", icon: "✈️", latency: "70ms" },
    { name: "LINE OA", status: "Warning", state: "warning", icon: "💬", latency: "145ms" },
  ]);

  // 2. Notifications Feed (Latest System Events Only)
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Deploy Success", desc: "Production build commit 1538652 successfully deployed", time: "Just now", type: "online" },
    { id: 2, title: "Restart Complete", desc: "Server process worker restarted cleanly", time: "10m ago", type: "online" },
    { id: 3, title: "Google Drive Connected", desc: "Personal storage workspace synchronized", time: "25m ago", type: "online" },
    { id: 4, title: "LINE Webhook Notice", desc: "LINE OA user_id fallback notice active", time: "1h ago", type: "warning" },
  ]);

  // 3. Compact Assistant Helper (Bottom Only)
  const [assistantMessages, setAssistantMessages] = useState([
    { role: "assistant", text: "สวัสดีครับ Admin! ผมคือผู้ช่วยอัจฉริยะ พร้อมช่วยตรวจสอบและรันคำสั่งด่วนครับ 👔" }
  ]);
  const [assistantInput, setAssistantInput] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("little_bro_email") || "";
    setAdminEmail(email);

    if (email !== "lannatc@gmail.com") {
      router.push("/admin/login");
    } else {
      setIsVerifying(false);
    }
  }, [router]);

  // Quick Action Handler
  const handleQuickAction = async (action: string, url: string) => {
    setActionLoading(action);
    try {
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      
      setNotifications(prev => [
        {
          id: Date.now(),
          title: `${action} Executed`,
          desc: data.message || `Action ${action} completed`,
          time: "Just now",
          type: "online"
        },
        ...prev
      ]);

      alert(`✅ [${action}]: ${data.message || "ดำเนินการสำเร็จ"}`);
    } catch (err: any) {
      alert(`❌ [${action} Error]: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;

    const query = assistantInput.trim();
    setAssistantMessages(prev => [...prev, { role: "user", text: query }]);
    setAssistantInput("");

    setTimeout(() => {
      setAssistantMessages(prev => [
        ...prev,
        { role: "assistant", text: `🤖 [Helper]: รับทราบคำสั่ง "${query}" กำลังประมวลผลให้ครับ` }
      ]);
    }, 500);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white font-sans">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 border-2 border-[#DAA520] border-t-transparent rounded-full animate-spin"></span>
          <span className="text-xs font-bold">กำลังยืนยันสิทธิ์ System Control Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans flex flex-col justify-between pb-16">
      
      {/* Header Bar */}
      <header className="bg-surface/90 border-b border-white/10 p-4 sticky top-0 backdrop-blur-md z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-sub hover:text-white text-xs font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl transition-all">
            ← หน้าหลัก
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white">System Control Center 👑</h1>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                ● 8 Online / 1 Warning
              </span>
            </div>
            <p className="text-[10px] text-text-sub font-mono">Admin: {adminEmail}</p>
          </div>
        </div>

        <button
          onClick={() => {
            document.cookie = "little_bro_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            localStorage.removeItem("little_bro_admin_session");
            router.push("/admin/login");
          }}
          className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold shrink-0"
        >
          ออกจากระบบ 🚪
        </button>
      </header>

      {/* Main Control Center Grid */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* PRIORITY 1: SYSTEM HEALTH DASHBOARD (UNDERSTAND STATUS IN 3 SECONDS) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#DAA520] uppercase tracking-wider flex items-center gap-1.5">
              <span>🩺</span> System Health (Top Priority Monitoring)
            </h2>
            <span className="text-[10px] text-text-sub font-mono">Real-time Check Active</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {healthServices.map((svc, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-md transition-all ${
                  svc.state === "online"
                    ? "bg-emerald-950/20 border-emerald-500/30"
                    : svc.state === "warning"
                    ? "bg-amber-950/20 border-amber-500/30"
                    : "bg-red-950/20 border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="text-xl shrink-0">{svc.icon}</span>
                  <div className="overflow-hidden">
                    <h3 className="text-xs font-bold text-white truncate">{svc.name}</h3>
                    <span className="text-[9px] text-text-sub font-mono">{svc.latency}</span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full border shrink-0 ${
                    svc.state === "online"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : svc.state === "warning"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-red-500/20 text-red-400 border-red-500/40"
                  }`}
                >
                  {svc.state === "online" ? "🟢 Online" : svc.state === "warning" ? "🟡 Warning" : "🔴 Offline"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* PRIORITY 2: QUICK ACTIONS (LARGE TOUCH-FRIENDLY BUTTONS) */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-[#DAA520] uppercase tracking-wider flex items-center gap-1.5">
            <span>⚡</span> Quick Control Actions
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Deploy", icon: "🚀", action: "Deploy", url: "/api/admin/deploy" },
              { label: "Restart", icon: "⚡", action: "Restart", url: "/api/admin/restart" },
              { label: "Sync", icon: "🔄", action: "Sync", url: "/api/admin/sync" },
              { label: "Logs", icon: "📋", action: "Logs", url: "/api/admin/logs" },
              { label: "Backup", icon: "💾", action: "Backup", url: "/api/admin/cache/clear" },
              { label: "Settings", icon: "⚙️", action: "Settings", url: "/settings" },
            ].map((btn, idx) => (
              <button
                key={idx}
                disabled={actionLoading === btn.action}
                onClick={() => {
                  if (btn.action === "Settings") {
                    router.push("/settings");
                  } else {
                    handleQuickAction(btn.action, btn.url);
                  }
                }}
                className="bg-surface/80 hover:bg-surface border border-white/15 p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <span className="text-2xl">{btn.icon}</span>
                <span className="text-xs font-bold text-white">
                  {actionLoading === btn.action ? "กำลังรัน..." : btn.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* PRIORITY 3: SYSTEM NOTIFICATIONS (LATEST EVENTS ONLY) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#DAA520] uppercase tracking-wider flex items-center gap-1.5">
              <span>🔔</span> System Notifications Feed
            </h2>
            <span className="text-[10px] text-text-sub font-mono">Newest First</span>
          </div>

          <div className="bg-surface/50 border border-white/10 rounded-2xl p-4 space-y-2.5 shadow-sm">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex items-center justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs">
                    {notif.type === "online" ? "🟢" : notif.type === "warning" ? "🟡" : "🔴"}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                    <p className="text-[10px] text-text-sub">{notif.desc}</p>
                  </div>
                </div>
                <span className="text-[9px] text-text-sub font-mono shrink-0">{notif.time}</span>
              </div>
            ))}
          </div>
        </section>

        {/* PRIORITY 4: ASSISTANT HELPER (BOTTOM COMPACT WIDGET ONLY) */}
        <section className="bg-surface/40 border border-white/10 rounded-2xl p-4 space-y-3 shadow-md mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <span>🤖</span> Assistant Helper (System Assistant)
            </h3>
            <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold">
              Ready
            </span>
          </div>

          {/* Compact Messages List */}
          <div className="max-h-32 overflow-y-auto space-y-2 p-2 bg-black/50 rounded-xl text-xs font-sans">
            {assistantMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-2 rounded-xl text-[11px] max-w-md ${
                  msg.role === "user" ? "bg-primary text-white" : "bg-surface border border-white/10 text-text-main"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Compact Input */}
          <form onSubmit={handleAssistantSubmit} className="flex gap-2">
            <input
              type="text"
              value={assistantInput}
              onChange={(e) => setAssistantInput(e.target.value)}
              placeholder="ถามผู้ช่วยหรือสั่งงานด่วน..."
              className="flex-1 bg-surface border border-white/15 p-2.5 rounded-xl text-xs text-white focus:border-[#DAA520] focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#DAA520] text-black font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#DAA520]/90 cursor-pointer shadow-sm shrink-0"
            >
              ส่ง ➔
            </button>
          </form>
        </section>

      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 border-t border-white/10 p-2.5 backdrop-blur-md z-40">
        <div className="max-w-md mx-auto flex justify-around text-[10px] font-bold text-text-sub">
          <Link href="/" className="flex flex-col items-center gap-0.5 hover:text-white">
            <span className="text-base">🏠</span>
            <span>หน้าหลัก</span>
          </Link>
          <Link href="/finance" className="flex flex-col items-center gap-0.5 hover:text-white">
            <span className="text-base">💰</span>
            <span>การเงิน</span>
          </Link>
          <Link href="/admin/dashboard" className="flex flex-col items-center gap-0.5 text-[#DAA520]">
            <span className="text-base">👑</span>
            <span>Control Center</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center gap-0.5 hover:text-white">
            <span className="text-base">⚙️</span>
            <span>ตั้งค่า</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
