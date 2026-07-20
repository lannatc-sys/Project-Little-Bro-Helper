"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGoogleAuth } from "@/components/GoogleAuthProvider";

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, signInWithGoogle, signOut } = useGoogleAuth();

  const [step, setStep] = useState(1);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showAccountChooserModal, setShowAccountChooserModal] = useState(false);
  const [pdpaConsent, setPdpaConsent] = useState(true);

  // Prefill user email if exists
  useEffect(() => {
    if (user?.email) {
      setGoogleEmailInput(user.email);
    } else {
      const savedEmail = localStorage.getItem("little_bro_email") || "lannatc@gmail.com";
      setGoogleEmailInput(savedEmail);
    }
  }, [user]);

  const handleGoogleOAuthLogin = async (emailToUse?: string) => {
    setIsAuthenticating(true);
    try {
      const targetEmail = emailToUse || googleEmailInput || "lannatc@gmail.com";
      const profile = await signInWithGoogle(targetEmail);
      
      // Auto-provision Google Spreadsheet workspace
      const res = await fetch("/api/auth/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profile.email,
          username: profile.name,
          telegram_chat_id: "5581598534"
        })
      });
      const data = await res.json();
      if (data.status === "approved" || data.spreadsheet_id) {
        localStorage.setItem("google_spreadsheet_id", data.spreadsheet_id || "1jANLkV4IxXa3mybLPTs7L1RoHtfik7lVLtTlB0Ay1X8");
        localStorage.setItem("google_folder_id", data.folder_id || "");
      }

      setShowAccountChooserModal(false);
      setStep(3); // Success Screen
    } catch (err: any) {
      alert("❌ ไม่สามารถเข้าสู่ระบบ Google OAuth 2.0 ได้: " + err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleFinishOnboarding = () => {
    localStorage.setItem("little_bro_onboarded", "true");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans flex flex-col justify-between items-center max-w-md mx-auto relative overflow-hidden transition-colors duration-300">
      
      {/* Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/15 rounded-full blur-[90px] pointer-events-none" />

      {/* STEP 1: Welcome & Intro */}
      {step === 1 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center w-full z-10 space-y-5 py-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] bg-primary/15 text-primary border border-primary/30 px-3 py-1 rounded-full font-bold mb-2 tracking-wider uppercase flex items-center gap-1">
              <span>🔒</span> Google OAuth 2.0 System
            </span>
            <h1 className="text-xl font-black tracking-tight leading-tight text-text-main">
              ผู้ช่วยส่วนตัวและการเงินอัจฉริยะ 🧠
            </h1>
            <p className="text-xs text-text-sub mt-1">
              ระบบเข้าสู่ระบบและซิงก์ข้อมูลความปลอดภัยสูงด้วย Google Authentication 2.0
            </p>
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

          {/* Core Feature Card */}
          <div className="w-full bg-surface/30 border border-white/10 rounded-3xl p-4.5 space-y-3.5 text-left z-10 shadow-lg">
            <div className="flex gap-3 items-center">
              <span className="text-xl bg-surface p-2 rounded-xl border border-white/10 shrink-0">🛡️</span>
              <div>
                <h4 className="text-xs font-bold text-text-main">Google Auth 2.0 Enterprise</h4>
                <p className="text-[10px] text-text-sub leading-relaxed">เข้าสู่ระบบด้วย Google Account ของคุณ ข้อมูลทั้งหมดซิงก์ตรงลง Google Sheets และ Drive ส่วนตัว ปลอดภัย 100%</p>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <span className="text-xl bg-surface p-2 rounded-xl border border-white/10 shrink-0">💬</span>
              <div>
                <h4 className="text-xs font-bold text-text-main">บันทึกง่ายผ่านแชทและบอท</h4>
                <p className="text-[10px] text-text-sub leading-relaxed">พิมพ์บอกรายรับ-รายจ่าย สแกนสลิป หรือตั้งเตือนนัดหมายผ่าน Telegram / LINE OA ระบบซิงก์ทันที</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] flex justify-center items-center gap-2 cursor-pointer"
          >
            <span>ดำเนินการต่อ ➔</span>
          </button>
        </div>
      )}

      {/* STEP 2: Google OAuth 2.0 Login Screen */}
      {step === 2 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center w-full z-10 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-1 text-text-main">เข้าสู่ระบบด้วย Google 2.0</h2>
            <p className="text-xs text-text-sub max-w-xs mx-auto">
              เลือกบัญชี Google Account เพื่อเชื่อมต่อพื้นที่เก็บข้อมูล Google Sheets & Drive ส่วนตัว
            </p>
          </div>

          {/* Big Google G Icon Card */}
          <div className="w-36 h-36 bg-surface/50 border border-white/10 rounded-3xl flex items-center justify-center relative shadow-xl">
            <div className="w-20 h-20 rounded-2xl bg-white border border-white/20 flex items-center justify-center shadow-md">
              <span className="text-4xl font-black bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05] bg-clip-text text-transparent">
                G
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-full overflow-hidden bg-white border border-white/20 flex items-center justify-center shadow-lg">
              <Image src="/avatar/shan.png" alt="Mascot Avatar" width={40} height={40} className="object-cover scale-110" />
            </div>
          </div>

          {/* Active User Card if already signed in */}
          {user?.authenticated && (
            <div className="w-full p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-400">
                  {user.email.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-main">{user.name}</h4>
                  <p className="text-[10px] text-text-sub font-mono">{user.email}</p>
                </div>
              </div>
              <span className="text-[9px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">
                ✓ ล็อกอินอยู่
              </span>
            </div>
          )}

          {/* PDPA Consent Checkbox */}
          <div className="w-full bg-surface/30 border border-white/5 rounded-2xl p-3.5 text-left">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={pdpaConsent}
                onChange={(e) => setPdpaConsent(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-primary border-white/20 bg-transparent focus:ring-0 cursor-pointer"
              />
              <span className="text-[10px] text-text-sub leading-relaxed">
                ฉันยอมรับข้อตกลงความเป็นส่วนตัว <span className="text-primary underline">Google OAuth 2.0 PDPA Compliance</span> และอนุญาตซิงก์ข้อมูลลง Google Sheets ของฉัน
              </span>
            </label>
          </div>

          {/* Official Google OAuth Sign-In Button */}
          <div className="w-full space-y-3">
            <button
              type="button"
              disabled={!pdpaConsent || isAuthenticating}
              onClick={() => handleGoogleOAuthLogin()}
              className="w-full bg-white hover:bg-white/90 disabled:bg-white/10 disabled:text-text-sub/50 text-[#18181B] font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl cursor-pointer active:scale-95 border border-white/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isAuthenticating ? "กำลังยืนยันตัวตน..." : "Sign in with Google Account (OAuth 2.0)"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAccountChooserModal(true)}
              className="w-full bg-surface hover:bg-white/10 text-text-sub hover:text-text-main border border-white/10 font-bold text-xs py-3 rounded-2xl transition-all"
            >
              สลับเป็นบัญชี Google อื่น ➔
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Auth Success & Workspace Ready */}
      {step === 3 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center w-full z-10 space-y-5">
          <div>
            <h2 className="text-xl font-bold mb-1 text-text-main">เชื่อมต่อสำเร็จเรียบร้อย! 🎉</h2>
            <span className="text-[10px] text-[#10B981] bg-[#10B981]/15 px-3 py-1 rounded-full font-bold border border-[#10B981]/30">
              Google Auth 2.0 Verified
            </span>
          </div>

          <div className="w-44 h-44 relative flex justify-center items-center">
            <Image
              src="/avatar/ready.png"
              alt="Little Bro Setup Ready"
              width={180}
              height={180}
              className="object-contain drop-shadow-2xl"
            />
          </div>

          {/* User Profile Card */}
          <div className="w-full bg-surface/40 border border-white/10 p-3.5 rounded-2xl text-left space-y-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-text-sub font-bold uppercase">Google Account Profile</span>
              <span className="text-[9px] text-[#10B981] font-bold">● Authenticated</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                {(googleEmailInput || "G").substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-text-main truncate">{user?.name || "Master Google User"}</h4>
                <p className="text-[10px] text-text-sub font-mono truncate">{googleEmailInput || user?.email}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinishOnboarding}
            className="w-full bg-[#10B981] hover:bg-[#10B981]/90 text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg shadow-[#10B981]/25 transition-all duration-300 cursor-pointer"
          >
            เข้าสู่หน้าหลักระบบผู้ช่วยส่วนตัว ➔
          </button>
        </div>
      )}

      {/* Account Chooser Modal */}
      {showAccountChooserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fadeIn">
          <div className="bg-surface border border-white/15 w-full max-w-xs rounded-3xl p-5 shadow-2xl space-y-4 text-text-main relative">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-xs font-bold">เลือก / ระบุบัญชี Google Account</h3>
              <button onClick={() => setShowAccountChooserModal(false)} className="text-text-sub text-xs">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-text-sub font-bold block mb-1">ระบุ Google Email ของคุณ:</label>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="เช่น user@gmail.com"
                  className="w-full bg-background border border-white/15 p-3 rounded-xl text-xs text-text-main focus:border-primary focus:outline-none"
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={() => handleGoogleOAuthLogin(googleEmailInput)}
                className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 shadow-md transition-all cursor-pointer"
              >
                ยืนยันและเข้าสู่ระบบด้วย Google ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Dots */}
      <div className="flex gap-1.5 mt-4">
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              step === num ? "bg-primary w-4" : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
