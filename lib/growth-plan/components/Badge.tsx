import React from 'react';

export default function Badge({ children, variant }: { children?: React.ReactNode; variant?: string }) {
  return <span className={`badge ${variant || ''}`}>{children}</span>;
}

