import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import { authConfig } from './auth.config';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID || 'dummy',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'dummy',
    }),
    Credentials({
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.neptechbrief.com/wp-json/wp/v2'}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });

          if (!res.ok) return null;
          const data = await res.json();
          
          return {
            id: data.user.id.toString(),
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            accessToken: data.access_token,
          } as any;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      if (account && (account.provider === 'google' || account.provider === 'facebook')) {
        // Ping Laravel backend to sync user and get Sanctum token
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.neptechbrief.com/wp-json/wp/v2'}/auth/social-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user?.email,
              name: user?.name,
              provider_name: account.provider,
              provider_id: account.providerAccountId,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            token.role = data.user.role;
            token.accessToken = data.access_token;
          }
        } catch (e) {
          console.error("Social login sync failed", e);
        }
      } else if (user) {
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
});
