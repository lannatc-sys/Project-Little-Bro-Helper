"use client";

import React from "react";
import { ServiceItem } from "./types";

interface ServiceBadgeProps {
  service: ServiceItem;
  onClick: (service: ServiceItem) => void;
}

export const ServiceBadge: React.FC<ServiceBadgeProps> = ({ service, onClick }) => {
  const getStatusIndicator = () => {
    switch (service.status) {
      case "connected":
        return (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
          </span>
        );
      case "syncing":
        return (
          <span className="w-2.5 h-2.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
        );
      case "connecting":
        return (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
        );
      case "disconnected":
        return (
          <span className="inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        );
      case "disabled":
      default:
        return <span className="inline-flex rounded-full h-2 w-2 bg-gray-500"></span>;
    }
  };

  const getStatusBorder = () => {
    switch (service.status) {
      case "connected":
        return "border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-950/20";
      case "syncing":
        return "border-blue-500/30 hover:border-blue-500/60 bg-blue-950/20";
      case "connecting":
        return "border-amber-500/30 hover:border-amber-500/60 bg-amber-950/20";
      case "disconnected":
        return "border-red-500/50 hover:border-red-500/80 bg-red-950/30";
      case "disabled":
      default:
        return "border-white/10 opacity-60";
    }
  };

  return (
    <button
      type="button"
      onClick={() => onClick(service)}
      className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all duration-200 cursor-pointer shrink-0 select-none shadow-sm ${getStatusBorder()}`}
      title={`${service.name}: ${service.status.toUpperCase()} (${service.apiHealth})`}
    >
      {/* Service Icon */}
      <span className="text-xs shrink-0 group-hover:scale-110 transition-transform">
        {service.icon}
      </span>

      {/* Service Name */}
      <span className="font-semibold text-text-main line-clamp-1 group-hover:text-primary transition-colors">
        {service.name}
      </span>

      {/* Status Dot */}
      <span className="ml-0.5 flex items-center">
        {getStatusIndicator()}
      </span>

      {/* Notification Dot / Badge Count */}
      {service.notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[8px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-0.5 shadow-md animate-bounce">
          {service.notificationCount}
        </span>
      )}
    </button>
  );
};
