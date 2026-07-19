"use client";

import Link from "next/link";
import { useState } from "react";

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("ค่าอาหาร");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const submitExpense = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!amount || Number(amount) <= 0) {
      setErrorMessage("กรุณากรอกจำนวนเงินให้ถูกต้อง (มากกว่า 0 บาท)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: Number(amount),
          category,
          description: desc,
          transaction_type: "Expense",
          action: "add_expense"
        })
      });

      const data = await res.json();
      if (data.status === "success") {
        setSuccessMessage(data.message + (data.mocked ? " (โหมดทดสอบ UI)" : ""));
        setAmount("");
        setDesc("");
      } else {
        setErrorMessage("เกิดข้อผิดพลาด: " + data.message);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("ไม่สามารถเชื่อมต่อระบบหลังบ้านได้: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] p-6 text-white font-sans flex flex-col justify-between">
      <div>
        {/* Header with Back Button */}
        <header className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm text-[#B3B3B3] hover:text-white transition-colors flex items-center gap-1">
            <span>←</span> กลับหน้าหลัก
          </Link>
          <span className="text-xs bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 px-3 py-1 rounded-full font-mono uppercase">
            Expense
          </span>
        </header>

        <h2 className="text-xl font-bold mb-6 text-center text-[#EF4444]">เพิ่มรายการรายจ่าย</h2>
        
        {/* Large Currency Input Area */}
        <div className="text-center mb-8">
          <span className="text-4xl font-bold block mb-4 text-white font-mono">
            ฿ {amount ? Number(amount).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setErrorMessage("");
            }}
            placeholder="0.00"
            className="bg-[#18181B] border border-white/10 text-center text-xl rounded-xl p-3 w-full focus:border-[#EF4444] focus:outline-none transition-all duration-300 placeholder-[#B3B3B3]"
          />
        </div>

        {/* Quick Category Grid Selection */}
        <div className="mb-4">
          <label className="text-xs text-[#B3B3B3] font-semibold uppercase tracking-wider block mb-3">หมวดหมู่รายจ่าย</label>
          <div className="grid grid-cols-2 gap-2">
            {["ค่าน้ำมันรถ", "ค่าอาหาร", "ค่าสิ่งของ", "ค่าสาธารณูปโภค"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`p-3 rounded-xl border text-sm transition-all duration-200 ${
                  category === cat
                    ? "bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444] font-bold shadow-md shadow-[#EF4444]/10"
                    : "bg-[#18181B]/60 border-white/5 text-[#B3B3B3] hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Input */}
        <div className="mb-6">
          <label className="text-xs text-[#B3B3B3] font-semibold uppercase tracking-wider block mb-2">คำอธิบายเพิ่มเติม</label>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="เช่น ข้าวกะเพราไข่ดาว, น้ำมันดีเซล..."
            className="bg-[#18181B] border border-white/5 p-4 rounded-xl w-full focus:outline-none text-sm text-[#FFFFFF] focus:border-[#EF4444]/50 transition-colors placeholder-[#B3B3B3]/60"
          />
        </div>
      </div>

      <div>
        {/* On-Screen Status Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs rounded-xl text-center">
            ⚠️ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs rounded-xl text-center">
            ✅ {successMessage}
          </div>
        )}

        <button
          onClick={submitExpense}
          disabled={loading}
          className={`bg-[#EF4444] hover:bg-[#EF4444]/80 text-white font-bold p-4 rounded-2xl w-full transition-all transform active:scale-95 flex justify-center items-center gap-2 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังบันทึกรายการ...
            </>
          ) : (
            "บันทึกรายจ่ายลงแผ่นงาน"
          )}
        </button>
      </div>
    </div>
  );
}
