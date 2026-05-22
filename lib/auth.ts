import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function cleanEnvValue(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, '');
}

const supabaseUrl = cleanEnvValue(process.env.SUPABASE_URL);
const supabaseAnonKey = cleanEnvValue(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const supabaseServiceKey = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

export function isAuthConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && process.env.NEXTAUTH_SECRET);
}

export function getAnonClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: { headers: { 'x-application-name': 'competitive-intelligence-hub' } },
  });
}

export function getServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-application-name': 'competitive-intelligence-hub' } },
  });
}

export const publicPaths = ['/', '/api/auth', '/api/version', '/api/health', '/api/diagnostics'];

export function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname.startsWith(p));
}

export function getUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7) || null;
  }
  const sessionCookie = request.cookies.get('next-auth.session-token')?.value
    || request.cookies.get('__session')?.value;
  return sessionCookie || null;
}
