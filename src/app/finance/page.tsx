"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export default function FinanceScreen() {
  const [activeTab, setActiveTab] = useState("ภาพรวม");
  
  const categories = [
    { name: "ค่าอาหาร", amount: "฿3,240", percent: 40, color: "bg-[#5B5CEB]" },
    { name: "ค่าน้ำไฟ", amount: "฿2,120", percent: 26, color: "bg-[#EF4444]" },
    { name: "เดินทาง", amount: "฿1,560", percent: 19, color: "bg-[#10B981]" },
    { name: "อื่นๆ", amount: "฿1,230", percent: 15, color: "bg-[#F59E0B]" }
  ];

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* Header Section */}
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-text-main">การเงิน</h1>
          <div className="flex gap-2">
            <Link href="/add-expense?type=expense" className="bg-[#EF4444] hover:bg-[#EF4444]/80 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-all">
              + รายจ่าย
            </Link>
          </div>
        </header>

        {/* Tab Headers */}
        <div className="flex bg-surface p-1.5 rounded-xl border border-white/5 mb-6 justify-between text-center">
          {["ภาพรวม", "รายรับ", "รายจ่าย", "โอนเงิน"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-[11px] py-1.5 rounded-lg transition-all ${
                activeTab === tab
                  ? "bg-[#5B5CEB] text-white font-bold"
                  : "text-text-sub hover:text-text-main"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Month Selector */}
        <div className="flex justify-between items-center mb-6">
          <button className="text-text-sub hover:text-text-main">◀</button>
          <span className="text-xs font-semibold">เดือนพฤษภาคม 2567</span>
          <button className="text-text-sub hover:text-text-main">▶</button>
        </div>

        {/* Net Profit Display */}
        <div className="bg-surface/40 backdrop-blur-lg border border-white/5 p-4 rounded-2xl mb-6 text-center relative overflow-hidden">
          <span className="text-[10px] text-text-sub block mb-1">ยอดรวมสุทธิ</span>
          <span className="text-3xl font-extrabold text-[#10B981] block mb-1">฿4,280</span>
          <span className="text-[10px] text-[#10B981] font-semibold bg-[#10B981]/15 px-2.5 py-0.5 rounded-full">+18% จากเดือนที่แล้ว</span>
        </div>

        {/* Net Profit SVG Chart (Mockup representation) */}
        <div className="bg-surface/20 border border-white/5 p-4 rounded-2xl mb-6">
          <h3 className="text-xs text-text-sub mb-3">กราฟสรุปกำไรสุทธิ</h3>
          <div className="h-28 w-full flex items-end justify-center relative">
            <svg className="w-full h-24" viewBox="0 0 100 30" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="currentColor" strokeWidth="0.05" strokeDasharray="1" className="text-text-sub/20" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="0.05" strokeDasharray="1" className="text-text-sub/20" />
              {/* Flow line */}
              <path
                d="M 0 25 Q 25 15 50 18 T 100 5"
                fill="none"
                stroke="#5B5CEB"
                strokeWidth="1"
                strokeLinecap="round"
              />
              {/* Highlight Point */}
              <circle cx="100" cy="5" r="2" fill="#10B981" />
            </svg>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-surface/40 border border-white/5 p-4 rounded-2xl">
            <h3 className="text-[10px] text-text-sub mb-1">รายรับ</h3>
            <p className="text-base font-bold text-[#10B981]">฿12,450</p>
            <span className="text-[9px] text-[#10B981] font-semibold">+12%</span>
          </div>
          <div className="bg-surface/40 border border-white/5 p-4 rounded-2xl">
            <h3 className="text-[10px] text-text-sub mb-1">รายจ่าย</h3>
            <p className="text-base font-bold text-[#EF4444]">฿8,170</p>
            <span className="text-[9px] text-[#EF4444] font-semibold">+6%</span>
          </div>
        </div>

        {/* Categories List with Progress Bars */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-4">หมวดหมู่รายจ่าย</h2>
          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-text-main">{cat.name}</span>
                  <span className="text-text-main">{cat.amount} <span className="text-text-sub/60 text-[10px]">({cat.percent}%)</span></span>
                </div>
                <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                  <div
                    className={`${cat.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stance Avatar Card (AI insight) */}
        <div className="bg-surface/40 border border-[#5B5CEB]/25 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-surface flex-shrink-0 border border-white/10">
            <Image
              src="/avatar/analyze.png"
              alt="Analyze Stance"
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-main mb-1">วิเคราะห์ทางการเงิน 🧠</h4>
            <p className="text-[10px] text-text-sub leading-relaxed">
              เดือนนี้รายจ่ายส่วนใหญ่หมดไปกับ "ค่าอาหาร" (40% ของยอดรวม) ผมแนะนำให้คุมส่วนนี้ และเร่งรายรับจาก Little Bro Hostel เพิ่มเติมครับบอส!
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-[10px] text-text-sub/40">
        <p>Little Bro Helper v1.0.0 • Antigravity Product Team</p>
      </footer>
    </div>
  );
}
