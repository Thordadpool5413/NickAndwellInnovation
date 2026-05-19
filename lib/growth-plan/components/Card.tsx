'use client';

import React from "react";

interface CardProps {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, eyebrow, children, className = "" }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {eyebrow && (
        <h6 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--color-accent)" }}>
          {eyebrow}
        </h6>
      )}
      <h3 className="text-lg font-semibold mb-6" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}
