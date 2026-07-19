"use client";

import Image from "next/image";

export default function SettingsScreen() {
  const configs = [
    { name: "ข้อมูลพื้นที่ทำงาน (Workspace Data)", desc: "ตั้งค่าไอดีโฟลเดอร์ Google Drive และไอดีชีต", icon: "📁", status: null },
    { name: "การเชื่อมต่อภายนอก (Connections)", desc: "Google Drive, Sheets, Calendar", icon: "🔗", status: "เชื่อมต่อแล้ว ✅" },
    { name: "ระบบการแจ้งเตือน (Notifications)", desc: "ตั้งเวลาแจ้งเตือนคิวงานและใบแจ้งหนี้ผ่านบอท", icon: "🔔", status: "เปิดใช้งาน" },
    { name: "ผู้ใช้งานและสิทธิ์ (Users & Permissions)", desc: "จัดการรายชื่อสมาชิกที่มีสิทธิ์ป้อนธุรกรรมทางการเงิน", icon: "👥", status: "1 สิทธิ์เข้าถึง" },
    { name: "สำรองข้อมูล (Backup Data)", desc: "สร้างไฟล์สำรองข้อมูล JSON และส่งออกตารางทั้งหมด", icon: "💾", status: null },
    { name: "เกี่ยวกับระบบ (About)", desc: "Little Bro Helper เวอร์ชัน 1.0.0", icon: "ℹ️", status: null }
  ];

  return (
    <div className="min-h-screen bg-[#09090B] p-6 text-white font-sans flex flex-col justify-between">
      <div>
        {/* Header Section */}
        <header className="mb-6">
          <h1 className="text-xl font-bold text-white">ตั้งค่าระบบ</h1>
        </header>

        {/* Profile Card */}
        <div className="bg-[#18181B]/40 border border-white/5 p-4 rounded-2xl mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#5B5CEB]/30 bg-[#18181B]">
            <Image
              src="/avatar/hello.png"
              alt="Owner Avatar"
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">Little Bro</h3>
            <p className="text-[9px] text-[#B3B3B3] mb-1">เจ้าของธุรกิจ • littlebro.owner@gmail.com</p>
            <button
              onClick={() => alert("ระบบเชื่อมต่อ Google OAuth จะเปิดในเฟสถัดไปครับบอส!")}
              className="bg-[#5B5CEB]/25 hover:bg-[#5B5CEB]/40 text-[#5B5CEB] border border-[#5B5CEB]/30 text-[9px] font-semibold px-2.5 py-1 rounded-lg transition-all"
            >
              จัดการบัญชี Google
            </button>
          </div>
        </div>

        {/* Configuration List */}
        <section className="mb-6">
          <h3 className="text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider mb-3">การตั้งค่าทั่วไป</h3>
          <div className="space-y-2.5">
            {configs.map((config) => (
              <div
                key={config.name}
                onClick={() => alert(`ฟีเจอร์ ${config.name} จะสามารถจัดการได้ในเฟสถัดไปครับบอส!`)}
                className="p-3 bg-[#18181B]/20 border border-white/5 rounded-xl hover:bg-[#18181B]/40 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg bg-[#18181B] p-2 rounded-lg">{config.icon}</span>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{config.name}</h4>
                    <p className="text-[9px] text-[#B3B3B3]">{config.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  {config.status && (
                    <span className="text-[9px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded-full font-semibold">
                      {config.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stance Avatar Card */}
        <div className="bg-[#18181B]/40 border border-[#5B5CEB]/25 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-[#18181B] flex-shrink-0 border border-white/10">
            <Image
              src="/avatar/manageable.png"
              alt="Manage Stance"
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white mb-1">ความลับทางธุรกิจเป็นสิ่งสำคัญ! 🔒</h4>
            <p className="text-[10px] text-[#B3B3B3] leading-relaxed">
              ข้อมูลทุกอย่างของบอสจะถูกส่งตรงไปที่คลังข้อมูลส่วนตัวโดยไม่ผ่านเซิร์ฟเวอร์คนกลาง ปลอดภัยและเป็นส่วนตัว 100% ครับ!
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-[10px] text-[#B3B3B3]/40">
        <p>Little Bro Helper v1.0.0 • Antigravity Product Team</p>
      </footer>
    </div>
  );
}
