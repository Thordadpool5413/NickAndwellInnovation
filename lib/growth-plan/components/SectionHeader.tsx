import React from 'react';

export default function SectionHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <div className="section-group-header">
      {title && <h3>{title}</h3>}
      {subtitle && <p className="muted">{subtitle}</p>}
    </div>
  );
}
