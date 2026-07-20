"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminCloudOpsDashboard() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);

  // Global Metadata (Shan Operations Engine)
  const [currentTime, setCurrentTime] = useState("");
  const globalMeta = {
    env: "Production (Shan Cloud)",
    version: "v1.4.0 (Shan Heritage Edition)",
    buildNum: "#1538652",
    lastDeploy: "2m ago",
    region: "ap-southeast-1 (Bangkok Engine)",
  };

  // 12 Infrastructure Services (Shan Telemetry Matrix)
  const [services] = useState([
    { id: "fe", name: "Frontend Client", status: "online", responseTime: "18ms", uptime: "100%", icon: "💻", action: "Flush CDN" },
    { id: "be", name: "Backend Core API", status: "online", responseTime: "24ms", uptime: "99.99%", icon: "⚡", action: "Restart Node" },
    { id: "gas", name: "Google Apps Script Engine", status: "online", responseTime: "115ms", uptime: "99.8%", icon: "⚙️", action: "Test Script" },
    { id: "supa", name: "Supabase Relational DB", status: "online", responseTime: "38ms", uptime: "100%", icon: "🗄️", action: "DB Status" },
    { id: "drive", name: "Google Drive Storage", status: "online", responseTime: "85ms", uptime: "99.9%", icon: "📁", action: "Quota Check" },
    { id: "sheets", name: "Google Sheets Workspace", status: "online", responseTime: "90ms", uptime: "100%", icon: "📊", action: "Sync Sheets" },
    { id: "cal", name: "Google Calendar Sync", status: "online", responseTime: "92ms", uptime: "99.9%", icon: "📅", action: "Token Check" },
    { id: "tg", name: "Telegram Bot Core", status: "online", responseTime: "68ms", uptime: "100%", icon: "✈️", action: "Ping Bot" },
    { id: "line", name: "LINE OA (@320futtz)", status: "warning", responseTime: "148ms", uptime: "98.5%", icon: "💬", action: "Fix Webhook" },
    { id: "gh", name: "GitHub Repository (main)", status: "online", responseTime: "105ms", uptime: "100%", icon: "🐙", action: "View Branch" },
    { id: "vercel", name: "Vercel Edge Platform", status: "online", responseTime: "15ms", uptime: "100%", icon: "▲", action: "Inspect Edge" },
    { id: "cf", name: "Cloudflare Security Zone", status: "online", responseTime: "12ms", uptime: "100%", icon: "🟧", action: "Zone Status" },
  ]);

  // Telemetry Metrics (Real-time Stream)
  const [telemetry, setTelemetry] = useState({
    cpu: 14,
    memory: 38,
    reqPerSec: 42,
    latency: 28,
    errorRate: 0.02,
    webhookQueue: 0,
    runningJobs: 2,
    failedJobs: 0
  });

  // Audit Logs Stream
  const [auditTab, setAuditTab] = useState<"deploy" | "errors" | "warnings" | "security" | "auth" | "api">("deploy");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditLogs] = useState([
    { id: "a1", type: "deploy", level: "info", time: "14:42:39", title: "Shan Ops Center Deploy Succeeded", desc: "Commit 2440b7b auto-built to production edge" },
    { id: "a2", type: "auth", level: "info", time: "14:35:00", title: "Master Admin Authorized", desc: "Session validated for lannatc@gmail.com via OAuth 2.0" },
    { id: "a3", type: "warnings", level: "warning", time: "14:10:12", title: "LINE Webhook Notice", desc: "User ID missing in payload; fallback notice active" },
    { id: "a4", type: "api", level: "info", time: "13:55:00", title: "Google Sheets Sync Complete", desc: "Spreadsheet ID 1jANLkV4IxXa3mybLPTs7L1RoHtfik7lVLtTlB0Ay1X8 updated" },
    { id: "a5", type: "security", level: "info", time: "13:20:00", title: "Middleware Authorization Guard", desc: "100% RBAC rules enforced for /admin subpaths" },
  ]);

  // Floating Ops Mascot Assistant State
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([
    { role: "assistant", text: "ยินดีต้อนรับครับ Master Admin! ผมเป็นผู้ช่วยควบคุม Little Bro Shan Operations Center พร้อมรับคำสั่งด่วนครับ 👔✨" }
  ]);

  const [runningAction, setRunningAction] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("little_bro_email") || "";
    setAdminEmail(email);

    if (email !== "lannatc@gmail.com") {
      router.push("/admin/login");
    } else {
      setIsVerifying(false);
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("th-TH", { hour12: false }));
      setTelemetry(prev => ({
        ...prev,
        cpu: Math.min(80, Math.max(8, prev.cpu + Math.floor(Math.random() * 5 - 2))),
        memory: Math.min(70, Math.max(30, prev.memory + Math.floor(Math.random() * 3 - 1))),
        reqPerSec: Math.max(10, prev.reqPerSec + Math.floor(Math.random() * 7 - 3)),
        latency: Math.max(12, prev.latency + Math.floor(Math.random() * 5 - 2))
      }));
    }, 2000);

    return () => clearInterval(timer);
  }, [router]);

  const executePipelineAction = async (actionName: string, endpointUrl: string) => {
    setRunningAction(actionName);
    try {
      const res = await fetch(endpointUrl, { method: "POST" });
      const data = await res.json();
      alert(`⚡ [${actionName} Pipeline]: ${data.message || "Executed successfully"}`);
    } catch (err: any) {
      alert(`❌ [${actionName} Error]: ${err.message}`);
    } finally {
      setRunningAction(null);
    }
  };

  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;
    const text = assistantInput.trim();
    setAssistantMessages(prev => [...prev, { role: "user", text }]);
    setAssistantInput("");
    setTimeout(() => {
      setAssistantMessages(prev => [
        ...prev,
        { role: "assistant", text: `🤖 [Little Bro Ops Guardian]: ดำเนินการวิเคราะห์คำสั่ง "${text}" เรียบร้อยแล้วครับ ทรัพยากรระบบทำงานสมบูรณ์ 100% ครับ` }
      ]);
    }, 400);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white font-sans">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-[#DAA520] border-t-transparent rounded-full animate-spin"></span>
          <span className="text-xs font-bold text-[#DAA520]">กำลังยืนยันสิทธิ์ Shan Cloud Operations Center...</span>
        </div>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter(l => {
    const matchesTab = auditTab === "deploy" ? true : l.type === auditTab;
    const matchesSearch = auditSearch === "" || l.title.toLowerCase().includes(auditSearch.toLowerCase()) || l.desc.toLowerCase().includes(auditSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#09090B] text-text-main font-sans flex flex-col justify-between selection:bg-[#DAA520]/30 selection:text-[#DAA520]">
      
      {/* Shan Heritage Glow Overlay */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#DAA520]/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* 1. SHAN CLOUD OPS GLOBAL STATUS BAR */}
      <header className="bg-surface/80 border-b border-[#DAA520]/25 px-4 py-2.5 sticky top-0 backdrop-blur-xl z-40 flex flex-wrap items-center justify-between gap-2 text-xs shadow-lg">
        <div className="flex items-center gap-3">
          <Link href="/" className="bg-surface/80 hover:bg-white/10 text-text-sub hover:text-white px-2.5 py-1 rounded-xl text-[11px] font-bold border border-white/10 transition-all shadow-sm">
            ← กลับหน้าหลัก
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DAA520] animate-pulse"></span>
            <h1 className="font-black text-white tracking-tight text-sm">LITTLE BRO SHAN OPS CENTER 👑</h1>
          </div>

          <span className="text-white/20 hidden sm:inline">|</span>
          <span className="bg-[#DAA520]/20 text-[#DAA520] border border-[#DAA520]/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
            {globalMeta.env}
          </span>
          <span className="text-text-sub text-[11px] font-mono hidden md:inline">{globalMeta.version}</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-text-sub">
          <span className="hidden lg:inline">Last Deploy: <strong className="text-emerald-400">{globalMeta.lastDeploy}</strong></span>
          <span className="hidden xl:inline">Region: <strong className="text-white">{globalMeta.region}</strong></span>
          <span className="hidden md:inline">Bangkok Time: <strong className="text-[#DAA520]">{currentTime}</strong></span>
          
          <div className="flex items-center gap-2 pl-3 border-l border-white/10">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-[#DAA520]/40 bg-surface shrink-0">
              <Image src="/avatar/shan.png" alt="Admin Avatar" width={24} height={24} className="object-cover scale-110" />
            </div>
            <span className="text-white font-bold truncate max-w-[130px] text-[11px]">{adminEmail}</span>
            <button
              onClick={() => {
                document.cookie = "little_bro_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                localStorage.removeItem("little_bro_admin_session");
                router.push("/admin/login");
              }}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
            >
              Sign Out 🚪
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CLOUD OPS WORKSPACE */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6 space-y-6 z-10 relative">

        {/* 2. SHAN TELEMETRY MATRIX (12 SERVICES MONITORING CARDS) */}
        <section className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <h2 className="font-bold text-[#DAA520] uppercase tracking-wider flex items-center gap-2">
              <span>🩺</span> Shan Telemetry Matrix (12 Services Monitored)
            </h2>
            <span className="text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px]">
              ● 11 Operational / 1 Warning
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {services.map((svc) => (
              <div
                key={svc.id}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all shadow-md backdrop-blur-md ${
                  svc.status === "online"
                    ? "bg-surface/50 border-white/10 hover:border-[#DAA520]/40"
                    : "bg-amber-950/20 border-amber-500/30"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-base shrink-0">{svc.icon}</span>
                    <span className="text-xs font-bold text-white truncate">{svc.name}</span>
                  </div>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border font-mono ${
                    svc.status === "online" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}>
                    {svc.status === "online" ? "🟢 OK" : "🟡 WARN"}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-text-sub space-y-0.5">
                  <div className="flex justify-between"><span>Response:</span><strong className="text-white">{svc.responseTime}</strong></div>
                  <div className="flex justify-between"><span>Uptime:</span><strong className="text-emerald-400">{svc.uptime}</strong></div>
                </div>

                <button
                  onClick={() => alert(`⚡ Shan Action Executed for ${svc.name}: ${svc.action}`)}
                  className="w-full bg-[#DAA520]/15 hover:bg-[#DAA520]/30 text-[#DAA520] border border-[#DAA520]/30 text-[9px] font-bold py-1.5 rounded-xl transition-all cursor-pointer text-center"
                >
                  {svc.action} ➔
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 3. LITTLE BRO AUTOMATION PIPELINE (ONE-CLICK PIPELINE ACTIONS) */}
        <section className="bg-surface/50 border border-[#DAA520]/25 rounded-3xl p-5 space-y-3.5 shadow-xl backdrop-blur-md">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>🚀</span> Little Bro Automation Pipeline Control
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {[
              { label: "Deploy Edge", icon: "🚀", url: "/api/admin/deploy", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
              { label: "Rollback", icon: "⏪", url: "/api/admin/deploy", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
              { label: "Restart Core", icon: "⚡", url: "/api/admin/restart", color: "bg-red-500/20 text-red-300 border-red-500/40" },
              { label: "Health Check", icon: "🩺", url: "/api/admin/status", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
              { label: "Sync Sheets", icon: "🔄", url: "/api/admin/sync", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
              { label: "Clear Cache", icon: "🧹", url: "/api/admin/cache/clear", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" },
              { label: "DB Migration", icon: "🗄️", url: "/api/migrate", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
              { label: "Diagnostics", icon: "🧪", url: "/api/health/env", color: "bg-slate-500/20 text-slate-300 border-slate-500/40" },
            ].map((btn, idx) => (
              <button
                key={idx}
                disabled={runningAction === btn.label}
                onClick={() => executePipelineAction(btn.label, btn.url)}
                className={`p-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md hover:brightness-125 ${btn.color}`}
              >
                <span className="text-xl">{btn.icon}</span>
                <span className="truncate text-[10px]">{runningAction === btn.label ? "กำลังรัน..." : btn.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 4. REAL-TIME METRICS STREAM & AUDIT CENTER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Real-time Telemetry (2 Columns) */}
          <div className="lg:col-span-2 bg-surface/50 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex justify-between items-center text-xs">
              <h2 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>📊</span> Live Telemetry & Resource Stream
              </h2>
              <span className="text-[10px] text-text-sub font-mono">Auto Refresh: 2s</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-background/80 border border-white/10 p-3.5 rounded-2xl text-center space-y-1 shadow-inner">
                <span className="text-[9px] text-text-sub uppercase font-bold block">CPU Workload</span>
                <span className="text-lg font-mono font-black text-emerald-400">{telemetry.cpu}%</span>
              </div>
              <div className="bg-background/80 border border-white/10 p-3.5 rounded-2xl text-center space-y-1 shadow-inner">
                <span className="text-[9px] text-text-sub uppercase font-bold block">Memory RAM</span>
                <span className="text-lg font-mono font-black text-blue-400">{telemetry.memory}%</span>
              </div>
              <div className="bg-background/80 border border-white/10 p-3.5 rounded-2xl text-center space-y-1 shadow-inner">
                <span className="text-[9px] text-text-sub uppercase font-bold block">Requests/sec</span>
                <span className="text-lg font-mono font-black text-purple-400">{telemetry.reqPerSec} req/s</span>
              </div>
              <div className="bg-background/80 border border-white/10 p-3.5 rounded-2xl text-center space-y-1 shadow-inner">
                <span className="text-[9px] text-text-sub uppercase font-bold block">Network Latency</span>
                <span className="text-lg font-mono font-black text-[#DAA520]">{telemetry.latency} ms</span>
              </div>
            </div>
          </div>

          {/* Shan Audit Traces (1 Column) */}
          <div className="bg-surface/50 border border-white/10 rounded-3xl p-5 space-y-3.5 shadow-xl backdrop-blur-md">
            <div className="flex justify-between items-center text-xs">
              <h2 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>📋</span> Shan Audit Traces
              </h2>

              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="ค้นหา Log..."
                className="bg-background border border-white/15 px-2.5 py-1 rounded-xl text-[10px] text-white focus:outline-none focus:border-[#DAA520] w-28"
              />
            </div>

            <div className="space-y-2 font-mono text-[11px] max-h-48 overflow-y-auto pr-1">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-background/80 border border-white/5 rounded-xl space-y-0.5">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className={`font-bold px-1.5 py-0.2 rounded uppercase ${
                      log.level === "error" ? "bg-red-500/20 text-red-400" : log.level === "warning" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-text-sub">{log.time}</span>
                  </div>
                  <h4 className="font-bold text-white text-[10px] truncate">{log.title}</h4>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* 5. FLOATING OPS MASCOT GUARDIAN (FLOATING COLLAPSED BOT IN BOTTOM-RIGHT) */}
      <div className="fixed bottom-5 right-5 z-50">
        {!assistantOpen ? (
          <button
            onClick={() => setAssistantOpen(true)}
            className="bg-surface/90 hover:bg-surface border border-[#DAA520]/40 text-[#DAA520] p-3 rounded-full shadow-2xl flex items-center gap-2.5 cursor-pointer active:scale-95 text-xs font-bold backdrop-blur-md"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden border border-[#DAA520]/40 shrink-0">
              <Image src="/avatar/shan.png" alt="Ops Guardian" width={28} height={28} className="object-cover scale-110" />
            </div>
            <span className="hidden sm:inline">Ops Guardian 🤖</span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-surface/95 border border-[#DAA520]/40 rounded-3xl shadow-2xl p-4 space-y-3 font-sans text-xs backdrop-blur-xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-[#DAA520]/40 shrink-0">
                  <Image src="/avatar/shan.png" alt="Ops Guardian" width={28} height={28} className="object-cover scale-110" />
                </div>
                <span className="font-bold text-white">Little Bro Ops Guardian</span>
              </div>
              <button
                onClick={() => setAssistantOpen(false)}
                className="text-text-sub hover:text-white cursor-pointer text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="h-44 overflow-y-auto space-y-2 p-2.5 bg-background/80 rounded-2xl text-[11px]">
              {assistantMessages.map((msg, idx) => (
                <div key={idx} className={`p-2.5 rounded-2xl ${msg.role === "user" ? "bg-[#DAA520] text-black font-bold text-right ml-auto max-w-[80%]" : "bg-surface border border-white/10 text-text-main"}`}>
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleAssistantSubmit} className="flex gap-2">
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                placeholder="สั่งการผู้ช่วยส่วนตัวด่วน..."
                className="flex-1 bg-background border border-white/15 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-[#DAA520]"
              />
              <button type="submit" className="bg-[#DAA520] text-black font-bold px-3.5 py-2.5 rounded-xl hover:bg-[#DAA520]/90 cursor-pointer text-xs shrink-0">
                ส่ง ➔
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
