'use client';

import React from "react";
import Sparkline from "./Sparkline";

interface MetricProps {
  label: string;
  value: string | number;
  detail?: string;
  sparkData?: number[];
  sparkColor?: string;
  confidence?: string | null;
  className?: string;
}

export default function Metric({ label, value, detail, sparkData, sparkColor, confidence = null, className = "" }: MetricProps) {
  const getConfidenceBadge = (level: string) => {
    if (!level) return null;
    const colors: Record<string, string> = {
      high: "badge-success",
      medium: "badge-warning",
      low: "badge-error",
    };
    return (
      <span className={`badge ${colors[level] || colors.medium}`}>
        {level}
      </span>
    );
  };

  return (
    <div className={`metric ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium m-0" style={{ color: "var(--color-text-tertiary)" }}>
          {label}
        </p>
        <div className="flex gap-2 items-center">
          {confidence && getConfidenceBadge(confidence)}
          {sparkData && <Sparkline data={sparkData} color={sparkColor} />}
        </div>
      </div>
      <p className="text-3xl font-bold my-4" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </p>
      {detail && (
        <p className="text-sm m-0 leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
          {detail}
        </p>
      )}
    </div>
  );
}
