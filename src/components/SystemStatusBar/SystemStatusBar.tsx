"use client";

import React, { useState, useEffect } from "react";
import { ServiceItem, INITIAL_SERVICES } from "./types";
import { ServiceBadge } from "./ServiceBadge";
import { ServiceDetailModal } from "./ServiceDetailModal";

export const SystemStatusBar: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string>(() =>
    new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );

  // Real-time background update simulation (periodic health checks without page refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      setServices((prev) =>
        prev.map((s) => {
          const newLatency = Math.max(8, s.latency + Math.floor(Math.random() * 9 - 4));
          return {
            ...s,
            latency: newLatency,
            lastSync: "เมื่อสักครู่"
          };
        })
      );
      setLastCheckTime(new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 12000); // Check every 12s

    return () => clearInterval(interval);
  }, []);

  const handleReconnect = async (serviceId: string) => {
    // Simulate real-time reconnection & sync
    await new Promise((resolve) => setTimeout(resolve, 800));
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          return {
            ...s,
            status: "connected",
            lastSync: "เมื่อสักครู่",
            notificationCount: 0,
            apiHealth: "100% Operational",
            latency: Math.floor(Math.random() * 20 + 12)
          };
        }
        return s;
      })
    );
  };

  const connectedCount = services.filter((s) => s.status === "connected" || s.status === "syncing").length;
  const totalCount = services.length;
  const totalErrors = services.filter((s) => s.notificationCount > 0 || s.status === "disconnected").length;

  return (
    <>
      <div className="w-full bg-surface/90 border-b border-white/10 backdrop-blur-md px-3 py-2 sticky top-0 z-40 shadow-sm transition-colors duration-300 font-sans">
        <div className="max-w-2xl mx-auto flex flex-col space-y-1.5">
          
          {/* Top Bar Header & Overall System Health Badge */}
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-extrabold text-text-main tracking-tight">SYSTEM INTEGRATION CENTER</span>
              </div>
              <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 font-bold px-2 py-0.2 rounded-full">
                {connectedCount}/{totalCount} Online
              </span>
              {totalErrors > 0 && (
                <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-1.5 py-0.2 rounded-full animate-bounce">
                  ⚠️ {totalErrors} Issue
                </span>
              )}
            </div>

            <span className="text-[9px] text-text-sub font-mono hidden sm:inline-block">
              Auto-Sync: {lastCheckTime}
            </span>
          </div>

          {/* Horizontally Scrollable Badges Container */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
            {services.map((service) => (
              <ServiceBadge
                key={service.id}
                service={service}
                onClick={(s) => setSelectedService(s)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Detail Panel Modal */}
      <ServiceDetailModal
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onReconnect={handleReconnect}
      />
    </>
  );
};
