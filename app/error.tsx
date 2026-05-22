'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-md rounded-xl border p-8 text-center shadow-2xl" style={{ borderColor: 'var(--color-danger)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="mb-4 text-5xl">&#9888;</div>
        <h1 className="mb-2 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Something went wrong</h1>
        <p className="mb-6" style={{ color: 'var(--color-text-tertiary)' }}>An unexpected error occurred. Our team has been notified.</p>
        <button onClick={reset} className="rounded-lg px-6 py-2.5 font-medium text-white transition-colors" style={{ backgroundColor: 'var(--color-accent)' }}>Try again</button>
      </div>
    </div>
  );
}
