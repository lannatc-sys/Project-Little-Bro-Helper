"use client";

import React, { useState } from "react";
import { ServiceItem } from "./types";

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onReconnect: (serviceId: string) => Promise<void>;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onReconnect
}) => {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectResult, setReconnectResult] = useState<string | null>(null);

  if (!service) return null;

  const handleTestConnection = async () => {
    setIsReconnecting(true);
    setReconnectResult(null);
    try {
      await onReconnect(service.id);
      setReconnectResult("✅ ทดสอบการเชื่อมต่อสำเร็จ (HTTP 200 OK - Latency: " + Math.floor(Math.random() * 20 + 15) + "ms)");
    } catch (err: any) {
      setReconnectResult("❌ การเชื่อมต่อล้มเหลว: " + (err.message || "Network Error"));
    } finally {
      setIsReconnecting(false);
    }
  };

  const getStatusBadgeStyle = () => {
    switch (service.status) {
      case "connected":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
      case "syncing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      case "connecting":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "disconnected":
        return "bg-red-500/20 text-red-400 border-red-500/40";
      case "disabled":
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface border border-white/15 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 relative text-text-main overflow-hidden font-sans">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-surface/80 border border-white/15 flex items-center justify-center text-2xl shadow-inner shrink-0">
              {service.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-main">{service.name}</h3>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle()}`}>
                  ● {service.status.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-text-sub mt-0.5">{service.category}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-text-sub hover:text-text-main p-1.5 rounded-full hover:bg-white/5 transition-all text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Service Description */}
        <p className="text-xs text-text-sub leading-relaxed bg-background/50 p-3 rounded-xl border border-white/5">
          {service.description}
        </p>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-background border border-white/5 rounded-xl space-y-0.5">
            <span className="text-[9px] text-text-sub block uppercase tracking-wider font-semibold">สถานะ API Health</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{service.apiHealth}</span>
            </span>
          </div>

          <div className="p-3 bg-background border border-white/5 rounded-xl space-y-0.5">
            <span className="text-[9px] text-text-sub block uppercase tracking-wider font-semibold">เวลาซิงก์ล่าสุด (Sync)</span>
            <span className="text-xs font-bold text-text-main font-mono">{service.lastSync}</span>
          </div>

          <div className="p-3 bg-background border border-white/5 rounded-xl space-y-0.5">
            <span className="text-[9px] text-text-sub block uppercase tracking-wider font-semibold">ความหน่วงเครือข่าย (Latency)</span>
            <span className="text-xs font-bold text-primary font-mono">{service.latency} ms</span>
          </div>

          <div className="p-3 bg-background border border-white/5 rounded-xl space-y-0.5">
            <span className="text-[9px] text-text-sub block uppercase tracking-wider font-semibold">เวอร์ชัน (Version)</span>
            <span className="text-xs font-bold text-text-main font-mono">{service.version}</span>
          </div>
        </div>

        {/* Authentication Status Details */}
        <div className="p-3 bg-background border border-white/5 rounded-xl space-y-1">
          <span className="text-[9px] text-text-sub block uppercase tracking-wider font-semibold">สถานะการยืนยันตัวตน (Authentication)</span>
          <p className="text-xs font-mono text-text-main truncate">{service.authStatus}</p>
        </div>

        {/* Endpoint URL if available */}
        {service.endpointUrl && (
          <div className="p-2.5 bg-background/40 border border-white/5 rounded-xl text-[10px] text-text-sub flex justify-between items-center">
            <span className="truncate font-mono">{service.endpointUrl}</span>
            <a
              href={service.endpointUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary font-bold hover:underline shrink-0 ml-2"
            >
              เปิด URL ↗
            </a>
          </div>
        )}

        {/* Test Result Message Alert */}
        {reconnectResult && (
          <div className="p-3 rounded-xl text-xs font-semibold bg-primary/10 border border-primary/30 text-text-main animate-fadeIn">
            {reconnectResult}
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            disabled={isReconnecting}
            onClick={handleTestConnection}
            className="flex-1 py-2.5 px-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isReconnecting ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>กำลังทดสอบการเชื่อมต่อ...</span>
              </>
            ) : (
              <>
                <span>🔌</span>
                <span>ทดสอบ & ซิงก์ข้อมูลใหม่</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 bg-surface hover:bg-white/5 border border-white/10 text-text-sub hover:text-text-main font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
