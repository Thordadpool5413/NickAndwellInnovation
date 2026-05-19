'use client';

import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{message}</p>
    </div>
  );
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: React.ReactNode }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
      <Inbox className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-tertiary)', opacity: 0.5 }} />
      <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
      <p className="muted" style={{ marginBottom: action ? '1.5rem' : 0 }}>{message}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card" style={{ borderColor: 'var(--color-error, #ef4444)', padding: '2rem' }}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--color-error, #ef4444)' }} />
        <div>
          <p style={{ color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: '0.25rem' }}>Something went wrong</p>
          <p className="muted" style={{ fontSize: '0.875rem' }}>{message}</p>
          {onRetry && (
            <button className="btn mt-3" onClick={onRetry}>Try again</button>
          )}
        </div>
      </div>
    </div>
  );
}
