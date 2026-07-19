"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function FinanceScreen() {
  const [activeTab, setActiveTab] = useState("ภาพรวม");
  const [loading, setLoading] = useState(true);
  const [incomeSum, setIncomeSum] = useState(0);
  const [expenseSum, setExpenseSum] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchFinanceData = async () => {
    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_dashboard_data" })
      });
      const result = await res.json();
      
      if (result.status === "success" && result.data) {
        const { finance = [] } = result.data;
        setTransactions(finance);
        
        let inc = 0;
        let exp = 0;
        const catMap: { [key: string]: number } = {};
        
        finance.forEach((item: any) => {
          const amt = Number(item.amount || 0);
          if (item.transaction_type === "Income") {
            inc += amt;
          } else if (item.transaction_type === "Expense") {
            exp += amt;
            const cat = item.category || "อื่นๆ";
            catMap[cat] = (catMap[cat] || 0) + amt;
          }
        });

        setIncomeSum(inc);
        setExpenseSum(exp);

        // Convert category map to list with percentages
        const catList = Object.keys(catMap).map((name) => {
          const amt = catMap[name];
          const pct = exp > 0 ? Math.round((amt / exp) * 100) : 0;
          return { name, amount: `฿${amt.toLocaleString("th-TH")}`, percent: pct };
        });

        // Sort categories by amount desc
        catList.sort((a, b) => b.percent - a.percent);
        
        // Define theme colors for categories
        const colors = ["bg-[#5B5CEB]", "bg-[#EF4444]", "bg-[#10B981]", "bg-[#F59E0B]"];
        const categoriesWithColor = catList.map((cat, idx) => ({
          ...cat,
          color: colors[idx % colors.length]
        }));
        setCategories(categoriesWithColor);

        // Generate mockup chart data points based on dynamic sums
        const mockPoints = [
          Math.round(inc * 0.1),
          Math.round(inc * 0.3),
          Math.round(inc * 0.5 - exp * 0.2),
          Math.round(inc - exp)
        ];
        setChartData(mockPoints);
      }
    } catch (err) {
      console.error("Error fetching finance data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (item: any) => {
    if (!confirm("🚨 เฮ้ยพี่!!! แน่ใจนะว่าจะลบรายการเงินนี้จริง ๆ?! ลบแล้วกู้คืนไม่ได้นะพี่!!! 😱")) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_expense",
          timestamp: item.timestamp,
          category: item.category,
          amount: Number(item.amount),
          description: item.description || "",
          transaction_type: item.transaction_type
        })
      });
      const data = await response.json();
      if (data.status === "success") {
        alert("✅ ลบรายการธุรกรรมการเงินเรียบร้อยครับ!");
        fetchFinanceData();
      } else {
        alert("❌ เกิดข้อผิดพลาด: " + data.message);
        setLoading(false);
      }
    } catch (err: any) {
      alert("❌ ไม่สามารถเชื่อมต่อเพื่อลบได้: " + err.message);
      setLoading(false);
    }
  };

  const [isReporting, setIsReporting] = useState(false);

  const handleRunFinancialReport = async () => {
    setIsReporting(true);
    try {
      const response = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run_financial_health_report"
        })
      });
      const data = await response.json();
      if (data.status === "success") {
        alert("📊 ประเมินสุขภาพการเงินสำเร็จ!\n\nระบบวิเคราะห์ตามเกณฑ์ SET Happy Money และส่งการ์ดรายงานผลประเมิน (Grade A-F) ส่งตรงเข้าสู่ Telegram ของพี่เรียบร้อยแล้วครับพี่! 🩺✨");
      } else {
        alert("❌ ประเมินขัดข้อง: " + data.message);
      }
    } catch (err: any) {
      alert("❌ เกิดข้อผิดพลาดทางเทคนิค: " + err.message);
    } finally {
      setIsReporting(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text-main p-6 font-sans">
        <div className="w-24 h-24 mb-4 rounded-full overflow-hidden bg-surface border border-[#5B5CEB]/30 animate-bounce flex items-center justify-center">
          <Image src="/avatar/thinking.png" alt="Thinking" width={80} height={80} className="object-cover" />
        </div>
        <p className="text-xs text-text-sub">กำลังดึงข้อมูลรายงานการเงิน...</p>
      </div>
    );
  }

  const netProfit = incomeSum - expenseSum;
  const total = incomeSum + expenseSum;
  const incomePercent = total > 0 ? Math.round((incomeSum / total) * 100) : 50;
  const expensePercent = total > 0 ? Math.round((expenseSum / total) * 100) : 50;

  const filteredTxList = transactions.filter(item => {
    if (activeTab === "รายรับ") return item.transaction_type === "Income";
    if (activeTab === "รายจ่าย") return item.transaction_type === "Expense";
    if (activeTab === "ประวัติ") return true;
    return false;
  });

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
          {["ภาพรวม", "รายรับ", "รายจ่าย", "ประวัติ"].map((tab) => (
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

        {/* Tab Content 1: ภาพรวม */}
        {activeTab === "ภาพรวม" && (
          <>
            {/* Balance Card */}
            <div className="bg-surface/40 backdrop-blur-lg border border-white/5 p-4 rounded-2xl mb-6 text-center relative overflow-hidden">
              <span className="text-[10px] text-text-sub block mb-1">ยอดคงเหลือรวม</span>
              <span className={`text-3xl font-extrabold block mb-1 ${netProfit >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                ฿{netProfit.toLocaleString("th-TH")}
              </span>
              <span className="text-[10px] text-[#10B981] font-semibold bg-[#10B981]/15 px-2.5 py-0.5 rounded-full">ซิงก์จริงจาก Google Sheets</span>
            </div>

            {/* Doughnut Chart (กราฟวงกลม) */}
            <div className="bg-surface/20 border border-white/5 p-4 rounded-2xl mb-6 flex flex-col items-center">
              <h3 className="text-xs text-text-sub w-full mb-3 text-left">สัดส่วนรายรับ - รายจ่าย 📊</h3>
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                  {/* Background Track */}
                  <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="4.5" />
                  
                  {/* Income Segment (Green) */}
                  <circle 
                    cx="21" 
                    cy="21" 
                    r="15.91549430918954" 
                    fill="transparent" 
                    stroke="#10B981" 
                    strokeWidth="4.5" 
                    strokeDasharray={`${incomePercent} ${100 - incomePercent}`} 
                    strokeDashoffset="0" 
                    className="transition-all duration-1000"
                  />
                  
                  {/* Expense Segment (Red) */}
                  <circle 
                    cx="21" 
                    cy="21" 
                    r="15.91549430918954" 
                    fill="transparent" 
                    stroke="#EF4444" 
                    strokeWidth="4.5" 
                    strokeDasharray={`${expensePercent} ${100 - expensePercent}`} 
                    strokeDashoffset={`${-incomePercent}`} 
                    className="transition-all duration-1000"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute text-center">
                  <span className="text-[8px] text-text-sub block uppercase tracking-wider">คงเหลือ</span>
                  <span className={`text-xs font-extrabold ${netProfit >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                    {netProfit >= 0 ? "+" : ""}฿{netProfit.toLocaleString("th-TH")}
                  </span>
                </div>
              </div>
              
              {/* Legend indicators */}
              <div className="flex gap-6 mt-4 justify-center w-full text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" />
                  <span className="text-text-sub font-medium">รายรับ ({incomePercent}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] inline-block" />
                  <span className="text-text-sub font-medium">รายจ่าย ({expensePercent}%)</span>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-surface/40 border border-white/5 p-4 rounded-2xl">
                <h3 className="text-[10px] text-text-sub mb-1">รายรับสะสม</h3>
                <p className="text-base font-bold text-[#10B981]">฿{incomeSum.toLocaleString("th-TH")}</p>
              </div>
              <div className="bg-surface/40 border border-white/5 p-4 rounded-2xl">
                <h3 className="text-[10px] text-text-sub mb-1">รายจ่ายสะสม</h3>
                <p className="text-base font-bold text-[#EF4444]">฿{expenseSum.toLocaleString("th-TH")}</p>
              </div>
            </div>

            {/* Categories List with Progress Bars */}
            <section className="mb-6">
              <h2 className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-4">หมวดหมู่รายจ่าย</h2>
              <div className="space-y-4">
                {categories.length > 0 ? (
                  categories.map((cat) => (
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
                  ))
                ) : (
                  <p className="text-xs text-text-sub text-center p-4">ไม่มีรายการรายจ่ายสำหรับแจกแจงครับ</p>
                )}
              </div>
            </section>

            {/* SET Happy Money Financial Health Check Card */}
            <div className="bg-surface/20 border border-[#10B981]/25 p-4 rounded-2xl mb-6 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-3">
                <span className="text-xl">🩺</span>
                <div>
                  <h4 className="text-xs font-bold text-text-main">ตรวจสุขภาพการเงิน (SET Happy Money)</h4>
                  <p className="text-[9px] text-text-sub">มอนิเตอร์การเงินฉบับ Little Bro 🩺 วิเคราะห์อัตราการออมและภาระหนี้สินเพื่อประเมินเกรด A-F</p>
                </div>
              </div>
              
              <button
                onClick={handleRunFinancialReport}
                disabled={isReporting}
                className="w-full bg-[#10B981] hover:bg-[#10B981]/90 disabled:bg-[#10B981]/40 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#10B981]/20"
              >
                {isReporting ? (
                  <>
                    <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                    กำลังคำนวณเกรดผลลัพธ์...
                  </>
                ) : (
                  <>
                    <span>ประเมินสุขภาพการเงินและส่งผลทาง Telegram ➔</span>
                  </>
                )}
              </button>
            </div>

            {/* Stance Avatar Card */}
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
                  วิเคราะห์รายจ่ายจากฐานข้อมูล Google Sheets เรียบร้อยครับ รายจ่ายหลักคือ {categories[0]?.name || "ทั่วไป"} คุณสามารถคุมส่วนนี้ได้ทันทีครับ!
                </p>
              </div>
            </div>
          </>
        )}

        {/* Tab Content 2: รายรับ, รายจ่าย, ประวัติ */}
        {activeTab !== "ภาพรวม" && (
          <div className="space-y-4">
            {/* Show contextual header cards */}
            {activeTab === "รายรับ" && (
              <div className="bg-surface/40 border border-white/5 p-4 rounded-2xl text-center">
                <span className="text-[10px] text-text-sub block mb-1">ยอดรับทั้งหมด</span>
                <span className="text-2xl font-extrabold text-[#10B981]">฿{incomeSum.toLocaleString("th-TH")}</span>
              </div>
            )}
            {activeTab === "รายจ่าย" && (
              <div className="bg-surface/40 border border-white/5 p-4 rounded-2xl text-center">
                <span className="text-[10px] text-text-sub block mb-1">ยอดจ่ายทั้งหมด</span>
                <span className="text-2xl font-extrabold text-[#EF4444]">฿{expenseSum.toLocaleString("th-TH")}</span>
              </div>
            )}

            {/* Transactions lists */}
            <div className="space-y-2.5">
              {filteredTxList.length > 0 ? (
                filteredTxList.map((item, idx) => {
                  const isInc = item.transaction_type === "Income";
                  const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleDateString("th-TH", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  }) : "ไม่ระบุวัน";

                  return (
                    <div key={idx} className="p-3.5 bg-surface/30 border border-white/5 rounded-2xl flex justify-between items-center shadow-sm">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-text-main">{item.description || item.category || "บันทึกธุรกรรม"}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] text-[#5B5CEB] bg-[#5B5CEB]/10 border border-[#5B5CEB]/20 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                          <span className="text-[8px] text-text-sub font-mono">{dateStr}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`text-xs font-extrabold block ${isInc ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                            {isInc ? "+" : "-"}฿{Number(item.amount || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                          </span>
                          {item.file_attachment_url && (
                            <a 
                              href={item.file_attachment_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[8px] text-[#5B5CEB] hover:underline block mt-0.5"
                            >
                              📎 ดูไฟล์แนบ
                            </a>
                          )}
                        </div>
                        {item && (
                          <button 
                            onClick={() => handleDeleteTransaction(item)}
                            className="text-text-sub hover:text-[#EF4444] transition-colors p-1.5 rounded-lg hover:bg-[#EF4444]/10 cursor-pointer"
                            title="ลบรายการ"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 bg-surface/20 border border-dashed border-white/5 rounded-2xl text-center text-xs text-text-sub">
                  📭 ไม่มีบันทึกสำหรับแสดงผลในหน้านี้ครับ
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="mt-8 text-center text-[10px] text-text-sub/40">
        <p>Little Bro Assistant v1.0.0 • Antigravity Product Team</p>
      </footer>
    </div>
  );
}
