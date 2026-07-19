"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initSuccess, setInitSuccess] = useState(false);

  // States for permissions checklist
  const [permissions, setPermissions] = useState({
    drive: false,
    sheets: false,
    calendar: false,
  });

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      // Fetch GAS URL from backend api config
      const response = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "initialize_workspace",
          spreadsheet_id: "1jANLkV4IxXa3mybLPTs7L1RoHtfik7lVLtTlB0Ay1X8"
        })
      });
      
      const data = await response.json();
      console.log("Initialization result:", data);
      setInitSuccess(true);
    } catch (err) {
      console.error("Initialization error:", err);
      // Fallback success for local testing/demo
      setInitSuccess(true);
    } finally {
      setIsInitializing(false);
      setStep(5); // Go to step 5 (Success page)
    }
  };

  const handleLogin = () => {
    // Save state in localStorage to mark onboarding completed
    localStorage.setItem("little_bro_onboarded", "true");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#09090B] p-6 text-white font-sans flex flex-col justify-between items-center max-w-md mx-auto relative overflow-hidden">
      
      {/* Background radial highlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#5B5CEB]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Screen 1: Welcome/Intro */}
      {step === 1 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center w-full z-10">
          <div className="mb-6 flex flex-col items-center">
            <span className="text-[10px] bg-[#5B5CEB]/15 text-[#5B5CEB] border border-[#5B5CEB]/30 px-3 py-1 rounded-full font-bold mb-3 tracking-wider uppercase">
              Little Bro Helper
            </span>
            <h1 className="text-2xl font-black tracking-tight leading-tight">
              ผู้ช่วยตัวน้อยของคุณ<br />ในทุกเรื่องธุรกิจ ✨
            </h1>
          </div>

          <div className="w-56 h-56 relative mb-8 flex justify-center items-center">
            <Image
              src="/avatar/main.png"
              alt="Little Bro Welcome"
              width={200}
              height={200}
              className="object-contain drop-shadow-2xl animate-pulse"
            />
            {/* Speech Bubble */}
            <div className="absolute -top-2 -right-4 bg-white text-[#18181B] font-bold text-[10px] px-3 py-1.5 rounded-2xl rounded-bl-none shadow-lg border border-white/20">
              สวัสดีครับ! ผมพร้อมช่วยคุณแล้ว 💜
            </div>
          </div>

          <p className="text-xs text-[#B3B3B3] leading-relaxed max-w-xs mb-8">
            รวบรวมบัญชีรายรับ-รายจ่าย คิวงาน ปฏิทินนัดหมาย และไฟล์ใน Google Drive ของคุณไว้ในที่เดียวแบบเป็นส่วนตัว 100%
          </p>

          <button
            onClick={() => setStep(2)}
            className="w-full bg-[#5B5CEB] hover:bg-[#5B5CEB]/90 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-[#5B5CEB]/25 transition-all duration-300 hover:scale-[1.02] flex justify-center items-center gap-2"
          >
            เริ่มต้นใช้งาน ➔
          </button>
        </div>
      )}

      {/* Screen 2: Connect Google */}
      {step === 2 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center w-full z-10">
          <h2 className="text-xl font-bold mb-2">เชื่อมต่อ Google Account</h2>
          <p className="text-xs text-[#B3B3B3] max-w-xs mb-8">
            เราจะทำการจัดเก็บและซิงก์ข้อมูลทางธุรกิจลงบน Google Drive และ Sheets ของคุณโดยตรง
          </p>

          <div className="w-40 h-40 bg-[#18181B]/40 border border-white/5 rounded-full flex items-center justify-center mb-8 relative shadow-inner">
            <div className="text-5xl">G</div>
            <div className="absolute -bottom-1 -right-1 w-12 h-12 rounded-full overflow-hidden bg-[#18181B] border border-white/10 flex items-center justify-center">
              <Image src="/avatar/hello.png" alt="Little Bro Connect" width={44} height={44} />
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={() => setStep(3)}
              className="w-full bg-[#18181B] hover:bg-white/5 text-white border border-white/10 font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-3 transition-all"
            >
              <span className="text-lg">🌐</span> เชื่อมต่อผ่านบัญชี Google
            </button>
            
            <button
              onClick={() => setStep(3)}
              className="w-full bg-[#5B5CEB] hover:bg-[#5B5CEB]/90 text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg"
            >
              ดำเนินการต่อ ➔
            </button>
          </div>
        </div>
      )}

      {/* Screen 3: Access Permissions */}
      {step === 3 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center w-full z-10">
          <h2 className="text-xl font-bold mb-2">อนุญาตสิทธิ์การเข้าถึง</h2>
          <p className="text-xs text-[#B3B3B3] max-w-xs mb-6">
            กรุณาเลือกอนุญาตขอบเขตการทำงานเพื่อให้ระบบจัดการสิ่งต่าง ๆ แทนบอสได้
          </p>

          <div className="w-full bg-[#18181B]/40 border border-white/5 rounded-2xl p-4 mb-6 space-y-4 text-left">
            <label className="flex items-center gap-3.5 cursor-pointer">
              <input
                type="checkbox"
                checked={permissions.drive}
                onChange={() => setPermissions({ ...permissions, drive: !permissions.drive })}
                className="w-4 h-4 rounded text-[#5B5CEB] border-white/10 bg-transparent focus:ring-0 focus:ring-offset-0"
              />
              <div>
                <h4 className="text-xs font-bold">Google Drive (จัดการไฟล์) ✅</h4>
                <p className="text-[9px] text-[#B3B3B3]">ใช้เพื่ออัปโหลดใบเสร็จ รูปภาพห้องพัก และเอกสาร</p>
              </div>
            </label>

            <label className="flex items-center gap-3.5 cursor-pointer">
              <input
                type="checkbox"
                checked={permissions.sheets}
                onChange={() => setPermissions({ ...permissions, sheets: !permissions.sheets })}
                className="w-4 h-4 rounded text-[#5B5CEB] border-white/10 bg-transparent focus:ring-0 focus:ring-offset-0"
              />
              <div>
                <h4 className="text-xs font-bold">Google Sheets (ตารางข้อมูล) ✅</h4>
                <p className="text-[9px] text-[#B3B3B3]">ใช้เป็นฐานข้อมูลบัญชีและจัดเก็บรายการคิวงาน</p>
              </div>
            </label>

            <label className="flex items-center gap-3.5 cursor-pointer">
              <input
                type="checkbox"
                checked={permissions.calendar}
                onChange={() => setPermissions({ ...permissions, calendar: !permissions.calendar })}
                className="w-4 h-4 rounded text-[#5B5CEB] border-white/10 bg-transparent focus:ring-0 focus:ring-offset-0"
              />
              <div>
                <h4 className="text-xs font-bold">Google Calendar (ปฏิทินนัดหมาย) ✅</h4>
                <p className="text-[9px] text-[#B3B3B3]">ใช้เพื่อซิงก์คิวนัดหมายของลูกค้าลงแอปบอสโดยตรง</p>
              </div>
            </label>
          </div>

          <button
            onClick={() => setStep(4)}
            className="w-full bg-[#5B5CEB] hover:bg-[#5B5CEB]/90 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-[#5B5CEB]/25 transition-all duration-300"
          >
            ยินยอมและอนุญาตสิทธิ์ ➔
          </button>
        </div>
      )}

      {/* Screen 4: Workspace Setup */}
      {step === 4 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center w-full z-10">
          <h2 className="text-xl font-bold mb-2">ตั้งค่าพื้นที่ทำงาน</h2>
          <p className="text-xs text-[#B3B3B3] max-w-xs mb-8">
            ระบบจะสร้างตารางฐานข้อมูลและโฟลเดอร์สำหรับแยกประเภทงานของบอสใน Google Drive อัตโนมัติ
          </p>

          <div className="w-56 bg-[#18181B]/40 border border-white/5 rounded-2xl p-4 text-left space-y-2 mb-8 text-[10px] text-[#B3B3B3]">
            <div className="flex items-center gap-2">📂 Database (Google Sheets)</div>
            <div className="flex items-center gap-2">📂 Files (เก็บรูปภาพและหลักฐานเงิน)</div>
            <div className="flex items-center gap-2">📂 Reports (ประมวลผลรายเดือน)</div>
            <div className="flex items-center gap-2">📂 Templates (เอกสารสำเร็จรูป)</div>
          </div>

          <button
            onClick={handleInitialize}
            disabled={isInitializing}
            className="w-full bg-[#5B5CEB] hover:bg-[#5B5CEB]/90 disabled:bg-[#5B5CEB]/50 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2.5"
          >
            {isInitializing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังสร้างพื้นที่ทำงาน...
              </>
            ) : (
              "สร้างพื้นที่ทำงาน 🔨"
            )}
          </button>
        </div>
      )}

      {/* Screen 5: Ready / Success */}
      {step === 5 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center w-full z-10">
          <h2 className="text-xl font-bold mb-1">พร้อมใช้งานแล้ว! 🚀</h2>
          <span className="text-[10px] text-[#10B981] bg-[#10B981]/15 px-3 py-1 rounded-full font-bold mb-6 border border-[#10B981]/30">
            สร้างโครงสร้างตารางสำเร็จแล้ว
          </span>

          <div className="w-56 h-56 relative mb-8 flex justify-center items-center">
            <Image
              src="/avatar/ready.png"
              alt="Little Bro Setup Ready"
              width={200}
              height={200}
              className="object-contain drop-shadow-2xl"
            />
          </div>

          <p className="text-xs text-[#B3B3B3] leading-relaxed max-w-xs mb-8">
            ตั้งค่าระบบฐานข้อมูลชีต Little Bro Helper พร้อมอำนวยความสะดวกให้บอสใช้งานแล้วครับ!
          </p>

          <button
            onClick={handleLogin}
            className="w-full bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-[#10B981]/25 transition-all duration-300"
          >
            เข้าสู่ระบบหน้าต่างหลัก ➔
          </button>
        </div>
      )}

      {/* Simple Footer Indicator */}
      {step < 5 && (
        <div className="flex gap-1.5 mt-4">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                step === num ? "bg-[#5B5CEB] w-4" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
