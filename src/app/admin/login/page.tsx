"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (emailInput.trim().toLowerCase() !== "lannatc@gmail.com") {
      setErrorMessage("⛔ ปฏิเสธการเข้าถึง: บัญชีอีเมลนี้ไม่มีสิทธิ์ผู้ดูแลระบบ (Admin Only)");
      return;
    }

    if (!passwordInput || passwordInput.length < 4) {
      setErrorMessage("⚠️ กรุณากรอกรหัสผ่านผ่านระบบให้ถูกต้อง");
      return;
    }

    setIsLoading(true);
    try {
      // Set secure admin session cookies
      document.cookie = "little_bro_admin_session=true; path=/; max-age=86400; SameSite=Lax";
      document.cookie = `little_bro_email=${emailInput}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem("little_bro_email", emailInput);
      localStorage.setItem("little_bro_admin_session", "true");

      router.push("/admin/dashboard");
    } catch (err: any) {
      setErrorMessage("❌ เกิดข้อผิดพลาดในการเข้าสู่ระบบ: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] p-6 text-white font-sans flex flex-col justify-center items-center relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#DAA520]/15 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-surface/50 border border-white/15 backdrop-blur-xl p-6 rounded-3xl shadow-2xl space-y-5 z-10 relative">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-[#DAA520]/20 border border-[#DAA520]/40 text-[#DAA520] px-3.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
            <span>👑</span> Restricted Admin Console
          </div>
          <h1 className="text-2xl font-black text-white">ระบบเข้าสู่ระบบแอดมิน 👑</h1>
          <p className="text-xs text-text-sub">เฉพาะผู้ดูแลระบบระบบสูงสุด (lannatc@gmail.com) เท่านั้น</p>
        </div>

        {/* Mascot Avatar */}
        <div className="w-20 h-20 mx-auto rounded-full bg-surface border border-white/10 flex items-center justify-center shadow-lg relative">
          <Image
            src="/avatar/shan.png"
            alt="Admin Portal"
            width={64}
            height={64}
            className="object-contain scale-110"
          />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-[11px] text-red-400 font-semibold text-center animate-fadeIn">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-3.5 text-left">
          <div>
            <label className="text-[10px] font-bold text-text-main block mb-1">
              Admin Email Address:
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="lannatc@gmail.com"
              className="w-full bg-surface border border-white/15 p-3.5 rounded-2xl text-xs text-white focus:border-[#DAA520] focus:outline-none shadow-inner"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-main block mb-1">
              Admin Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="กรอกรหัสผ่านผู้ดูแลระบบ..."
                className="w-full bg-surface border border-white/15 p-3.5 rounded-2xl text-xs text-white focus:border-[#DAA520] focus:outline-none pr-10 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-sub hover:text-white text-xs cursor-pointer"
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#DAA520] hover:bg-[#DAA520]/90 text-black font-bold text-xs py-3.5 rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                <span>กำลังยืนยันสิทธิ์...</span>
              </>
            ) : (
              <span>เข้าสู่แอดมินแดชบอร์ด 👑 ➔</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
