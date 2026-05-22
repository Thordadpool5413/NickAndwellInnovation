'use client';

export function LoadingState({ message }: { message?: string }) {
  return <div className="notice text-center">{message || 'Loading...'}</div>;
}
