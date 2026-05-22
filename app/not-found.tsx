import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-md rounded-xl border p-8 text-center shadow-2xl" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="mb-4 text-5xl">&#128269;</div>
        <h1 className="mb-2 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Page not found</h1>
        <p className="mb-6" style={{ color: 'var(--color-text-tertiary)' }}>The page you are looking for does not exist or has been moved.</p>
        <Link href="/" className="inline-block rounded-lg px-6 py-2.5 font-medium text-white transition-colors" style={{ backgroundColor: 'var(--color-accent)' }}>Go home</Link>
      </div>
    </div>
  );
}
