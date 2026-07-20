"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGoogleAuth } from "@/components/GoogleAuthProvider";
import { PrivacyPolicyModal } from "@/components/PrivacyPolicyModal";

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, signInWithGoogle } = useGoogleAuth();

  const [step, setStep] = useState(1);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  // Credentials
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pdpaConsent, setPdpaConsent] = useState(true);

  // Prefill saved email
  useEffect(() => {
    if (user?.email) {
      setEmailInput(user.email);
    } else {
      const savedEmail = localStorage.getItem("little_bro_email") || "lannatc@gmail.com";
      setEmailInput(savedEmail);
    }
  }, [user]);

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!emailInput || !emailInput.includes("@")) {
      setErrorMessage("⚠️ กรุณากรอกอีเมลให้ถูกต้องครับ (เช่น user@gmail.com)");
      return;
    }
    if (!passwordInput || passwordInput.length < 4) {
      setErrorMessage("⚠️ กรุณากรอกรหัสผ่านอย่างน้อย 4 หลักขึ้นไปครับ");
      return;
    }

    setIsAuthenticating(true);
    try {
      // Authenticate & save user session
      const profile = await signInWithGoogle(emailInput);
      localStorage.setItem("little_bro_password", passwordInput);
      
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

      setStep(3); // Go to Success Screen
    } catch (err: any) {
      setErrorMessage("❌ เข้าสู่ระบบล้มเหลว: " + err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleQuickGoogleOAuth = async () => {
    setIsAuthenticating(true);
    setErrorMessage("");
    try {
      const targetEmail = emailInput || "lannatc@gmail.com";
      const profile = await signInWithGoogle(targetEmail);
      setStep(3);
    } catch (err: any) {
      setErrorMessage("❌ ไม่สามารถเข้าสู่ระบบ Google ได้: " + err.message);
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
              <span>🔒</span> Little Bro Secure Portal
            </span>
            <h1 className="text-xl font-black tracking-tight leading-tight text-text-main">
              ผู้ช่วยส่วนตัวและการเงินอัจฉริยะ 🧠
            </h1>
            <p className="text-xs text-text-sub mt-1">
              ระบบเข้าสู่ระบบด้วย Email, Password และ Google Auth 2.0
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
              <span className="text-xl bg-surface p-2 rounded-xl border border-white/10 shrink-0">📧</span>
              <div>
                <h4 className="text-xs font-bold text-text-main">เข้าสู่ระบบด้วย Email & Password</h4>
                <p className="text-[10px] text-text-sub leading-relaxed">เข้าใช้งานด้วยอีเมลและรหัสผ่านส่วนตัว พร้อมซิงก์ข้อมูลตรงลง Google Sheets & Drive ส่วนตัว</p>
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
            <span>ไปหน้าเข้าสู่ระบบ ➔</span>
          </button>
        </div>
      )}

      {/* STEP 2: Email & Password Login Screen */}
      {step === 2 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center w-full z-10 space-y-5 my-auto">
          <div>
            <h2 className="text-xl font-bold mb-1 text-text-main">
              {authMode === "signin" ? "เข้าสู่ระบบ (Sign In)" : "สมัครสมาชิกใหม่ (Sign Up)"}
            </h2>
            <p className="text-xs text-text-sub max-w-xs mx-auto">
              กรอก Email และ Password เพื่อเข้าใช้งาน Little Bro Assistant
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="w-full bg-surface/50 border border-white/10 p-1 rounded-2xl flex text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode("signin"); setErrorMessage(""); }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                authMode === "signin" ? "bg-primary text-white shadow-md" : "text-text-sub hover:text-text-main"
              }`}
            >
              🔑 เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("signup"); setErrorMessage(""); }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                authMode === "signup" ? "bg-primary text-white shadow-md" : "text-text-sub hover:text-text-main"
              }`}
            >
              ✨ สมัครสมาชิกใหม่
            </button>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="w-full p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-[11px] text-red-400 font-semibold text-center animate-fadeIn">
              {errorMessage}
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleEmailPasswordLogin} className="w-full space-y-3.5 text-left">
            <div>
              <label className="text-[10px] text-text-main font-bold block mb-1">
                อีเมล (Email Address):
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="เช่น user@gmail.com"
                  className="w-full bg-surface border border-white/15 p-3.5 rounded-2xl text-xs text-text-main focus:border-primary focus:outline-none pr-10 shadow-inner"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-sub text-sm">✉️</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-text-main font-bold block mb-1">
                รหัสผ่าน (Password):
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="กรอกรหัสผ่านอย่างน้อย 4 หลัก..."
                  className="w-full bg-surface border border-white/15 p-3.5 rounded-2xl text-xs text-text-main focus:border-primary focus:outline-none pr-10 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-sub hover:text-text-main text-xs"
                >
                  {showPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>

            {/* PDPA Checkbox with clickable Privacy Policy Modal Link */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={pdpaConsent}
                onChange={(e) => setPdpaConsent(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-primary border-white/20 bg-transparent focus:ring-0 cursor-pointer"
              />
              <span className="text-[10px] text-text-sub leading-relaxed">
                ฉันยอมรับ{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPrivacyModal(true);
                  }}
                  className="text-primary underline font-bold hover:text-white"
                >
                  นโยบายความเป็นส่วนตัว (Privacy Policy)
                </button>{" "}
                และข้อตกลงการซิงก์ข้อมูลส่วนตัว
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!pdpaConsent || isAuthenticating}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold text-xs py-3.5 rounded-2xl shadow-xl shadow-primary/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isAuthenticating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>กำลังอนุมัติเข้าใช้งาน...</span>
                </>
              ) : (
                <span>{authMode === "signin" ? "เข้าสู่ระบบ (Sign In) ➔" : "สร้างบัญชีใหม่ (Create Account) ➔"}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-text-sub font-semibold">หรือ</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google OAuth Quick Button */}
          <button
            type="button"
            disabled={isAuthenticating}
            onClick={handleQuickGoogleOAuth}
            className="w-full bg-white hover:bg-white/90 text-[#18181B] font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer border border-white/20 active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>เข้าสู่ระบบด้วย Google Account</span>
          </button>
        </div>
      )}

      {/* STEP 3: Success Screen (Auto-Approved) */}
      {step === 3 && (
        <div className="flex-1 flex flex-col justify-center items-center text-center w-full z-10 space-y-5 my-auto">
          <div>
            <h2 className="text-xl font-bold mb-1 text-text-main">อนุมัติเข้าใช้งานสำเร็จ! 🎉</h2>
            <span className="text-[10px] text-[#10B981] bg-[#10B981]/15 px-3 py-1 rounded-full font-bold border border-[#10B981]/30">
              ● Auto-Approved & Ready
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

          {/* User Profile Summary Card */}
          <div className="w-full bg-surface/40 border border-white/10 p-3.5 rounded-2xl text-left space-y-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-text-sub font-bold uppercase">Account Session</span>
              <span className="text-[9px] text-[#10B981] font-bold">● Active</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                {(emailInput || "U").substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-text-main truncate">{user?.name || "Member Account"}</h4>
                <p className="text-[10px] text-text-sub font-mono truncate">{emailInput || user?.email}</p>
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

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

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
