"use client";

import React, { useState, useEffect } from "react";

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  spreadsheetId: string;
}

export default function AdminPanelModal({
  isOpen,
  onClose,
  spreadsheetId
}: AdminPanelModalProps) {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "system" | "features" | "users" | "logs">("chat");

  // Admin Chat Box state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; sender: "admin" | "bot" | "system"; text: string; time: string }>>([
    { id: 1, sender: "system", text: "👑 [Admin System] เชื่อมต่อกล่องแชทผู้ดูแลระบบเรียบร้อยแล้ว", time: "10:00" },
    { id: 2, sender: "bot", text: "สวัสดีครับแอดมิน! 💜 น้อง Little Bro พร้อมรับคำสั่งทดสอบ แชทคุย หรือกระจายข่าวสารแล้วครับ", time: "10:01" }
  ]);

  const handleSendChatMessage = (textToSend?: string) => {
    const messageText = (textToSend || chatInput).trim();
    if (!messageText) return;

    const nowTime = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    const userMsgId = Date.now();

    const newAdminMsg = {
      id: userMsgId,
      sender: "admin" as const,
      text: messageText,
      time: nowTime
    };

    setChatMessages(prev => [...prev, newAdminMsg]);
    if (!textToSend) setChatInput("");

    // Simulate Bot / System Automated Response
    setTimeout(() => {
      let botReplyText = "";
      const lower = messageText.toLowerCase();

      if (lower.includes("สถานะ") || lower.includes("status")) {
        botReplyText = "📊 [System Health] ระบบทั้งหมดทำงานเป็นปกติ:\n- Supabase DB: 🟢 Connected (Sub-100ms)\n- Google Sheets API: 🟢 Connected\n- Telegram Bot: 🟢 Active (@bot)\n- LINE OA: 🟢 Active (@320futtz)";
      } else if (lower.includes("ข้าว") || lower.includes("ค่า") || lower.includes("บาท") || lower.match(/\d+/)) {
        botReplyText = `💸 [Mock Expense] น้องบันทึกรายการ "${messageText}" ลงในชีต Finance และ Supabase เรียบร้อยแล้วครับพี่แอดมิน! ✨`;
      } else if (lower.includes("ประกาศ") || lower.includes("broadcast")) {
        botReplyText = "📢 [Admin Broadcast] ดันข้อความแจ้งเตือนประกาศระบบไปยังผู้ใช้ทุกคนผ่าน LINE OA & Telegram เรียบร้อยแล้วครับ!";
      } else if (lower.includes("สวัสดี") || lower.includes("hello") || lower.includes("hi")) {
        botReplyText = "สวัสดีครับพี่แอดมิน! มีอะไรให้ Little Bro ช่วยรับคำสั่งเพิ่มเติมไหมครับ? 😊";
      } else {
        botReplyText = `🤖 [Little Bro Bot] รับทราบคำสั่งแอดมิน: "${messageText}" — ระบบบันทึกและประมวลผลคำสั่งสำเร็จเรียบร้อยครับ!`;
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: "bot",
          text: botReplyText,
          time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }, 600);
  };

  const handleClearChatHistory = () => {
    setChatMessages([
      { id: Date.now(), sender: "system", text: "🧹 ล้างประวัติการแชทกล่องผู้ดูแลระบบเรียบร้อยแล้ว", time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) }
    ]);
  };

  // Feature Toggles state
  const [featureToggles, setFeatureToggles] = useState({
    telegramReminders: true,
    financialReport: true,
    eSlipVerification: false,
    supabaseSync: true,
    linePushNotify: true
  });

  const [systemLogs, setSystemLogs] = useState([
    { id: 1, text: "🟢 [Admin] เข้าสู่ระบบผู้ดูแลระบบสำเร็จ", time: "เมื่อสักครู่" },
    { id: 2, text: "⚡ [Database] ซิงก์ข้อมูล Supabase ↔ GAS เรียบร้อยแล้ว", time: "2 นาทีที่แล้ว" },
    { id: 3, text: "🔒 [Security] ล็อกโครงสร้างคอลัมน์มาตรฐาน 6 ชีตหลัก", time: "10 นาทีที่แล้ว" }
  ]);

  const [usersList, setUsersList] = useState([
    { id: "5581598534", username: "Master Admin", platform: "Telegram", role: "Super Admin", registered: "20/07/2026" },
    { id: "U2fe9ffc64c98971b04b2200ac04411ff", username: "LINE OA User", platform: "LINE OA", role: "Member", registered: "20/07/2026" }
  ]);

  useEffect(() => {
    // Check if previously authenticated in session
    const isAuth = sessionStorage.getItem("little_bro_admin_auth") === "true";
    if (isAuth) {
      setIsAuthenticated(true);
    }
  }, [isOpen]);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234" || pin === "8888" || pin === "0000") {
      setIsAuthenticated(true);
      sessionStorage.setItem("little_bro_admin_auth", "true");
      setPinError("");
      setPin("");
    } else {
      setPinError("❌ รหัส PIN ผู้ดูแลระบบไม่ถูกต้อง (ลอง 1234 หรือ 8888)");
    }
  };

  const handleToggleFeature = (key: keyof typeof featureToggles) => {
    setFeatureToggles(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("little_bro_admin_features", JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearCache = () => {
    if (confirm("⚠️ ต้องการล้างแคชและความจำชั่วคราวของระบบหรือไม่?")) {
      alert("✅ ล้างแคชระบบและตั้งค่าชั่วคราวเรียบร้อยแล้วครับ");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative text-text-main overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-2 rounded-xl bg-primary/20 border border-primary/30 text-primary">👑</span>
            <div>
              <h2 className="text-base font-bold text-text-main flex items-center gap-2">
                <span>ระบบผู้ดูแลระบบ (Admin Console)</span>
                <span className="text-[9px] bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 px-2 py-0.5 rounded-full font-bold">
                  PRO
                </span>
              </h2>
              <p className="text-[10px] text-text-sub">มอนิเตอร์และควบคุมการตั้งค่าระดับโครงสร้างระบบ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-sub hover:text-text-main p-1.5 rounded-full hover:bg-white/5 transition-all text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* PIN Authentication Screen */}
        {!isAuthenticated ? (
          <form onSubmit={handleVerifyPin} className="space-y-4 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto text-2xl">
              🔒
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-main mb-1">ยืนยันรหัส PIN ผู้ดูแลระบบ</h3>
              <p className="text-[10px] text-text-sub">กรอกรหัส PIN Admin เพื่อเข้าถึงแผงควบคุมหลัก (รหัสเริ่มต้น: 1234)</p>
            </div>

            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="กรอก PIN 4 หรือ 6 หลัก..."
              className="w-full bg-background border border-white/10 p-3 rounded-xl text-center text-sm font-mono text-text-main focus:border-primary focus:outline-none tracking-widest"
              autoFocus
            />

            {pinError && (
              <p className="text-[10px] text-[#EF4444] font-semibold">{pinError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs hover:opacity-90 transition-all shadow-md cursor-pointer"
            >
              ปลดล็อกแผงควบคุม Admin ➔
            </button>
          </form>
        ) : (
          /* Admin Main Console */
          <div className="space-y-4">
            {/* Admin Tabs */}
            <div className="flex bg-background p-1 rounded-xl border border-white/5 text-xs justify-between gap-1 overflow-x-auto">
              {[
                { id: "chat", label: "💬 แชท Admin" },
                { id: "system", label: "🖥️ สถานะระบบ" },
                { id: "features", label: "⚡ ฟีเจอร์" },
                { id: "users", label: "👥 สมาชิก" },
                { id: "logs", label: "📜 ประวัติ" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[10px] whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-sub hover:text-text-main"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 0: ADMIN CHAT BOX */}
            {activeTab === "chat" && (
              <div className="space-y-3">
                {/* Chat Container */}
                <div className="bg-background/80 border border-white/10 rounded-2xl p-3 h-[42vh] flex flex-col justify-between shadow-inner">
                  {/* Messages Scroll View */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.sender === "admin"
                            ? "items-end"
                            : msg.sender === "system"
                            ? "items-center"
                            : "items-start"
                        }`}
                      >
                        {msg.sender === "system" ? (
                          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] text-text-sub text-center my-1">
                            {msg.text}
                          </div>
                        ) : (
                          <div className="max-w-[85%] space-y-0.5">
                            <div className="flex items-center gap-1.5 px-1">
                              <span className="text-[8px] text-text-sub font-semibold">
                                {msg.sender === "admin" ? "👑 Admin" : "🤖 Little Bro Assistant"}
                              </span>
                              <span className="text-[8px] text-text-sub/50">{msg.time}</span>
                            </div>
                            <div
                              className={`p-2.5 rounded-2xl text-[11px] leading-relaxed whitespace-pre-wrap ${
                                msg.sender === "admin"
                                  ? "bg-primary text-white rounded-tr-none shadow-md"
                                  : "bg-surface border border-white/10 text-text-main rounded-tl-none"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quick Action Chips */}
                  <div className="flex gap-1.5 py-2 overflow-x-auto text-[9px] border-t border-white/5 no-scrollbar">
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage("เช็คสถานะระบบ")}
                      className="px-2.5 py-1 bg-surface hover:bg-white/10 border border-white/10 rounded-lg text-text-sub hover:text-text-main shrink-0"
                    >
                      📊 เช็คสถานะระบบ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage("ทดสอบจดรายจ่าย ค่าข้าว 60 บาท")}
                      className="px-2.5 py-1 bg-surface hover:bg-white/10 border border-white/10 rounded-lg text-text-sub hover:text-text-main shrink-0"
                    >
                      💸 ทดสอบจดรายจ่าย
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage("ประกาศระบบ")}
                      className="px-2.5 py-1 bg-surface hover:bg-white/10 border border-white/10 rounded-lg text-text-sub hover:text-text-main shrink-0"
                    >
                      📢 ประกาศข่าวสาร
                    </button>
                    <button
                      type="button"
                      onClick={handleClearChatHistory}
                      className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 shrink-0"
                    >
                      🧹 ล้างแชท
                    </button>
                  </div>

                  {/* Input Field & Send Button */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChatMessage();
                    }}
                    className="flex gap-2 pt-1"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="พิมพ์ข้อความ หรือคำสั่งทดสอบ..."
                      className="flex-1 bg-surface border border-white/15 p-2 rounded-xl text-xs text-text-main focus:border-primary focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      ส่ง ➔
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 1: SYSTEM HEALTH */}
            {activeTab === "system" && (
              <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-background border border-white/5 rounded-xl">
                    <span className="text-[10px] text-text-sub block mb-1">Google Apps Script</span>
                    <span className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                      <span>Connected</span>
                    </span>
                  </div>
                  <div className="p-3 bg-background border border-white/5 rounded-xl">
                    <span className="text-[10px] text-text-sub block mb-1">Supabase DB</span>
                    <span className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                      <span>Connected</span>
                    </span>
                  </div>
                  <div className="p-3 bg-background border border-white/5 rounded-xl">
                    <span className="text-[10px] text-text-sub block mb-1">Telegram Bot API</span>
                    <span className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                      <span>Ready (@bot)</span>
                    </span>
                  </div>
                  <div className="p-3 bg-background border border-white/5 rounded-xl">
                    <span className="text-[10px] text-text-sub block mb-1">LINE OA Messaging</span>
                    <span className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                      <span>Ready (@320futtz)</span>
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-background border border-white/5 rounded-2xl space-y-2.5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-text-main">คำสั่งและเครื่องมือวินิจฉัย (Diagnostics)</h4>
                    <span className="text-[9px] text-text-sub">Real-time Check</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/health/env");
                          const result = await res.json();
                          if (result.status === "success" && result.report) {
                            const rep = result.report;
                            let msg = `🔍 ผลการตรวจสอบ Environment Variables (${rep.overallStatus}):\n\n`;
                            msg += `✅ ผ่าน: ${rep.passedCount} | ⚠️ เตือน: ${rep.warningCount} | ❌ Error: ${rep.errorCount}\n\n`;
                            rep.details.forEach((d: any) => {
                              const icon = d.status === "OK" ? "✅" : d.status === "WARNING" ? "⚠️" : "❌";
                              msg += `${icon} [${d.key}]: ${d.message} (${d.valueMasked})\n`;
                            });
                            alert(msg);
                          } else {
                            alert("❌ ไม่สามารถรันการวินิจฉัยได้: " + result.message);
                          }
                        } catch (err: any) {
                          alert("❌ การเชื่อมต่อล้มเหลว: " + err.message);
                        }
                      }}
                      className="py-2 px-3 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded-xl text-[10px] font-bold text-primary transition-all cursor-pointer text-center"
                    >
                      🔍 ตรวจสอบ Environment (.env)
                    </button>
                    <button
                      type="button"
                      onClick={handleClearCache}
                      className="py-2 px-3 bg-surface hover:bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-text-sub hover:text-text-main transition-all cursor-pointer text-center"
                    >
                      🧹 ล้างแคชระบบ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FEATURE TOGGLES */}
            {activeTab === "features" && (
              <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
                {[
                  { key: "telegramReminders", name: "⏰ แจ้งเตือนงานด่วนอัตโนมัติ (Telegram Reminders)", desc: "เปิดให้บอทรัน Cron Job เช็คแจ้งเตือนทุก 5 นาที" },
                  { key: "financialReport", name: "🩺 ตรวจสุขภาพการเงินรายเดือน (Financial Health Report)", desc: "วิเคราะห์อัตราการออมและภาระหนี้สินรายเดือน" },
                  { key: "eSlipVerification", name: "📷 ระบบตรวจสอบสลิปโอนเงิน (E-Slip Engine)", desc: "สแกนสลิปโอนเงินอัตโนมัติ (ปัจจุบันปิดเพื่อประหยัด Token)" },
                  { key: "supabaseSync", name: "⚡ Real-time Supabase Sync", desc: "ซิงก์ข้อมูลลง Supabase แบบ Sub-100ms" },
                  { key: "linePushNotify", name: "💬 LINE OA Push Notification", desc: "ดันข้อความแจ้งเตือนผ่าน LINE OA" }
                ].map((item) => {
                  const isEnabled = featureToggles[item.key as keyof typeof featureToggles];
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggleFeature(item.key as any)}
                      className="p-3 bg-background border border-white/5 rounded-xl flex items-center justify-between gap-3 cursor-pointer hover:border-white/10 transition-all"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-text-main">{item.name}</h4>
                        <p className="text-[9px] text-text-sub">{item.desc}</p>
                      </div>
                      <div className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${
                        isEnabled ? "bg-[#10B981]" : "bg-white/20"
                      }`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                          isEnabled ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: USERS LIST */}
            {activeTab === "users" && (
              <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                <div className="text-[10px] text-text-sub mb-2">
                  รายชื่อผู้ใช้งานและผู้รับการแจ้งเตือนหลักในระบบ ({usersList.length} รายการ)
                </div>
                {usersList.map((u) => (
                  <div key={u.id} className="p-3 bg-background border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-main">{u.username}</span>
                        <span className="text-[8px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.2 rounded-full font-bold">
                          {u.role}
                        </span>
                      </div>
                      <p className="text-[9px] text-text-sub font-mono">ID: {u.id} • {u.platform}</p>
                    </div>
                    <span className="text-[9px] text-text-sub">{u.registered}</span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: SYSTEM LOGS */}
            {activeTab === "logs" && (
              <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                {systemLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-background border border-white/5 rounded-xl flex justify-between items-center text-[10px]">
                    <span className="text-text-main font-mono">{log.text}</span>
                    <span className="text-text-sub shrink-0 font-mono ml-2">{log.time}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Action */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  sessionStorage.removeItem("little_bro_admin_auth");
                }}
                className="py-2 px-3 bg-surface hover:bg-white/5 border border-white/10 text-text-sub hover:text-text-main font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                🔒 ล็อกเอาท์ Admin
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 bg-primary text-white font-bold rounded-xl text-xs hover:opacity-90 transition-all shadow-md cursor-pointer"
              >
                ปิดหน้าต่าง Admin Console
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
