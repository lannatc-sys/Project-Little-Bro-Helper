"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function AddExpenseForm() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isIncome, setIsIncome] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("ค่าอาหาร");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Receipt attachment states
  const [fileUrl, setFileUrl] = useState("");
  const [fileUploading, setFileUploading] = useState(false);

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
    setFileUrl("");
  };

  const categories = isIncome
    ? ["ค่าเช่าห้องพัก", "ค่าบริการ", "ขายสินค้า", "รายได้อื่นๆ"]
    : ["ค่าน้ำมันรถ", "ค่าอาหาร", "ค่าสิ่งของ", "ค่าสาธารณูปโภค"];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFileUploading(true);
    setErrorMessage("");
    setSuccessMessage("");
    const reader = new FileReader();

    reader.onload = async () => {
      const base64String = (reader.result as string).split(",")[1];
      try {
        const res = await fetch("/api/expense", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "upload_file",
            file_data: base64String,
            file_name: selectedFile.name,
            mime_type: selectedFile.type
          })
        });
        const result = await res.json();
        if (result.status === "success" && result.file_url) {
          setFileUrl(result.file_url);
        } else {
          setErrorMessage("อัปโหลดสลิปไม่สำเร็จ: " + result.message);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMessage("การเชื่อมต่อล้มเหลวขณะอัปโหลดสลิป");
      } finally {
        setFileUploading(false);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

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
          file_attachment_url: fileUrl, // Real Google Drive link!
          transaction_type: isIncome ? "Income" : "Expense",
          action: isIncome ? "add_income" : "add_expense"
        })
      });

      const data = await res.json();
      if (data.status === "success") {
        setSuccessMessage(data.message);
        setAmount("");
        setDesc("");
        setFileUrl("");
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

  const themeBgClass = isIncome ? "bg-[#10B981]" : "bg-[#EF4444]";
  const themeHoverBgClass = isIncome ? "hover:bg-[#10B981]/80" : "hover:bg-[#EF4444]/80";
  const themeTextClass = isIncome ? "text-[#10B981]" : "text-[#EF4444]";
  const themeFocusClass = isIncome ? "focus:border-[#10B981]" : "focus:border-[#EF4444]";

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* Header with Back Button */}
        <header className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-sm text-text-sub hover:text-text-main transition-colors flex items-center gap-1">
            <span>←</span> กลับหน้าหลัก
          </Link>
          
          <div className="flex bg-surface border border-white/5 p-1 rounded-xl">
            <button
              onClick={() => toggleType(true)}
              className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                isIncome ? "bg-[#10B981] text-white" : "text-text-sub hover:text-text-main"
              }`}
            >
              รายรับ
            </button>
            <button
              onClick={() => toggleType(false)}
              className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                !isIncome ? "bg-[#EF4444] text-white" : "text-text-sub hover:text-text-main"
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
          <span className="text-4xl font-bold block mb-4 text-text-main font-mono">
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
            className={`bg-surface border border-white/10 text-center text-xl rounded-xl p-3 w-full focus:outline-none transition-all duration-300 placeholder-text-sub ${themeFocusClass}`}
          />
        </div>

        {/* Quick Category Grid Selection */}
        <div className="mb-4">
          <label className="text-xs text-text-sub font-semibold uppercase tracking-wider block mb-3">
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
                      : "bg-surface/60 border-white/5 text-text-sub hover:border-white/20"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes Input */}
        <div className="mb-4">
          <label className="text-xs text-text-sub font-semibold uppercase tracking-wider block mb-2">คำอธิบายเพิ่มเติม</label>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={isIncome ? "เช่น ค่าเช่าห้อง 201, ค่าขายน้ำส้ม..." : "เช่น ข้าวกะเพราไข่ดาว, น้ำมันดีเซล..."}
            className={`bg-surface border border-white/5 p-4 rounded-xl w-full focus:outline-none text-sm text-[#FFFFFF] transition-colors placeholder-text-sub/60 ${
              isIncome ? "focus:border-[#10B981]/50" : "focus:border-[#EF4444]/50"
            }`}
          />
        </div>

        {/* File Receipt Attachment Input */}
        <div className="mb-6">
          <label className="text-[10px] text-text-sub font-semibold uppercase tracking-wider block mb-2">
            📄 แนบหลักฐานเอกสาร (สลิป/ใบเสร็จ)
          </label>
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              accept="image/*,application/pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={fileUploading}
              className="bg-surface border border-white/10 hover:border-white/20 text-text-main text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              {fileUploading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-text-main" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังบันทึกสลิป...
                </>
              ) : fileUrl ? (
                "เปลี่ยนภาพหลักฐาน 🔄"
              ) : (
                "เลือกสลิป/สแกน 📸"
              )}
            </button>

            {fileUrl && (
              <a 
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#5B5CEB] underline hover:text-[#5B5CEB]/80 truncate max-w-[170px]"
              >
                เปิดไฟล์หลักฐาน Google Drive ➔
              </a>
            )}
          </div>
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
          disabled={loading || fileUploading}
          className={`${themeBgClass} ${themeHoverBgClass} text-white font-bold p-4 rounded-2xl w-full transition-all transform active:scale-95 flex justify-center items-center gap-2 ${
            loading || fileUploading ? "opacity-50 cursor-not-allowed" : ""
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
      <div className="min-h-screen bg-background flex items-center justify-center text-text-main">
        กำลังโหลด...
      </div>
    }>
      <AddExpenseForm />
    </Suspense>
  );
}
