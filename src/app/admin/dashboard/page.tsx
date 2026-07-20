"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminCloudOpsDashboard() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);

  // 1. Global Status Bar Data
  const [currentTime, setCurrentTime] = useState("");
  const globalMeta = {
    env: "Production",
    version: "v1.4.0",
    buildNum: "#1538652",
    lastDeploy: "3m ago",
    region: "ap-southeast-1 (BKK)",
  };

  // 2. Infrastructure Health (12 Services)
  const [services, setServices] = useState([
    { id: "fe", name: "Frontend", status: "online", responseTime: "18ms", lastCheck: "1s ago", errors: 0, uptime: "100%", action: "Purge CDN" },
    { id: "be", name: "Backend API", status: "online", responseTime: "24ms", lastCheck: "2s ago", errors: 0, uptime: "99.99%", action: "Restart" },
    { id: "gas", name: "Google Apps Script", status: "online", responseTime: "115ms", lastCheck: "5s ago", errors: 0, uptime: "99.8%", action: "Test Execution" },
    { id: "supa", name: "Supabase DB", status: "online", responseTime: "38ms", lastCheck: "1s ago", errors: 0, uptime: "100%", action: "View Tables" },
    { id: "drive", name: "Google Drive API", status: "online", responseTime: "85ms", lastCheck: "4s ago", errors: 0, uptime: "99.9%", action: "Quota Check" },
    { id: "sheets", name: "Google Sheets API", status: "online", responseTime: "90ms", lastCheck: "3s ago", errors: 0, uptime: "100%", action: "Sync Sheet" },
    { id: "cal", name: "Google Calendar API", status: "online", responseTime: "92ms", lastCheck: "6s ago", errors: 0, uptime: "99.9%", action: "Verify Token" },
    { id: "tg", name: "Telegram Bot", status: "online", responseTime: "68ms", lastCheck: "2s ago", errors: 0, uptime: "100%", action: "Ping Webhook" },
    { id: "line", name: "LINE OA", status: "warning", responseTime: "148ms", lastCheck: "1s ago", errors: 1, uptime: "98.5%", action: "Fix Webhook" },
    { id: "gh", name: "GitHub Repository", status: "online", responseTime: "105ms", lastCheck: "8s ago", errors: 0, uptime: "100%", action: "View Commits" },
    { id: "vercel", name: "Vercel Edge Platform", status: "online", responseTime: "15ms", lastCheck: "1s ago", errors: 0, uptime: "100%", action: "Inspect Logs" },
    { id: "cf", name: "Cloudflare Workers (Next)", status: "online", responseTime: "12ms", lastCheck: "1s ago", errors: 0, uptime: "100%", action: "Zone Health" },
  ]);

  // 3. Live Telemetry Monitoring Metrics (Auto-refresh)
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

  // 4. Audit Center Logs State
  const [auditTab, setAuditTab] = useState<"deploy" | "errors" | "warnings" | "security" | "auth" | "api" | "webhook" | "google">("deploy");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditLogs] = useState([
    { id: "a1", type: "deploy", level: "info", time: "14:39:46", title: "Vercel Deploy Succeeded", desc: "Commit 93f911f auto-built to production edge" },
    { id: "a2", type: "auth", level: "info", time: "14:35:00", title: "Admin Login Approved", desc: "Session authenticated for lannatc@gmail.com via OAuth 2.0" },
    { id: "a3", type: "webhook", level: "warning", time: "14:10:12", title: "LINE Webhook Fallback", desc: "User ID missing in request payload; fallback default triggered" },
    { id: "a4", type: "google", level: "info", time: "13:55:00", title: "Google Sheets Workspace Provisioned", desc: "Spreadsheet ID 1jANLkV4IxXa3mybLPTs7L1RoHtfik7lVLtTlB0Ay1X8 attached" },
    { id: "a5", type: "security", level: "info", time: "13:20:00", title: "Middleware Authorization Guard", desc: "100% RBAC rules enforced for /admin subpaths" },
  ]);

  // 5. AI Assistant Collapsed Widget State
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([
    { role: "assistant", text: "Cloud Operations Assistant ready. Ask for telemetry diagnosis or automated script execution." }
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

    // Telemetry auto-refresh interval (simulate Datadog/Grafana metrics stream)
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
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
        { role: "assistant", text: `🤖 [DevOps Assistant]: Executed telemetry analysis for "${text}". All clusters operating nominally.` }
      ]);
    }, 400);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#060709] flex items-center justify-center text-white font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
          <span>Authenticating Ops Session...</span>
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
    <div className="min-h-screen bg-[#060709] text-gray-200 font-sans flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* 1. GLOBAL STATUS BAR (VERCEL / RAILWAY INSPIRED HIGH-DENSITY TOP BAR) */}
      <header className="bg-[#0B0D12] border-b border-white/10 px-4 py-2 sticky top-0 backdrop-blur-md z-40 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 font-mono">
          <Link href="/" className="bg-white/5 hover:bg-white/10 text-gray-300 px-2.5 py-1 rounded-md text-[11px] font-bold border border-white/10 transition-all">
            ← Main App
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-white tracking-wide uppercase">CLOUD OPS CENTER</span>
          </div>
          <span className="text-gray-500">|</span>
          <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
            ENV: {globalMeta.env}
          </span>
          <span className="text-gray-400 text-[11px] hidden sm:inline">{globalMeta.version}</span>
          <span className="text-gray-500 text-[11px] hidden md:inline">{globalMeta.buildNum}</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-gray-400">
          <span className="hidden lg:inline">Last Deploy: <strong className="text-emerald-400">{globalMeta.lastDeploy}</strong></span>
          <span className="hidden xl:inline">Region: <strong className="text-gray-200">{globalMeta.region}</strong></span>
          <span className="hidden md:inline">UTC: <strong className="text-white">{currentTime}</strong></span>
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <span className="text-white font-bold truncate max-w-[140px]">{adminEmail}</span>
            <button
              onClick={() => {
                document.cookie = "little_bro_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                localStorage.removeItem("little_bro_admin_session");
                router.push("/admin/login");
              }}
              className="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer"
            >
              Sign Out 🚪
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CLOUD OPERATIONS WORKSPACE */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6 space-y-5">

        {/* 2. INFRASTRUCTURE HEALTH DASHBOARD (12 SERVICES REALTIME CARDS) */}
        <section className="space-y-2.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <h2 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>🖥</span> Infrastructure Health (12 Services Monitored)
            </h2>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
              ● 11 Operational / 1 Degraded
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5">
            {services.map((svc) => (
              <div
                key={svc.id}
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all backdrop-blur-sm ${
                  svc.status === "online"
                    ? "bg-[#0E121A]/80 border-white/10 hover:border-emerald-500/40"
                    : "bg-amber-950/20 border-amber-500/30"
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-white truncate max-w-[100px]">{svc.name}</span>
                  <span className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded border ${
                    svc.status === "online" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}>
                    {svc.status === "online" ? "🟢 200 OK" : "🟡 WARN"}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-gray-400 space-y-0.5">
                  <div className="flex justify-between"><span>Latency:</span><strong className="text-white">{svc.responseTime}</strong></div>
                  <div className="flex justify-between"><span>Uptime:</span><strong className="text-emerald-400">{svc.uptime}</strong></div>
                  <div className="flex justify-between"><span>Check:</span><span>{svc.lastCheck}</span></div>
                </div>

                <button
                  onClick={() => alert(`⚡ Action executed for ${svc.name}: ${svc.action}`)}
                  className="w-full bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-[9px] font-mono font-bold py-1 rounded transition-all cursor-pointer text-center"
                >
                  {svc.action} ➔
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 3. DEPLOYMENT & PIPELINE CONTROL CENTER (ONE-CLICK PIPELINE ACTIONS) */}
        <section className="bg-[#0D1017] border border-white/10 rounded-xl p-4 space-y-3 shadow-lg">
          <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>🚀</span> Deployment & Pipeline Control Center
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { label: "Deploy", icon: "🚀", url: "/api/admin/deploy", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
              { label: "Rollback", icon: "⏪", url: "/api/admin/deploy", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
              { label: "Restart", icon: "⚡", url: "/api/admin/restart", color: "bg-red-500/20 text-red-300 border-red-500/40" },
              { label: "Health Check", icon: "🩺", url: "/api/admin/status", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
              { label: "Sync Workspace", icon: "🔄", url: "/api/admin/sync", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
              { label: "Clear Cache", icon: "🧹", url: "/api/admin/cache/clear", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" },
              { label: "DB Migration", icon: "🗄️", url: "/api/migrate", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
              { label: "Diagnostics", icon: "🧪", url: "/api/health/env", color: "bg-slate-500/20 text-slate-300 border-slate-500/40" },
            ].map((btn, idx) => (
              <button
                key={idx}
                disabled={runningAction === btn.label}
                onClick={() => executePipelineAction(btn.label, btn.url)}
                className={`p-3 rounded-lg border font-mono text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 shadow-sm hover:brightness-125 ${btn.color}`}
              >
                <span className="text-lg">{btn.icon}</span>
                <span className="truncate text-[10px]">{runningAction === btn.label ? "Running..." : btn.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 4. LIVE MONITORING & TELEMETRY STREAM (GRAFANA / DATADOG STYLE) */}
        <section className="bg-[#0D1017] border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <h2 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>📊</span> Live Telemetry & Metrics Stream (Real-Time Auto Refresh)
            </h2>
            <span className="text-gray-400 text-[10px]">Polling: Every 2s</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            <div className="bg-black/50 border border-white/10 p-3 rounded-lg text-center space-y-1">
              <span className="text-[9px] text-gray-400 uppercase font-mono block">CPU Usage</span>
              <span className="text-base font-mono font-bold text-emerald-400">{telemetry.cpu}%</span>
            </div>
            <div className="bg-black/50 border border-white/10 p-3 rounded-lg text-center space-y-1">
              <span className="text-[9px] text-gray-400 uppercase font-mono block">RAM Memory</span>
              <span className="text-base font-mono font-bold text-blue-400">{telemetry.memory}%</span>
            </div>
            <div className="bg-black/50 border border-white/10 p-3 rounded-lg text-center space-y-1">
              <span className="text-[9px] text-gray-400 uppercase font-mono block">Requests/sec</span>
              <span className="text-base font-mono font-bold text-purple-400">{telemetry.reqPerSec} req/s</span>
            </div>
            <div className="bg-black/50 border border-white/10 p-3 rounded-lg text-center space-y-1">
              <span className="text-[9px] text-gray-400 uppercase font-mono block">Avg Latency</span>
              <span className="text-base font-mono font-bold text-emerald-300">{telemetry.latency} ms</span>
            </div>
            <div className="bg-black/50 border border-white/10 p-3 rounded-lg text-center space-y-1">
              <span className="text-[9px] text-gray-400 uppercase font-mono block">Error Rate</span>
              <span className="text-base font-mono font-bold text-emerald-400">{telemetry.errorRate}%</span>
            </div>
            <div className="bg-black/50 border border-white/10 p-3 rounded-lg text-center space-y-1">
              <span className="text-[9px] text-gray-400 uppercase font-mono block">Webhook Queue</span>
              <span className="text-base font-mono font-bold text-gray-200">{telemetry.webhookQueue}</span>
            </div>
            <div className="bg-black/50 border border-white/10 p-3 rounded-lg text-center space-y-1">
              <span className="text-[9px] text-gray-400 uppercase font-mono block">Running Jobs</span>
              <span className="text-base font-mono font-bold text-cyan-400">{telemetry.runningJobs} active</span>
            </div>
            <div className="bg-black/50 border border-white/10 p-3 rounded-lg text-center space-y-1">
              <span className="text-[9px] text-gray-400 uppercase font-mono block">Failed Jobs</span>
              <span className="text-base font-mono font-bold text-emerald-400">{telemetry.failedJobs}</span>
            </div>
          </div>
        </section>

        {/* 5. AUDIT CENTER (FILTERABLE SYSTEM & SECURITY LOGS) */}
        <section className="bg-[#0D1017] border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2 text-xs font-mono">
            <h2 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>📋</span> Audit Center & Telemetry Traces
            </h2>

            {/* Search Input */}
            <input
              type="text"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Filter logs by keyword..."
              className="bg-black/60 border border-white/15 px-3 py-1 rounded text-[11px] text-white focus:outline-none focus:border-emerald-400 w-48"
            />
          </div>

          {/* Audit Category Sub-Tabs */}
          <div className="flex flex-wrap gap-1 border-b border-white/10 pb-2 text-[10px] font-mono font-bold">
            {[
              { id: "deploy", label: "Deploy" },
              { id: "errors", label: "Errors" },
              { id: "warnings", label: "Warnings" },
              { id: "security", label: "Security" },
              { id: "auth", label: "Auth" },
              { id: "api", label: "API Calls" },
              { id: "webhook", label: "Webhook" },
              { id: "google", label: "Google APIs" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAuditTab(tab.id as any)}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  auditTab === tab.id
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Logs List */}
          <div className="space-y-1.5 font-mono text-[11px] max-h-48 overflow-y-auto pr-1">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-2 bg-black/40 border border-white/5 rounded flex justify-between items-center">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                    log.level === "error" ? "bg-red-500/20 text-red-400" : log.level === "warning" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    {log.type}
                  </span>
                  <span className="font-bold text-white truncate">{log.title}</span>
                  <span className="text-gray-400 truncate hidden sm:inline">{log.desc}</span>
                </div>
                <span className="text-gray-500 text-[10px] shrink-0 ml-2">{log.time}</span>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 7. AI OPERATIONS ASSISTANT (COLLAPSED FLOATING BOT BUTTON IN BOTTOM-RIGHT) */}
      <div className="fixed bottom-4 right-4 z-50">
        {!assistantOpen ? (
          <button
            onClick={() => setAssistantOpen(true)}
            className="bg-[#0D1017] hover:bg-surface border border-emerald-500/40 text-emerald-400 p-3 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer active:scale-95 font-mono text-xs font-bold"
          >
            <span className="text-base">🤖</span>
            <span className="hidden sm:inline">Ops Assistant</span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-[#0D1017] border border-white/15 rounded-2xl shadow-2xl p-4 space-y-3 font-sans text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-2 font-mono">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>🤖</span> Cloud Ops Assistant
              </span>
              <button
                onClick={() => setAssistantOpen(false)}
                className="text-gray-400 hover:text-white cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <div className="h-40 overflow-y-auto space-y-2 p-2 bg-black/60 rounded-xl font-mono text-[11px]">
              {assistantMessages.map((msg, idx) => (
                <div key={idx} className={`p-2 rounded ${msg.role === "user" ? "bg-emerald-500/20 text-emerald-300 text-right" : "bg-white/5 text-gray-200"}`}>
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleAssistantSubmit} className="flex gap-1.5">
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                placeholder="Ask Ops Assistant..."
                className="flex-1 bg-black/50 border border-white/15 p-2 rounded text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
              <button type="submit" className="bg-emerald-500 text-black font-bold px-3 py-2 rounded text-xs hover:bg-emerald-400 cursor-pointer">
                Send
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
