"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function FilesScreen() {
  const [filter, setFilter] = useState("ทั้งหมด");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list_files" })
      });
      const result = await res.json();
      if (result.status === "success") {
        setFiles(result.files || []);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploading(true);
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
        if (result.status === "success") {
          fetchFiles();
        } else {
          alert("เกิดข้อผิดพลาดในการอัปโหลด: " + result.message);
        }
      } catch (err) {
        console.error(err);
        alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่ออัปโหลดไฟล์ได้");
      } finally {
        setUploading(false);
        // Clear input to allow uploading the same file again
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.onerror = () => {
      alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
      setUploading(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  const filteredFiles = files.filter((f) => {
    if (filter === "ทั้งหมด") return true;
    if (filter === "เอกสาร") return !f.name.toLowerCase().endsWith(".pdf") && !f.name.toLowerCase().match(/\.(jpg|jpeg|png)$/);
    if (filter === "รูปภาพ") return f.name.toLowerCase().match(/\.(jpg|jpeg|png)$/);
    if (filter === "PDF") return f.name.toLowerCase().endsWith(".pdf");
    return true;
  });

  // Calculate folder counts dynamically
  const documentCount = files.filter(f => !f.name.toLowerCase().endsWith(".pdf") && !f.name.toLowerCase().match(/\.(jpg|jpeg|png)$/)).length;
  const imageCount = files.filter(f => f.name.toLowerCase().match(/\.(jpg|jpeg|png)$/)).length;
  const pdfCount = files.filter(f => f.name.toLowerCase().endsWith(".pdf")).length;

  const folders = [
    { name: "เอกสารทั่วไป", items: `${documentCount} รายการ`, color: "text-[#5B5CEB]" },
    { name: "รูปภาพ/ใบเสร็จ", items: `${imageCount} รายการ`, color: "text-[#10B981]" },
    { name: "ไฟล์ PDF สัญญา", items: `${pdfCount} รายการ`, color: "text-[#EF4444]" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text-main p-6 font-sans">
        <div className="w-24 h-24 mb-4 rounded-full overflow-hidden bg-white border border-[#5B5CEB]/30 animate-bounce flex items-center justify-center">
          <Image src="/avatar/thinking.png" alt="Thinking" width={80} height={80} className="object-cover" />
        </div>
        <p className="text-xs text-text-sub">กำลังซิงก์คลังไฟล์จาก Google Drive...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 text-text-main font-sans flex flex-col justify-between transition-colors duration-300">
      <div>
        {/* Header Section */}
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-text-main">ไฟล์ของบอส</h1>
          
          <div>
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            
            <button
              onClick={triggerFileInput}
              disabled={uploading}
              className="bg-[#5B5CEB] hover:bg-[#5B5CEB]/80 disabled:bg-[#5B5CEB]/50 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  อัปโหลด...
                </>
              ) : (
                "+ อัปโหลด"
              )}
            </button>
          </div>
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
          {["ทั้งหมด", "เอกสาร", "รูปภาพ", "PDF"].map((f) => (
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

        {/* Folders List (Horizontal scrollable or small column) */}
        <section className="mb-6">
          <h3 className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-3">โฟลเดอร์หลัก</h3>
          <div className="grid grid-cols-3 gap-2">
            {folders.map((folder) => (
              <div key={folder.name} className="bg-surface/40 border border-white/5 p-3 rounded-2xl flex flex-col justify-between hover:bg-surface/60 transition-all cursor-pointer min-h-[72px]">
                <span className="text-xl">📁</span>
                <div>
                  <h4 className="text-[10px] font-bold text-text-main leading-tight truncate">{folder.name}</h4>
                  <p className="text-[8px] text-text-sub">{folder.items}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Files List */}
        <section className="mb-6">
          <h3 className="text-xs font-semibold text-text-sub uppercase tracking-wider mb-3">คลังเอกสารในไดรฟ์</h3>
          <div className="space-y-2.5">
            {filteredFiles.length > 0 ? (
              filteredFiles.map((file, idx) => (
                <a 
                  key={idx} 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-surface/20 border border-white/5 rounded-xl hover:bg-surface/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl bg-surface p-2 rounded-lg">{file.icon || "📄"}</span>
                    <div>
                      <h4 className="text-xs font-bold text-text-main truncate max-w-[180px]">{file.name}</h4>
                      <p className="text-[9px] text-text-sub">{file.size} • {file.date}</p>
                    </div>
                  </div>
                  <span className="text-xs text-text-sub/40">➔</span>
                </a>
              ))
            ) : (
              <div className="p-8 bg-surface/20 border border-dashed border-white/5 rounded-2xl text-center text-xs text-text-sub">
                📭 ยังไม่มีการอัปโหลดไฟล์ในโฟลเดอร์นี้ครับบอส
              </div>
            )}
          </div>
        </section>

        {/* Stance Avatar Card */}
        <div className="bg-surface/40 border border-[#5B5CEB]/25 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-white flex-shrink-0 border border-white/10">
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
              ไฟล์ที่อัปโหลดทั้งหมดจะถูกส่งตรงไปจัดเก็บใน Google Drive ส่วนตัว ภายใต้โฟลเดอร์หลัก "Little Bro Helper Files" แบบอัตโนมัติ 100% ครับ!
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
