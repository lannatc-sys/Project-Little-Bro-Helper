"use client";

import React from "react";
import Image from "next/image";
import { THEMES } from "./ClientWrapper";

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onSelectTheme: (themeId: string) => void;
}

export default function ThemeSelectorModal({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme
}: ThemeSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🎨</span>
              <h2 className="text-base font-bold text-text-main">เลือกธีมระบบ (Theme Settings)</h2>
            </div>
            <p className="text-xs text-text-sub mt-0.5">
              เลือกสไตล์หน้าต่างการใช้งานและเอกลักษณ์ของ Little Bro
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-sub hover:text-text-main p-1.5 rounded-full hover:bg-white/5 transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* Shan Heritage Highlight Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#C46210]/20 via-[#DAA520]/20 to-[#3D2B1F]/20 border border-[#DAA520]/30 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FAF4ED] border border-[#DAA520]/40 overflow-hidden flex items-center justify-center shrink-0 shadow-sm avatar-container">
            <Image
              src="/avatar/shan.png"
              alt="Little Bro Shan"
              width={44}
              height={44}
              className="object-cover scale-110 opacity-100 avatar-img"
            />
          </div>
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-[#DAA520]/30 text-[#C46210] font-bold text-[9px] mb-0.5">
              ✨ Recommended Theme
            </span>
            <h4 className="text-xs font-bold text-text-main">ธีม พี่น้องชาวไทยใหญ่ (Shan Heritage)</h4>
            <p className="text-[10px] text-text-sub leading-tight">
              เอกลักษณ์ผ้าทอ ลวดลายทองโบราณ พร้อมมาสคอตน้อง Little Bro ชุดไทยใหญ่
            </p>
          </div>
        </div>

        {/* Theme Grid List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {THEMES.map((t) => {
            const isSelected = currentTheme === t.id;
            const isShan = t.id.startsWith("shan");

            return (
              <div
                key={t.id}
                onClick={() => onSelectTheme(t.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-lg ring-1 ring-primary/50"
                    : "border-white/5 bg-surface/40 hover:bg-surface/80 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Theme Color Palette Preview */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-inner relative overflow-hidden"
                    style={{ backgroundColor: t.previewBg }}
                  >
                    <div
                      className="w-4 h-4 rounded-full shadow-md"
                      style={{ backgroundColor: t.previewPrimary }}
                    />
                    {isShan && (
                      <span className="absolute bottom-0 right-0 text-[9px] bg-[#DAA520] text-black px-1 font-bold rounded-tl">
                        Shan
                      </span>
                    )}
                  </div>

                  {/* Theme Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-text-main">{t.name}</h3>
                      {t.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface border border-white/10 text-text-sub">
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-sub mt-0.5">{t.description}</p>
                  </div>
                </div>

                {/* Radio Check Indicator */}
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                  isSelected ? "border-primary bg-primary text-white" : "border-white/20 text-transparent"
                }`}>
                  ✓
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:opacity-90 transition-all shadow-md cursor-pointer"
          >
            ตกลงและใช้งานธีมนี้
          </button>
        </div>
      </div>
    </div>
  );
}
