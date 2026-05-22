import React from 'react';

export default function Badge({ children, variant, tone }: { children?: React.ReactNode; variant?: string; tone?: string }) {
  return <span className={`badge ${variant || tone || ''}`}>{children}</span>;
}

