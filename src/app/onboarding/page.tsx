"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initSuccess, setInitSuccess] = useState(false);
  
  // Google Auth Mock states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authSubStep, setAuthSubStep] = useState(1);

  // User details
  const [email, setEmail] = useState("lannatc@gmail.com");
  const [username, setUsername] = useState("Little Bro");
  const [pdpaConsent, setPdpaConsent] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState("none");
  const [errorMessage, setErrorMessage] = useState("");

  // States for permissions checklist
  const [permissions, setPermissions] = useState({
    drive: false,
    sheets: false,
    calendar: false,
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = (userEmail: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/status?email=${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        if (data.status === "approved") {
          clearInterval(pollIntervalRef.current!);
          setApprovalStatus("approved");
          
          // Save generated IDs to localStorage
          localStorage.setItem("google_spreadsheet_id", data.spreadsheet_id || "1jANLkV4IxXa3mybLPTs7L1RoHtfik7lVLtTlB0Ay1X8");
          localStorage.setItem("google_folder_id", data.folder_id || "");
          
          setInitSuccess(true);
          setStep(5);
        } else if (data.status === "rejected") {
          clearInterval(pollIntervalRef.current!);
          setApprovalStatus("rejected");
          setErrorMessage("❌ คำขอใช้งานบัญชีของคุณได้รับการปฏิเสธโดยผู้ดูแลระบบ สิทธิ์เชื่อมโยงทั้งหมดถูกยกเลิกแล้ว");
          setStep(1);
        }
      } catch (err) {
        console.error("Polling status error:", err);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleLogin = () => {
    localStorage.setItem("little_bro_onboarded", "true");
    localStorage.setItem("little_bro_email", email);
    router.push("/");
  };

  const triggerGoogleAuth = () => {
    if (!pdpaConsent) return;
    setAuthSubStep(1);
    setShowAuthModal(true);
  };

  const selectMockAccount = () => {
    setAuthSubStep(2);
  };

  const approvePermissions = async () => {
    setPermissions({
      drive: true,
      sheets: true,
      calendar: true
    });
    setShowAuthModal(false);
    
    // Submit registration request
    setApprovalStatus("pending");
    setStep(4);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          username,
          telegram_chat_id: "5581598534" // Mock matching current active user
        })
      });
      const data = await res.json();
      if (data.status === "approved") {
        localStorage.setItem("google_spreadsheet_id", data.spreadsheet_id || "1jANLkV4IxXa3mybLPTs7L1RoHtfik7lVLtTlB0Ay1X8");
        localStorage.setItem("google_folder_id", data.folder_id || "");
        setApprovalStatus("approved");
        setStep(5);
      } else {
        // Start polling for approval status
        startPolling(email);
      }
    } catch (err: any) {
      console.error("Registration request failed:", err);
      // Fallback: start polling anyway
      startPolling(email);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans flex flex-col justify-between items-center max-w-md mx-auto relative overflow-hidden transition-colors duration-300">
      
      {/* Background radial highlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#5B5CEB]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Screen 1: Welcome/Intro */}
      {step === 1 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center w-full z-10 space-y-4 py-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] bg-[#5B5CEB]/15 text-[#5B5CEB] border border-[#5B5CEB]/30 px-3 py-1 rounded-full font-bold mb-2 tracking-wider uppercase">
              Little Bro Assistant
            </span>
            <h1 className="text-xl font-black tracking-tight leading-tight">
              ผู้ช่วยส่วนตัวและการเงินอัจฉริยะ 🧠
            </h1>
          </div>

          <div className="w-24 h-24 relative flex justify-center items-center">
            <Image
              src="/avatar/main.png"
              alt="Little Bro Welcome"
              width={96}
              height={96}
              className="object-contain drop-shadow-2xl animate-pulse"
            />
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-2xl text-[10px] text-red-500 leading-relaxed max-w-xs text-center">
              {errorMessage}
            </div>
          )}

          {/* Core features list */}
          <div className="w-full bg-surface/20 border border-white/5 rounded-2xl p-4 space-y-4 text-left z-10">
            <div className="flex gap-3">
              <span className="text-lg bg-surface p-1.5 rounded-lg flex-shrink-0">💬</span>
              <div>
                <h4 className="text-xs font-bold text-text-main">จดง่ายเหมือนพิมพ์แชท</h4>
                <p className="text-[9px] text-text-sub leading-relaxed">ไม่ต้องคอยกดเลือกหมวดหมู่หรือหยอดตัวเลขลงช่องให้ปวดหัว แค่พิมพ์คุยเหมือนบอกเพื่อนรัก เช่น "ข้าวเพราไก่ไข่ดาว 60" หรือ "ค่าน้ำมัน 800" ระบบแยกแยะจำนวนเงินและหมวดหมู่ให้เสร็จสรรพ</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg bg-surface p-1.5 rounded-lg flex-shrink-0">📋</span>
              <div>
                <h4 className="text-xs font-bold text-text-main">สายก๊อปวางต้องเลิฟ</h4>
                <p className="text-[9px] text-text-sub leading-relaxed">มีระบบอ่านข้อความ (Smart Parsing) แค่ก๊อปปี้ข้อความแจ้งเตือนเงินเข้า-ออกจาก SMS หรือแอปธนาคารมาวาง แอปก็สามารถดึงยอดเงินมาบันทึกให้ได้ทันที</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg bg-surface p-1.5 rounded-lg flex-shrink-0">📊</span>
              <div>
                <h4 className="text-xs font-bold text-text-main">สรุปผลเข้าใจง่าย</h4>
                <p className="text-[9px] text-text-sub leading-relaxed">มีกราฟวงกลม (Pie Chart) แยกหมวดหมู่ชัดเจน ทำให้เห็นภาพรวมได้ทันทีว่าเดือนนี้เงินเราไหลไปกับค่ากิน ค่าเดินทาง หรือกิเลสชิ้นไหนมากที่สุด</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full bg-[#5B5CEB] hover:bg-[#5B5CEB]/90 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-[#5B5CEB]/25 transition-all duration-300 hover:scale-[1.02] flex justify-center items-center gap-2 cursor-pointer"
          >
            เริ่มต้นใช้งาน ➔
          </button>
        </div>
      )}

      {/* Screen 2: Connect Google */}
      {step === 2 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center w-full z-10">
          <h2 className="text-xl font-bold mb-2">เชื่อมต่อ Google Account</h2>
          <p className="text-xs text-text-sub max-w-xs mb-8">
            เราจะทำการจัดเก็บและซิงก์ข้อมูลทางบัญชีลงบน Google Drive และ Sheets ของคุณโดยตรง
          </p>

          <div className="w-40 h-40 bg-surface/40 border border-white/5 rounded-full flex items-center justify-center mb-8 relative shadow-inner">
            <div className="text-5xl font-black text-text-main">G</div>
            <div className="absolute -bottom-1 -right-1 w-12 h-12 rounded-full overflow-hidden bg-white border border-white/10 flex items-center justify-center">
              <Image src="/avatar/hello.png" alt="Little Bro Connect" width={44} height={44} />
            </div>
          </div>

          <div className="w-full space-y-4">
            {/* PDPA Privacy Checkbox Consent */}
            <div className="bg-surface/20 border border-white/5 rounded-2xl p-4 text-left">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pdpaConsent}
                  onChange={(e) => setPdpaConsent(e.target.checked)}
                  className="w-4.5 h-4.5 mt-0.5 rounded text-[#5B5CEB] border-white/10 bg-transparent focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-[10px] text-text-sub leading-relaxed">
                  ฉันยอมรับ <span className="text-[#5B5CEB] underline hover:text-white">นโยบายความเป็นส่วนตัว (Privacy Policy)</span> และข้อตกลงการใช้งานของระบบผู้ช่วยส่วนตัวเรียบร้อยแล้ว
                </span>
              </label>
            </div>

            <button
              onClick={triggerGoogleAuth}
              disabled={!pdpaConsent}
              className="w-full bg-white hover:bg-white/90 disabled:bg-white/10 disabled:text-text-sub/50 text-[#18181B] font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-md cursor-pointer active:scale-95"
            >
              <span>🔑</span> ดึงสิทธิ์อนุมัติเข้าถึง Google
            </button>
            
            <button
              onClick={() => setStep(3)}
              disabled={!pdpaConsent}
              className="w-full bg-surface hover:bg-white/5 disabled:opacity-40 text-text-sub hover:text-text-main border border-white/10 font-bold text-sm py-3.5 rounded-2xl transition-all"
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
          <p className="text-xs text-text-sub max-w-xs mb-6">
            กรุณาเลือกอนุญาตขอบเขตการทำงานเพื่อให้ระบบจัดการสิ่งต่าง ๆ แทนบอสได้
          </p>

          <div className="w-full bg-surface/40 border border-white/5 rounded-2xl p-4 mb-6 space-y-4 text-left">
            <label className="flex items-center gap-3.5 cursor-pointer">
              <input
                type="checkbox"
                checked={permissions.drive}
                onChange={() => setPermissions({ ...permissions, drive: !permissions.drive })}
                className="w-4 h-4 rounded text-[#5B5CEB] border-white/10 bg-transparent focus:ring-0 focus:ring-offset-0"
              />
              <div>
                <h4 className="text-xs font-bold">Google Drive (จัดการไฟล์)</h4>
                <p className="text-[9px] text-text-sub">ใช้เพื่ออัปโหลดใบเสร็จ รูปภาพ และเอกสารส่วนตัว</p>
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
                <h4 className="text-xs font-bold">Google Sheets (ตารางข้อมูล)</h4>
                <p className="text-[9px] text-text-sub">ใช้เป็นฐานข้อมูลส่วนตัวและรายการเช็คลิสต์งาน</p>
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
                <h4 className="text-xs font-bold">Google Calendar (ปฏิทินนัดหมาย)</h4>
                <p className="text-[9px] text-text-sub">ใช้เพื่อซิงก์นัดหมายกิจกรรมลงบนปฏิทินกูเกิลหลัก</p>
              </div>
            </label>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={triggerGoogleAuth}
              className="w-full bg-white hover:bg-white/90 text-[#18181B] font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <span>🔑</span> ดึงข้อมูลดึงขออนุมัติ Google OAuth
            </button>
            <button
              onClick={approvePermissions}
              className="w-full bg-[#5B5CEB] hover:bg-[#5B5CEB]/90 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg transition-all duration-300"
            >
              บันทึกและดำเนินการต่อ ➔
            </button>
          </div>
        </div>
      )}

      {/* Screen 4: Waiting for approval */}
      {step === 4 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center w-full z-10">
          <h2 className="text-xl font-bold mb-2">ส่งคำขอใช้งานสำเร็จ</h2>
          <p className="text-xs text-text-sub max-w-xs mb-8">
            คำขอลงทะเบียนเชื่อมต่อของคุณถูกบันทึกส่งไปยังผู้ดูแลระบบเรียบร้อยแล้วครับ
          </p>

          <div className="w-24 h-24 mb-6 rounded-full overflow-hidden bg-surface border border-[#5B5CEB]/30 flex items-center justify-center">
            <div className="animate-spin w-10 h-10 border-4 border-[#5B5CEB] border-t-transparent rounded-full" />
          </div>

          <span className="text-[10px] text-[#F59E0B] bg-[#F59E0B]/15 px-3.5 py-1.5 rounded-full font-bold mb-4 border border-[#F59E0B]/30 animate-pulse">
            ⏳ กำลังรอการตรวจสอบและอนุมัติสิทธิ์เข้าใช้งาน...
          </span>

          <p className="text-[10px] text-text-sub leading-relaxed max-w-xs">
            เมื่อผู้ดูแลระบบกดยืนยันการอนุมัติผ่าน Telegram บัญชีผู้ช่วยส่วนตัวจะเริ่มสร้างพื้นที่จัดเก็บฐานข้อมูล Google Drive และ Sheets ของคุณในทันที
          </p>
        </div>
      )}

      {/* Screen 5: Ready / Success */}
      {step === 5 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center w-full z-10">
          <h2 className="text-xl font-bold mb-1">ยินดีด้วยครับ! 🎉</h2>
          <span className="text-[10px] text-[#10B981] bg-[#10B981]/15 px-3 py-1 rounded-full font-bold mb-6 border border-[#10B981]/30">
            ระบบอนุมัติและสร้างฐานข้อมูลสำเร็จเรียบร้อย
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

          <p className="text-xs text-text-sub leading-relaxed max-w-xs mb-8">
            พื้นที่เก็บไฟล์และแผ่นงานบันทึกข้อมูลส่วนตัว Little Bro Assistant พร้อมอำนวยความสะดวกให้คุณใช้งานแล้วครับ!
          </p>

          <button
            onClick={handleLogin}
            className="w-full bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-[#10B981]/25 transition-all duration-300"
          >
            เข้าสู่หน้าจอหลักระบบผู้ช่วย ➔
          </button>
        </div>
      )}

      {/* Google OAuth Mock Modal Popup */}
      {showAuthModal && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-surface border border-white/10 w-full max-w-xs rounded-3xl p-5 shadow-2xl flex flex-col items-center relative text-text-main">
            
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-3.5 right-4 text-text-sub hover:text-text-main text-sm"
            >
              ✕
            </button>

            <div className="w-10 h-10 rounded-full bg-background border border-white/10 flex items-center justify-center text-xl font-black mb-4">
              G
            </div>

            {authSubStep === 1 ? (
              <div className="w-full text-center">
                <h3 className="text-xs font-bold text-text-main mb-1">ลงชื่อเข้าใช้งานด้วย Google</h3>
                <p className="text-[10px] text-text-sub mb-4">เพื่อทำรายการเชื่อมต่อกับ Little Bro Assistant</p>
                
                <button
                  onClick={selectMockAccount}
                  className="w-full p-3 bg-background/60 hover:bg-background border border-white/5 rounded-xl flex items-center gap-3 text-left transition-all mb-3 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-[#5B5CEB]/20 text-[#5B5CEB] flex items-center justify-center font-bold text-xs">
                    L
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-text-main leading-none">Little Bro</h4>
                    <span className="text-[9px] text-text-sub">lannatc@gmail.com</span>
                  </div>
                </button>

                <button
                  onClick={() => alert("ระบบทดสอบรองรับเฉพาะบัญชีหลักในเครื่องขณะนี้ครับ!")}
                  className="text-[9px] text-[#5B5CEB] hover:underline"
                >
                  ใช้บัญชีอื่น
                </button>
              </div>
            ) : (
              <div className="w-full text-text-main">
                <h3 className="text-xs font-bold text-text-main text-center mb-1">ยินยอมและอนุญาตสิทธิ์</h3>
                <p className="text-[9px] text-text-sub text-center mb-4">Little Bro Assistant ขอสิทธิ์เข้าถึงบัญชีส่วนตัวดังนี้:</p>
                
                <div className="space-y-2 mb-5 text-[10px] text-text-sub bg-background/40 p-3 rounded-xl">
                  <div className="flex items-start gap-2">
                    <span className="text-[#10B981]">✔</span>
                    <span>ดู สร้าง และแก้ไขไฟล์ทั้งหมดบน Google Drive</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#10B981]">✔</span>
                    <span>ดู สร้าง และแก้ไขตารางชีตทั้งหมดบน Google Sheets</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#10B981]">✔</span>
                    <span>จัดการข้อมูลกิจกรรมบน Google Calendar</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="flex-1 bg-background text-text-sub text-xs font-bold py-2.5 rounded-xl border border-white/5 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={approvePermissions}
                    className="flex-1 bg-[#5B5CEB] text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer hover:bg-[#5B5CEB]/85"
                  >
                    อนุญาต (Allow)
                  </button>
                </div>
              </div>
            )}
          </div>
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
