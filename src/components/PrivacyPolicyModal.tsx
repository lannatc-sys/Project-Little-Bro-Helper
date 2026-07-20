"use client";

import React from "react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative text-text-main overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <div>
              <h2 className="text-base font-bold text-text-main">นโยบายความเป็นส่วนตัว & PDPA</h2>
              <p className="text-[10px] text-text-sub">Little Bro Assistant • Governance Manual v1.4.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-sub hover:text-text-main p-1.5 rounded-full hover:bg-white/5 transition-all text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Box with Scroll */}
        <div className="space-y-3.5 max-h-[55vh] overflow-y-auto pr-1 text-xs text-text-sub leading-relaxed">
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl">
            <h4 className="text-xs font-bold text-primary mb-1">🔒 นโยบายการไม่จัดเก็บข้อมูลบนเซิร์ฟเวอร์หลัก (Zero Server Data Storage)</h4>
            <p className="text-[10px] text-text-main">
              แอปพลิเคชัน Little Bro Assistant ถูกออกแบบให้ข้อมูลการเงิน ธุรกรรม และเช็คลิสต์งานทั้งหมด ถูกจัดเก็บซิงก์ตรงลงแผ่นงาน <strong>Google Sheets และ Google Drive ส่วนตัวของคุณเท่านั้น</strong> ไม่มีระบบกลางในการแอบบันทึกหรือขายข้อมูลส่วนบุคคลของคุณ
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-text-main text-xs">1. สิทธิ์การเชื่อมต่อ Google OAuth 2.0 (Scopes Disclosures)</h4>
            <p className="text-[11px]">
              คำขอเข้าถึงสิทธิ์ Google Drive และ Google Sheets ใช้สำหรับสร้างแผ่นงาน จัดเก็บรูปภาพสลิปโอนเงิน และอ่านสถิติการเงินของคุณเพื่อนำมาแสดงผลเป็นกราฟรายงานในแอปเท่านั้น
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-text-main text-xs">2. สิทธิของผู้ใช้ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)</h4>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li><strong>สิทธิในการเข้าถึงและขอรับสำเนา (Right of Access):</strong> คุณสามารถส่งออกไฟล์สเปรดชีตการเงินได้ตลอดเวลา</li>
              <li><strong>สิทธิในการลบข้อมูล (Right to Erasure):</strong> คุณสามารถสั่งลบข้อมูลทั้งหมดจาก Google Sheets หรือ Supabase Cache ได้ 100%</li>
              <li><strong>สิทธิในการยกเลิกสิทธิ์ (Right to Withdraw Consent):</strong> สามารถยกเลิกการเชื่อมต่อผ่าน Google Account Settings ได้ทันที</li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-text-main text-xs">3. ข้อมูลติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO Contact)</h4>
            <p className="text-[11px]">
              หากมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัว สามารถติดต่อเจ้าหน้าที่ DPO ได้ที่:
              <br />
              📧 <strong>privacy@littlebroassistant.com</strong>
              <br />
              📧 <strong>support@littlebroassistant.com</strong>
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:opacity-90 transition-all shadow-md cursor-pointer"
          >
            รับทราบและยอมรับนโยบาย
          </button>
        </div>

      </div>
    </div>
  );
};
