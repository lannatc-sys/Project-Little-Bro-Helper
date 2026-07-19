"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SettingsScreen() {
  const [theme, setTheme] = useState("dark");
  
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState("1jANLkV4IxXa3mybLPTs7L1RoHtfik7lVLtTlB0Ay1X8");
  const [folderId, setFolderId] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [initMessage, setInitMessage] = useState("");
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("little_bro_theme") || "dark";
    setTheme(savedTheme);
    const savedSheetId = localStorage.getItem("google_spreadsheet_id");
    if (savedSheetId) setSpreadsheetId(savedSheetId);
    const savedFolderId = localStorage.getItem("google_folder_id");
    if (savedFolderId) setFolderId(savedFolderId);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if ((window as any).toggleLittleBroTheme) {
      (window as any).toggleLittleBroTheme(newTheme);
    }
  };

  const handleReinitializeWorkspace = async () => {
    setIsInitializing(true);
    setInitMessage("");
    try {
      const response = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "initialize_workspace",
          spreadsheet_id: spreadsheetId
        })
      });
      const data = await response.json();
      if (data.status === "success") {
        setInitMessage("✅ สร้างพื้นที่ทำงานสำเร็จ ตารางชีตพร้อมใช้งานแล้วครับพี่!");
      } else {
        setInitMessage("❌ เกิดข้อผิดพลาด: " + data.message);
      }
    } catch (err: any) {
      setInitMessage("❌ ไม่สามารถเปิดระบบสร้างได้: " + err.message);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleBackupDatabase = async () => {
    setIsBackingUp(true);
    try {
      const response = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "backup_workspace",
          spreadsheet_id: spreadsheetId
        })
      });
      const data = await response.json();
      if (data.status === "success") {
        alert(`✅ สำรองข้อมูล Google Sheets สำเร็จเรียบร้อยครับพี่!\nไฟล์สำรองถูกเก็บไว้ใน Drive โฟลเดอร์ "Little Bro Assistant Backups"\n\nพี่สามารถเปิดดูชีตสำรองได้ที่: ${data.backup_url}`);
        if (data.backup_url) {
          window.open(data.backup_url, "_blank");
        }
      } else {
        alert("❌ เกิดข้อผิดพลาด: " + data.message);
      }
    } catch (err: any) {
      alert("❌ ไม่สามารถเชื่อมต่อเพื่อสำรองข้อมูลได้: " + err.message);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleMigrateToSupabase = async () => {
    if (!confirm("⚠️ คำเตือน: ระบบจะย้ายข้อมูลทั้งหมดจาก Google Sheets ปัจจุบันของพี่ ไปเขียนทับใน Supabase พี่ต้องการดำเนินการหรือไม่ครับ?")) {
      return;
    }
    setIsMigrating(true);
    try {
      const response = await fetch("/api/migrate", {
        method: "POST"
      });
      const data = await response.json();
      if (data.status === "success") {
        alert(`✅ ย้ายฐานข้อมูลสำเร็จเรียบร้อยครับพี่!\n\nจำนวนข้อมูลที่ก๊อปปี้อพยพไป:\n- บัญชีการเงิน: ${data.stats.finance} รายการ\n- รายการงาน: ${data.stats.tasks} รายการ\n- นัดหมายกิจกรรม: ${data.stats.calendar} รายการ\n- ข้อมูลโปรไฟล์และตั้งค่าเสร็จสมบูรณ์ 📊✨`);
      } else {
        alert("❌ ย้ายข้อมูลขัดข้อง: " + data.message);
      }
    } catch (err: any) {
      alert("❌ เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์: " + err.message);
    } finally {
      setIsMigrating(false);
    }
  };

  const resetOnboarding = async () => {
    if (confirm("ต้องการรีเซ็ตเพื่อย้อนกลับไปทำขั้นตอนยินดีต้อนรับ (Onboarding) ใหม่หรือไม่ครับ?")) {
      try {
        const email = "lannatc@gmail.com"; // default mock email
        await fetch(`/api/auth/status?email=${encodeURIComponent(email)}`, {
          method: "DELETE"
        });
      } catch (err) {
        console.error("Failed to wipe server registration cache:", err);
      }
      localStorage.removeItem("little_bro_onboarded");
      window.location.href = "/onboarding";
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("ต้องการลบบัญชีผู้ใช้รายนี้ออกจากระบบใช่หรือไม่?\n\nการลบนี้จะทำการล้างข้อมูลการจดจำเครื่องทั้งหมดและออกจากระบบทันที")) {
      try {
        const email = "lannatc@gmail.com"; // default mock email
        await fetch(`/api/auth/status?email=${encodeURIComponent(email)}`, {
          method: "DELETE"
        });
      } catch (err) {
        console.error("Failed to wipe server registration cache:", err);
      }
      localStorage.clear();
      window.location.href = "/onboarding";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* Header Section */}
        <header className="mb-6">
          <h1 className="text-xl font-bold text-text-main">ตั้งค่าระบบ</h1>
        </header>

        {/* Profile Card */}
        <div className="bg-surface/40 border border-white/5 p-4 rounded-2xl mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#5B5CEB]/30 bg-surface">
            <Image
              src="/avatar/hello.png"
              alt="Owner Avatar"
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-text-main">Little Bro</h3>
            <p className="text-[9px] text-text-sub mb-1">บัญชีส่วนตัว • lannatc@gmail.com</p>
            <button
              onClick={() => setShowAccountModal(true)}
              className="bg-[#5B5CEB]/25 hover:bg-[#5B5CEB]/40 text-[#5B5CEB] border border-[#5B5CEB]/30 text-[9px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer"
            >
              จัดการบัญชี Google
            </button>
          </div>
        </div>

        {/* Theme & Display Options */}
        <section className="mb-6 bg-surface/20 border border-white/5 p-4 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-text-sub uppercase tracking-wider">ตัวเลือกการแสดงผล (Display Settings)</h3>
          
          {/* Theme Selector */}
          <div className="flex justify-between items-center text-xs">
            <span>ธีมสีหน้าต่าง (Color Theme)</span>
            <div className="flex bg-surface p-1 rounded-xl border border-white/5">
              <button
                onClick={() => handleThemeChange("dark")}
                className={`px-3 py-1 rounded-lg font-bold transition-all text-xs ${
                  theme === "dark" ? "bg-[#5B5CEB] text-white" : "text-text-sub hover:text-text-main"
                }`}
              >
                🌙 Dark
              </button>
              <button
                onClick={() => handleThemeChange("light")}
                className={`px-3 py-1 rounded-lg font-bold transition-all text-xs ${
                  theme === "light" ? "bg-[#5B5CEB] text-white" : "text-text-sub hover:text-text-main"
                }`}
              >
                ☀️ Light
              </button>
            </div>
          </div>
        </section>

        {/* Configuration List */}
        <section className="mb-6">
          <h3 className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-3">การตั้งค่าทั่วไป</h3>
          <div className="space-y-2.5">
            {/* Workspace Data row */}
            <div
              onClick={() => setShowWorkspaceModal(true)}
              className="p-3 bg-surface/20 border border-white/5 rounded-xl hover:bg-surface/40 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg bg-surface p-2 rounded-lg">📁</span>
                <div>
                  <h4 className="text-xs font-semibold text-text-main">ข้อมูลพื้นที่ทำงานส่วนตัว (Personal Assistant Data)</h4>
                  <p className="text-[9px] text-text-sub">ตั้งค่าไอดีโฟลเดอร์ Google Drive และไอดีชีต</p>
                </div>
              </div>
              <span className="text-xs text-text-sub/45">➔</span>
            </div>

            {/* Custom Workflows row */}
            <div
              onClick={() => window.location.href = "/workflows"}
              className="p-3 bg-surface/20 border border-white/5 rounded-xl hover:bg-surface/40 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg bg-surface p-2 rounded-lg">⚙️</span>
                <div>
                  <h4 className="text-xs font-semibold text-text-main">ตั้งค่าระบบอัตโนมัติ (Personal Settings)</h4>
                  <p className="text-[9px] text-text-sub">เปิด-ปิด สูตรระบบอัตโนมัติและส่งการแจ้งเตือน</p>
                </div>
              </div>
              <span className="text-xs text-text-sub/45">➔</span>
            </div>

            {/* Supabase Migration row */}
            <div
              onClick={handleMigrateToSupabase}
              className={`p-3 bg-[#10B981]/5 border border-[#10B981]/15 rounded-xl hover:bg-[#10B981]/15 transition-all cursor-pointer flex items-center justify-between ${
                isMigrating ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg bg-[#10B981]/20 p-2 rounded-lg">
                  {isMigrating ? "⏳" : "⚡"}
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-text-main">
                    {isMigrating ? "กำลังอพยพข้อมูล..." : "อพยพข้อมูลเก่าไป Supabase"}
                  </h4>
                  <p className="text-[9px] text-text-sub">ย้ายรายการธุรกรรมการเงินและงานทั้งหมดจาก Google Sheets ไป Supabase ในคลิกเดียว</p>
                </div>
              </div>
              <span className="text-xs text-[#10B981]/60">➔</span>
            </div>

            {/* Other static options */}
            <div
              onClick={resetOnboarding}
              className="p-3 bg-surface/20 border border-white/5 rounded-xl hover:bg-surface/40 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg bg-surface p-2 rounded-lg">🔄</span>
                <div>
                  <h4 className="text-xs font-semibold text-text-main">ย้อนกลับไปทำ Onboarding ใหม่</h4>
                  <p className="text-[9px] text-text-sub">ล้างข้อมูลเพื่อดูขั้นตอนต้อนรับ Google Auth</p>
                </div>
              </div>
              <span className="text-xs text-text-sub/45">➔</span>
            </div>
            
            <div
              onClick={handleBackupDatabase}
              className={`p-3 bg-surface/20 border border-white/5 rounded-xl hover:bg-surface/40 transition-all cursor-pointer flex items-center justify-between ${
                isBackingUp ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg bg-surface p-2 rounded-lg">
                  {isBackingUp ? "⏳" : "💾"}
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-text-main">
                    {isBackingUp ? "กำลังสำรองข้อมูล..." : "สำรองข้อมูลบัญชีส่วนตัว"}
                  </h4>
                  <p className="text-[9px] text-text-sub">คัดลอกและบันทึกข้อมูลส่วนตัวเก็บแยกไว้ใน Google Drive</p>
                </div>
              </div>
              <span className="text-xs text-text-sub/45">➔</span>
            </div>

            {/* Delete Account Option */}
            <div
              onClick={handleDeleteAccount}
              className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl hover:bg-[#EF4444]/20 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg bg-[#EF4444]/25 p-2 rounded-lg">🗑️</span>
                <div>
                  <h4 className="text-xs font-semibold text-[#EF4444]">ลบข้อมูลบัญชีผู้ใช้ (Delete Account)</h4>
                  <p className="text-[9px] text-[#EF4444]/75">ล้างข้อมูลการจดจำเครื่องทั้งหมดและออกจากระบบ</p>
                </div>
              </div>
              <span className="text-xs text-[#EF4444]/60">➔</span>
            </div>
          </div>
        </section>

        {/* Stance Avatar Card */}
        <div className="bg-surface/40 border border-[#5B5CEB]/25 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-surface flex-shrink-0 border border-white/10">
            <Image
              src="/avatar/manageable.png"
              alt="Manage Stance"
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-main mb-1">ความปลอดภัยของข้อมูลเป็นสิ่งสำคัญ! 🔒</h4>
            <p className="text-[10px] text-text-sub leading-relaxed">
              ข้อมูลทุกอย่างจะถูกส่งตรงไปที่คลังข้อมูลส่วนตัวโดยไม่ผ่านเซิร์ฟเวอร์คนกลาง ปลอดภัยและเป็นส่วนตัว 100% ครับ!
            </p>
          </div>
        </div>
      </div>

      {/* Workspace Data Modal */}
      {showWorkspaceModal && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-surface border border-white/10 w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col relative text-text-main">
            <button 
              onClick={() => {
                setShowWorkspaceModal(false);
                setInitMessage("");
              }}
              className="absolute top-4 right-4 text-text-sub hover:text-text-main"
            >
              ✕
            </button>
            <h3 className="text-sm font-bold text-text-main mb-4">📁 ตั้งค่าข้อมูลพื้นที่ทำงาน</h3>
            
            <div className="space-y-3 mb-6 text-xs text-text-sub">
              <div>
                <label className="block mb-1 font-semibold uppercase text-[9px]">GOOGLE_SPREADSHEET_ID</label>
                <input 
                  type="text" 
                  value={spreadsheetId} 
                  disabled
                  className="w-full bg-background border border-white/5 p-2.5 rounded-lg text-text-main font-mono text-[9px] opacity-75"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold uppercase text-[9px]">GOOGLE_APPS_SCRIPT_URL</label>
                <input 
                  type="text" 
                  value="https://script.google.com/macros/s/.../exec" 
                  disabled
                  className="w-full bg-background border border-white/5 p-2.5 rounded-lg text-text-main font-mono text-[9px] opacity-75"
                />
              </div>
            </div>

            {initMessage && (
              <div className="mb-4 p-3 bg-background/40 border border-white/10 text-[10px] rounded-xl text-center">
                {initMessage}
              </div>
            )}

            <button
              onClick={handleReinitializeWorkspace}
              disabled={isInitializing}
              className="w-full bg-[#5B5CEB] hover:bg-[#5B5CEB]/90 disabled:bg-[#5B5CEB]/50 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isInitializing ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังจัดตั้งตารางชีตใหม่...
                </>
              ) : (
                "สร้างและล้างพื้นที่ทำงานใหม่ 🔨"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Google Account Modal Overlay */}
      {showAccountModal && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-surface border border-white/10 w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col relative text-text-main">
            <button 
              type="button"
              onClick={() => setShowAccountModal(false)}
              className="absolute top-4 right-4 text-text-sub hover:text-text-main text-sm"
            >
              ✕
            </button>
            <h3 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
              🔑 การจัดการบัญชี Google Workspace
            </h3>
            
            <div className="space-y-4 mb-6 text-xs">
              <div className="bg-background/50 p-3.5 rounded-xl border border-white/5 space-y-2">
                <div>
                  <span className="text-[10px] text-text-sub block">อีเมลผู้ดูแลบัญชี</span>
                  <span className="font-semibold text-text-main">lannatc@gmail.com</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-sub block">Google Spreadsheet ID</span>
                  <span className="font-mono text-[9px] text-text-sub break-all">{spreadsheetId}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <a 
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold text-center py-2.5 rounded-xl block transition-all"
                >
                  🟢 เปิดดูแผ่นงาน Google Sheets ➔
                </a>
                
                {folderId ? (
                  <a 
                    href={`https://drive.google.com/drive/folders/${folderId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-[#5B5CEB] hover:bg-[#5B5CEB]/90 text-white font-bold text-center py-2.5 rounded-xl block transition-all"
                  >
                    🔵 เปิดดูโฟลเดอร์ Google Drive ➔
                  </a>
                ) : (
                  <a 
                    href="https://drive.google.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-[#5B5CEB] hover:bg-[#5B5CEB]/90 text-white font-bold text-center py-2.5 rounded-xl block transition-all"
                  >
                    🔵 เปิดดูคลาวด์ Google Drive ➔
                  </a>
                )}

                <a 
                  href="https://myaccount.google.com/permissions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-surface hover:bg-white/5 border border-white/10 text-text-sub hover:text-text-main text-center font-bold py-2.5 rounded-xl block transition-all"
                >
                  ⚙️ ตรวจเช็คสิทธิ์อนุญาตความปลอดภัย ➔
                </a>
              </div>
            </div>

            <div className="text-[9px] text-text-sub/70 leading-relaxed text-center">
              ข้อมูลทั้งหมดเก็บไว้บนบัญชีผู้ใช้ระบบกูเกิลคลาวด์ส่วนตัวอย่างปลอดภัย 100%
            </div>
          </div>
        </div>
      )}

      <footer className="mt-8 text-center text-[10px] text-text-sub/40">
        <p>Little Bro Assistant v1.0.0 • Antigravity Product Team</p>
      </footer>
    </div>
  );
}
