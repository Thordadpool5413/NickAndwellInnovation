export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent)' }} />
        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Loading…</p>
      </div>
    </div>
  );
}
