"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AddExpenseForm() {
  const searchParams = useSearchParams();
  const [isIncome, setIsIncome] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("ค่าอาหาร");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load transaction type from query params
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "income") {
      setIsIncome(true);
      setCategory("ค่าเช่าห้องพัก");
    } else {
      setIsIncome(false);
      setCategory("ค่าอาหาร");
    }
  }, [searchParams]);

  // Handle toggling manually on the page
  const toggleType = (toIncome: boolean) => {
    setIsIncome(toIncome);
    setCategory(toIncome ? "ค่าเช่าห้องพัก" : "ค่าอาหาร");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const categories = isIncome
    ? ["ค่าเช่าห้องพัก", "ค่าบริการ", "ขายสินค้า", "รายได้อื่นๆ"]
    : ["ค่าน้ำมันรถ", "ค่าอาหาร", "ค่าสิ่งของ", "ค่าสาธารณูปโภค"];

  const submitTransaction = async () => {
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
          transaction_type: isIncome ? "Income" : "Expense",
          action: isIncome ? "add_income" : "add_expense"
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

  const themeColor = isIncome ? "#10B981" : "#EF4444";
  const themeBgClass = isIncome ? "bg-[#10B981]" : "bg-[#EF4444]";
  const themeHoverBgClass = isIncome ? "hover:bg-[#10B981]/80" : "hover:bg-[#EF4444]/80";
  const themeTextClass = isIncome ? "text-[#10B981]" : "text-[#EF4444]";
  const themeBorderClass = isIncome ? "border-[#10B981]" : "border-[#EF4444]";
  const themeFocusClass = isIncome ? "focus:border-[#10B981]" : "focus:border-[#EF4444]";

  return (
    <div className="min-h-screen bg-[#09090B] p-6 text-white font-sans flex flex-col justify-between">
      <div>
        {/* Header with Back Button */}
        <header className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm text-[#B3B3B3] hover:text-white transition-colors flex items-center gap-1">
            <span>←</span> กลับหน้าหลัก
          </Link>
          
          <div className="flex bg-[#18181B] border border-white/5 p-1 rounded-xl">
            <button
              onClick={() => toggleType(true)}
              className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                isIncome ? "bg-[#10B981] text-white" : "text-[#B3B3B3] hover:text-white"
              }`}
            >
              รายรับ
            </button>
            <button
              onClick={() => toggleType(false)}
              className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                !isIncome ? "bg-[#EF4444] text-white" : "text-[#B3B3B3] hover:text-white"
              }`}
            >
              รายจ่าย
            </button>
          </div>
        </header>

        <h2 className={`text-xl font-bold mb-6 text-center ${themeTextClass}`}>
          {isIncome ? "เพิ่มรายการรายรับ" : "เพิ่มรายการรายจ่าย"}
        </h2>
        
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
            className={`bg-[#18181B] border border-white/10 text-center text-xl rounded-xl p-3 w-full focus:outline-none transition-all duration-300 placeholder-[#B3B3B3] ${themeFocusClass}`}
          />
        </div>

        {/* Quick Category Grid Selection */}
        <div className="mb-4">
          <label className="text-xs text-[#B3B3B3] font-semibold uppercase tracking-wider block mb-3">
            {isIncome ? "หมวดหมู่รายรับ" : "หมวดหมู่รายจ่าย"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => {
              const isActive = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-3 rounded-xl border text-sm transition-all duration-200 ${
                    isActive
                      ? isIncome
                        ? "bg-[#10B981]/20 border-[#10B981] text-[#10B981] font-bold shadow-md shadow-[#10B981]/10"
                        : "bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444] font-bold shadow-md shadow-[#EF4444]/10"
                      : "bg-[#18181B]/60 border-white/5 text-[#B3B3B3] hover:border-white/20"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes Input */}
        <div className="mb-6">
          <label className="text-xs text-[#B3B3B3] font-semibold uppercase tracking-wider block mb-2">คำอธิบายเพิ่มเติม</label>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={isIncome ? "เช่น ค่าเช่าห้อง 201, ค่าขายน้ำส้ม..." : "เช่น ข้าวกะเพราไข่ดาว, น้ำมันดีเซล..."}
            className={`bg-[#18181B] border border-white/5 p-4 rounded-xl w-full focus:outline-none text-sm text-[#FFFFFF] transition-colors placeholder-[#B3B3B3]/60 ${
              isIncome ? "focus:border-[#10B981]/50" : "focus:border-[#EF4444]/50"
            }`}
          />
        </div>
      </div>

      <div>
        {/* On-Screen Status Messages */}
        {errorMessage && (
          <div className={`mb-4 p-3 bg-opacity-10 border text-xs rounded-xl text-center ${
            isIncome ? "bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]" : "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]"
          }`}>
            ⚠️ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs rounded-xl text-center">
            ✅ {successMessage}
          </div>
        )}

        <button
          onClick={submitTransaction}
          disabled={loading}
          className={`${themeBgClass} ${themeHoverBgClass} text-white font-bold p-4 rounded-2xl w-full transition-all transform active:scale-95 flex justify-center items-center gap-2 ${
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
          ) : isIncome ? (
            "บันทึกรายรับลงแผ่นงาน"
          ) : (
            "บันทึกรายจ่ายลงแผ่นงาน"
          )}
        </button>
      </div>
    </div>
  );
}

export default function AddExpenseScreen() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
        กำลังโหลด...
      </div>
    }>
      <AddExpenseForm />
    </Suspense>
  );
}
