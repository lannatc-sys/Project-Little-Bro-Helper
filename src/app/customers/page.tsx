"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states for adding customer
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_dashboard_data" })
      });
      const data = await res.json();
      if (data.status === "success" && data.data) {
        setCustomers(data.data.customers || []);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      setMessage("⚠️ กรุณาระบุชื่อ-นามสกุล");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_customer",
          full_name: fullName,
          phone_number: phone,
          email,
          contact_info: contactInfo
        })
      });
      const result = await res.json();
      if (result.status === "success") {
        setMessage("✅ บันทึกรายชื่อผู้ติดต่อใหม่สำเร็จเรียบร้อยครับ!");
        setFullName("");
        setPhone("");
        setEmail("");
        setContactInfo("");
        // Reload list
        fetchCustomers();
        // Close modal after delay
        setTimeout(() => {
          setShowAddModal(false);
          setMessage("");
        }, 1500);
      } else {
        setMessage("❌ เกิดข้อผิดพลาด: " + result.message);
      }
    } catch (err: any) {
      setMessage("❌ การเชื่อมต่อหลังบ้านขัดข้อง: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      (c.full_name || "").toLowerCase().includes(query) ||
      (c.phone_number || "").toLowerCase().includes(query) ||
      (c.email || "").toLowerCase().includes(query) ||
      (c.contact_info || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* Header section with back link & Add Button */}
        <header className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm text-text-sub hover:text-text-main transition-colors flex items-center gap-1">
            <span>←</span> กลับหน้าหลัก
          </Link>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#5B5CEB] hover:bg-[#5B5CEB]/90 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>➕</span> เพิ่มผู้ติดต่อ
          </button>
        </header>

        <h2 className="text-xl font-bold mb-6 text-center text-text-main">
          👤 สมุดรายชื่อผู้ติดต่อ (Contacts)
        </h2>

        {/* Search Input Bar */}
        <div className="bg-surface/50 border border-white/5 rounded-2xl p-3 mb-6 flex items-center shadow-md focus-within:border-[#5B5CEB]/50 transition-all duration-300">
          <span className="text-text-sub mr-2">🔍</span>
          <input
            type="text"
            placeholder="ค้นหาชื่อ เบอร์โทร หรืออีเมล..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent w-full focus:outline-none text-xs placeholder-text-sub text-text-main"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="text-text-sub hover:text-text-main text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Customer Listing */}
        {loading ? (
          <div className="text-center py-10 text-xs text-text-sub">
            กำลังดาวน์โหลดสมุดรายชื่อ...
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="space-y-3">
            {filteredCustomers.map((cust) => (
              <div 
                key={cust.customer_id}
                className="p-4 bg-surface/30 border border-white/5 rounded-2xl space-y-3 shadow-sm hover:border-white/10 transition-all duration-200"
              >
                <div>
                  <h4 className="text-xs font-bold text-text-main">{cust.full_name}</h4>
                  {cust.contact_info && (
                    <p className="text-[10px] text-text-sub mt-0.5 leading-relaxed">{cust.contact_info}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[10px] text-text-sub border-t border-white/5 pt-2.5">
                  {cust.phone_number && (
                    <div className="flex items-center gap-1">
                      <span>📞</span>
                      <a 
                        href={`tel:${cust.phone_number}`}
                        className="hover:text-text-main underline font-mono"
                      >
                        {cust.phone_number}
                      </a>
                    </div>
                  )}
                  {cust.email && (
                    <div className="flex items-center gap-1">
                      <span>✉️</span>
                      <a 
                        href={`mailto:${cust.email}`}
                        className="hover:text-text-main underline"
                      >
                        {cust.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Quick actions direct call/email bar */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {cust.phone_number && (
                    <a
                      href={`tel:${cust.phone_number}`}
                      className="bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/25 text-[10px] font-bold py-2 rounded-xl text-center transition-all flex items-center justify-center gap-1"
                    >
                      📞 โทรออกด่วน
                    </a>
                  )}
                  {cust.email && (
                    <a
                      href={`mailto:${cust.email}`}
                      className="bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 text-[#3B82F6] border border-[#3B82F6]/25 text-[10px] font-bold py-2 rounded-xl text-center transition-all flex items-center justify-center gap-1"
                    >
                      ✉️ ส่งเมลผู้ติดต่อ
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-surface/20 border border-dashed border-white/5 rounded-2xl text-center text-xs text-text-sub">
            📭 {searchQuery ? "ไม่พบข้อมูลผู้ติดต่อที่ค้นหาครับ" : "ไม่มีข้อมูลผู้ติดต่อบันทึกในแผ่นงานครับ"}
          </div>
        )}
      </div>

      {/* Add Customer Modal Popup */}
      {showAddModal && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <form 
            onSubmit={handleAddCustomer}
            className="bg-surface border border-white/10 w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col relative text-text-main"
          >
            <button 
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setMessage("");
              }}
              className="absolute top-4 right-4 text-text-sub hover:text-text-main"
            >
              ✕
            </button>
            <h3 className="text-sm font-bold text-text-main mb-4">👤 เพิ่มรายชื่อผู้ติดต่อใหม่</h3>

            <div className="space-y-3.5 mb-6 text-xs">
              <div>
                <label className="block mb-1 font-semibold uppercase text-[9px] text-text-sub">ชื่อ-นามสกุล *</label>
                <input 
                  type="text"
                  placeholder="เช่น สมชาย ใจดี"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-background border border-white/5 p-2.5 rounded-lg text-text-main text-xs focus:outline-none focus:border-[#5B5CEB]/40"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold uppercase text-[9px] text-text-sub">เบอร์โทรศัพท์</label>
                <input 
                  type="text"
                  placeholder="เช่น 0891234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-background border border-white/5 p-2.5 rounded-lg text-text-main text-xs focus:outline-none focus:border-[#5B5CEB]/40 font-mono"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold uppercase text-[9px] text-text-sub">อีเมล</label>
                <input 
                  type="email"
                  placeholder="เช่น customer@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-white/5 p-2.5 rounded-lg text-text-main text-xs focus:outline-none focus:border-[#5B5CEB]/40"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold uppercase text-[9px] text-text-sub">รายละเอียดเพิ่มเติม</label>
                <textarea
                  placeholder="เช่น รายละเอียดหรือข้อมูลสำคัญ..."
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  rows={2}
                  className="w-full bg-background border border-white/5 p-2.5 rounded-lg text-text-main text-xs focus:outline-none focus:border-[#5B5CEB]/40 resize-none"
                />
              </div>
            </div>

            {message && (
              <div className="mb-4 p-3 bg-background/40 border border-white/10 text-[10px] rounded-xl text-center text-text-main">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#5B5CEB] hover:bg-[#5B5CEB]/90 disabled:bg-[#5B5CEB]/50 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังจัดเก็บลง Sheets...
                </>
              ) : (
                "บันทึกรายชื่อติดต่อ 💾"
              )}
            </button>
          </form>
        </div>
      )}

      <footer className="mt-8 text-center text-[10px] text-text-sub/40">
        <p>Little Bro Helper v1.0.0 • Antigravity Product Team</p>
      </footer>
    </div>
  );
}
