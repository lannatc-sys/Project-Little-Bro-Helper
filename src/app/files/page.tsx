"use client";

import { useState } from "react";
import Image from "next/image";

export default function FilesScreen() {
  const [filter, setFilter] = useState("ทั้งหมด");

  const folders = [
    { name: "เอกสาร", items: "12 รายการ", color: "text-[#5B5CEB]" },
    { name: "ใบเสร็จ", items: "34 รายการ", color: "text-[#EF4444]" },
    { name: "รูปภาพ", items: "98 รายการ", color: "text-[#10B981]" },
    { name: "รายงาน", items: "8 รายการ", color: "text-[#F59E0B]" }
  ];

  const recentFiles = [
    { name: "สัญญาเช่าห้อง.pdf", size: "1.2 MB", date: "18/05/2567", icon: "📄" },
    { name: "ใบเสร็จค่าไฟ.pdf", size: "856 KB", date: "19/05/2567", icon: "⚡" },
    { name: "รูปห้องพัก 01.jpg", size: "2.4 MB", date: "18/05/2567", icon: "🖼️" }
  ];

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* Header Section */}
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-text-main">ไฟล์ของบอส</h1>
          <button
            onClick={() => alert("ระบบอัปโหลดไฟล์ไป Google Drive จะเชื่อมต่อในเฟสถัดไปครับบอส!")}
            className="bg-[#5B5CEB] hover:bg-[#5B5CEB]/80 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-all"
          >
            + อัปโหลด
          </button>
        </header>

        {/* Search Bar */}
        <div className="bg-surface/60 border border-white/5 rounded-xl p-3 mb-6 flex items-center">
          <span className="text-text-sub mr-2">🔍</span>
          <input
            type="text"
            placeholder="ค้นหาเอกสาร..."
            className="bg-transparent w-full focus:outline-none text-xs placeholder-text-sub text-text-main"
          />
        </div>

        {/* File Type Filters */}
        <div className="flex bg-surface p-1 rounded-xl border border-white/5 mb-6 justify-between text-center">
          {["ทั้งหมด", "เอกสาร", "รูปภาพ", "PDF", "อื่นๆ"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 text-[10px] py-1.5 rounded-lg transition-all ${
                filter === f
                  ? "bg-[#5B5CEB] text-white font-bold"
                  : "text-text-sub hover:text-text-main"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Folders Grid */}
        <section className="mb-6">
          <h3 className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-3">โฟลเดอร์หลัก</h3>
          <div className="grid grid-cols-2 gap-3">
            {folders.map((folder) => (
              <div key={folder.name} className="bg-surface/40 border border-white/5 p-4 rounded-2xl flex items-center gap-3 hover:bg-surface/60 transition-all cursor-pointer">
                <span className="text-2xl">📁</span>
                <div>
                  <h4 className="text-xs font-bold text-text-main">{folder.name}</h4>
                  <p className="text-[9px] text-text-sub">{folder.items}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Files List */}
        <section className="mb-6">
          <h3 className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-3">ไฟล์อัปโหลดล่าสุด</h3>
          <div className="space-y-2.5">
            {recentFiles.map((file) => (
              <div key={file.name} className="flex items-center justify-between p-3 bg-surface/20 border border-white/5 rounded-xl hover:bg-surface/40 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-xl bg-surface p-2 rounded-lg">{file.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-text-main">{file.name}</h4>
                    <p className="text-[9px] text-text-sub">{file.size} • {file.date}</p>
                  </div>
                </div>
                <span className="text-xs text-text-sub/40">➔</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stance Avatar Card */}
        <div className="bg-surface/40 border border-[#5B5CEB]/25 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-surface flex-shrink-0 border border-white/10">
            <Image
              src="/avatar/store.png"
              alt="Store Stance"
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-main mb-1">คลังจัดเก็บไฟล์ปลอดภัย 📁</h4>
            <p className="text-[10px] text-text-sub leading-relaxed">
              ไฟล์ใบเสร็จและภาพถ่ายห้องพักถูกซิงก์อัปโหลดเก็บไว้ใน Google Drive ส่วนตัวของคุณภายใต้โฟลเดอร์หลัก "Little Bro Helper Files" ปลอดภัยแน่นอนครับ!
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
