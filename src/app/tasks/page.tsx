"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

function TasksForm() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  
  // Create task states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_dashboard_data" })
      });
      const result = await res.json();
      if (result.status === "success" && result.data) {
        setTasks(result.data.tasks || []);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (searchParams.get("create") === "true") {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const toggleTask = async (task: any) => {
    const nextStatus = task.status === "Completed" ? "Pending" : "Completed";
    
    // Optimistic local update
    setTasks(prev => prev.map(t => t.task_id === task.task_id ? { ...t, status: nextStatus } : t));

    try {
      await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_task_status",
          task_id: task.task_id,
          status: nextStatus
        })
      });
      fetchTasks();
    } catch (err) {
      console.error("Error toggling task status:", err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    setCreateLoading(true);
    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_task",
          task_name: newTaskName,
          details: newDetails,
          due_date: dueDate,
          status: "Pending"
        })
      });
      const result = await res.json();
      if (result.status === "success") {
        setNewTaskName("");
        setNewDetails("");
        setDueDate("");
        setShowCreateModal(false);
        fetchTasks();
      }
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const isCompleted = t.status === "Completed";
    if (activeTab === "ทั้งหมด") return true;
    if (activeTab === "วันนี้") return true; // simplified grouping
    if (activeTab === "กำลังทำ") return !isCompleted;
    if (activeTab === "เสร็จแล้ว") return isCompleted;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text-main p-6 font-sans">
        <div className="w-24 h-24 mb-4 rounded-full overflow-hidden bg-surface border border-[#5B5CEB]/30 animate-bounce flex items-center justify-center">
          <Image src="/avatar/thinking.png" alt="Thinking" width={80} height={80} className="object-cover" />
        </div>
        <p className="text-xs text-text-sub">กำลังซิงก์รายการงาน...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* Header Section */}
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-text-main">สิ่งที่ต้องทำ</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#5B5CEB] hover:bg-[#5B5CEB]/80 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-all"
          >
            + สร้างรายการ
          </button>
        </header>

        {/* Tab Headers */}
        <div className="flex bg-surface p-1.5 rounded-xl border border-white/5 mb-6 justify-between text-center">
          {["ทั้งหมด", "วันนี้", "กำลังทำ", "เสร็จแล้ว"].map((tab) => (
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

        {/* Task List container */}
        <section className="mb-6 space-y-2">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const isCompleted = task.status === "Completed";
              return (
                <div
                  key={task.task_id}
                  onClick={() => toggleTask(task)}
                  className="flex items-center justify-between p-3.5 bg-surface/30 hover:bg-surface/50 border border-white/5 rounded-xl cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      isCompleted ? "bg-[#5B5CEB] border-[#5B5CEB]" : "border-white/20"
                    }`}>
                      {isCompleted && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className={`text-xs block ${isCompleted ? "text-text-sub line-through" : "text-text-main"}`}>
                        {task.task_name}
                      </span>
                      {task.details && (
                        <p className="text-[9px] text-text-sub mt-0.5">{task.details}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] text-text-sub font-mono">{task.due_date || "ด่วน"}</span>
                </div>
              );
            })
          ) : (
            <div className="p-8 bg-surface/20 border border-dashed border-white/5 rounded-2xl text-center text-xs text-text-sub">
              📭 ไม่มีรายการงานค้างสะสมครับ
            </div>
          )}
        </section>

        {/* Stance Avatar Card */}
        <div className="bg-surface/40 border border-[#5B5CEB]/25 p-4 rounded-2xl flex items-center gap-4 mt-6">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-surface flex-shrink-0 border border-white/10">
            <Image
              src="/avatar/plan.png"
              alt="Plan Stance"
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-main mb-1">รายการสิ่งที่ต้องทำ 📋</h4>
            <p className="text-[10px] text-text-sub leading-relaxed">
              รายการสิ่งที่ต้องทำจะถูกซิงก์ลงชีต Task โดยตรง สามารถกดติ๊กถูกเพื่ออัปเดตสถานะเสร็จสิ้นได้ทันทีครับ!
            </p>
          </div>
        </div>
      </div>

      {/* Create Task Modal Overlay */}
      {showCreateModal && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <form 
            onSubmit={handleCreateTask}
            className="bg-surface border border-white/10 w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col relative text-text-main"
          >
            <button 
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-text-sub hover:text-text-main"
            >
              ✕
            </button>
            <h3 className="text-sm font-bold text-text-main mb-4">📝 สร้างรายการใหม่</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block mb-1 text-[10px] text-text-sub font-semibold">ชื่อรายการ (Task Name)</label>
                <input 
                  type="text" 
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="เช่น วางแผนการเงินประจำสัปดาห์..."
                  required
                  className="w-full bg-background border border-white/5 p-2.5 rounded-lg text-text-main text-xs focus:border-[#5B5CEB] focus:outline-none placeholder-text-sub/50"
                />
              </div>
              <div>
                <label className="block mb-1 text-[10px] text-text-sub font-semibold">รายละเอียดเพิ่มเติม (Details)</label>
                <textarea 
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="เช่น รายละเอียดงานหรือข้อตกลงเพิ่มเติม..."
                  className="w-full bg-background border border-white/5 p-2.5 rounded-lg text-text-main text-xs focus:border-[#5B5CEB] focus:outline-none placeholder-text-sub/50 h-16 resize-none"
                />
              </div>
              <div>
                <label className="block mb-1 text-[10px] text-text-sub font-semibold">กำหนดส่ง (Due Date)</label>
                <input 
                  type="text" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="เช่น 20 พฤษภาคม 2567"
                  className="w-full bg-background border border-white/5 p-2.5 rounded-lg text-text-main text-xs focus:border-[#5B5CEB] focus:outline-none placeholder-text-sub/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createLoading}
              className="w-full bg-[#5B5CEB] hover:bg-[#5B5CEB]/90 disabled:bg-[#5B5CEB]/50 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {createLoading ? "กำลังบันทึก..." : "บันทึกรายการสิ่งที่ต้องทำ 💾"}
            </button>
          </form>
        </div>
      )}

      <footer className="mt-8 text-center text-[10px] text-text-sub/40">
        <p>Little Bro Assistant v1.0.0 • Antigravity Product Team</p>
      </footer>
    </div>
  );
}

export default function TasksScreen() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center text-text-main">
        กำลังโหลดรายการภารกิจ...
      </div>
    }>
      <TasksForm />
    </Suspense>
  );
}
