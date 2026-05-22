import React from 'react';

export default function Metric({ label, value, detail, className }: { label?: string; value?: React.ReactNode; detail?: string; className?: string }) {
  return (
    <div className={`metric ${className || ''}`}>
      {label && <div className="metric-label">{label}</div>}
      {value !== undefined && <div className="metric-value">{value}</div>}
      {detail && <div className="metric-detail">{detail}</div>}
    </div>
  );
}
