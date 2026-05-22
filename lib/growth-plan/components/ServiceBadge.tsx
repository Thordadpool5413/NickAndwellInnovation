import React from 'react';

export default function ServiceBadge({ service, color }: { service?: string; color?: string }) {
  return <span className="badge" style={color ? { borderColor: color, color } : undefined}>{service || ''}</span>;
}
