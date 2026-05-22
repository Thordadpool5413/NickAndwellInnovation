import NextAuth from 'next-auth';
import type { OAuthConfig } from 'next-auth/providers/oauth';

function cleanEnvValue(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, '');
}

const supabaseUrl = cleanEnvValue(process.env.SUPABASE_URL) || '';
const supabaseServiceKey = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY) || '';

const supabaseProvider: OAuthConfig<any> = {
  id: 'supabase',
  name: 'Supabase',
  type: 'oauth',
  wellKnown: `${supabaseUrl}/.well-known/openid-configuration`,
  authorization: { params: { scope: 'openid email profile' } },
  idToken: true,
  clientId: process.env.SUPABASE_CLIENT_ID || supabaseUrl,
  clientSecret: process.env.SUPABASE_SECRET || supabaseServiceKey,
  checks: ['pkce', 'state'],
  profile(profile: Record<string, unknown>) {
    return { id: String(profile.sub ?? ''), email: String(profile.email ?? ''), name: String(profile.email ?? '').split('@')[0] || '', image: null };
  },
};

const authConfig = {
  providers: [supabaseProvider],
  session: { strategy: 'jwt' as const },
  callbacks: {
    session({ session, token }: { session: any; token: any }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
  pages: { signIn: '/login' },
};

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };
