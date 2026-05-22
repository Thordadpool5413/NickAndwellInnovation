import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/', '/login', '/api/auth', '/api/version', '/api/health', '/api/diagnostics'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  const isApi = pathname.startsWith('/api/');

  if (isPublic) return NextResponse.next();

  const useAuth = Boolean(process.env.NEXTAUTH_SECRET && process.env.SUPABASE_URL);
  if (!useAuth) return NextResponse.next();

  const sessionToken = request.cookies.get('next-auth.session-token')?.value
    || request.cookies.get('__session')?.value;

  if (!sessionToken && !isApi) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!sessionToken && isApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
