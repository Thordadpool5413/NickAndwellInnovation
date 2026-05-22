'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signIn('email', { email, redirect: false, callbackUrl: '/' });
      if (result?.error) setError(result.error);
      else setSent(true);
    } catch {
      setError('Could not send magic link. Check Supabase email configuration.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: string) {
    setLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch {
      setError(`Could not sign in with ${provider}.`);
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="container" style={{ maxWidth: 440, margin: '80px auto', padding: 32, textAlign: 'center' }}>
        <h1 className="text-subhead" style={{ marginBottom: 12 }}>Check your email</h1>
        <p className="text-body" style={{ margin: 0 }}>A magic sign-in link has been sent to <strong>{email}</strong>.</p>
      </div>
    );
  }

  const useOAuth = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  return (
    <div className="container" style={{ maxWidth: 400, margin: '60px auto', padding: 24 }}>
      <h1 className="text-subhead" style={{ marginBottom: 8 }}>Andwell Intelligence Hub</h1>
      <p className="text-small muted" style={{ marginBottom: 24 }}>Sign in to access competitive intelligence and growth planning.</p>

      {error && <div className="card" style={{ padding: 12, marginBottom: 16, borderLeft: '4px solid var(--color-danger)' }}><p className="text-small" style={{ margin: 0, color: 'var(--color-danger)' }}>{error}</p></div>}

      <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}
        />
        <button type="submit" className="btn primary" disabled={loading} style={{ padding: '10px 14px' }}>
          {loading ? 'Sending...' : 'Send magic link'}
        </button>
      </form>

      {useOAuth && (
        <div style={{ marginTop: 20 }}>
          <p className="text-small muted" style={{ textAlign: 'center', marginBottom: 12 }}>or</p>
          <button className="btn" onClick={() => handleOAuth('google')} disabled={loading} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 8 }}>
            Sign in with Google
          </button>
        </div>
      )}

      <p className="text-xs muted" style={{ textAlign: 'center', marginTop: 24 }}>
        Only invited team members can access this application.
      </p>
    </div>
  );
}
