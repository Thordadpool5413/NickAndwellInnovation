'use client';

import React from "react";
import { useDarkMode } from "./DarkModeContext";
import services from "../data/services";
import { COLORS } from "../data/constants";

interface ServiceBadgeProps {
  service: string;
}

export default function ServiceBadge({ service }: ServiceBadgeProps) {
  const { dark } = useDarkMode();
  const color = (services as Record<string, { color: string }>)[service]?.color || COLORS.slate;
  const modeClass = dark
    ? "border-slate-600 bg-slate-800 text-slate-200"
    : "border-slate-200 bg-white text-slate-800";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black shadow-sm ${modeClass}`}>
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {service}
    </span>
  );
}
