import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Exclude static files, API routes, and system files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/feed.xml'
  ) {
    return;
  }

  // Continue with other middleware logic (if any)
  return;
}) as any;

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|sitemap.xml|robots.txt|feed.xml).*)'],
};
