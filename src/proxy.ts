import { NextRequest, NextResponse } from 'next/server';

/**
 * Sets a per-request nonce Content-Security-Policy. Next.js reads the nonce from the
 * request header and applies it to its own scripts; 'strict-dynamic' lets those scripts
 * load Vercel Analytics and Cloudflare Turnstile. Inline style attributes are used
 * throughout the site, so style-src keeps 'unsafe-inline'.
 */

// Payload's admin sets its light/dark theme with one inline script that carries no
// nonce. Allow exactly that script by hash on /admin. If a Payload upgrade changes it,
// the browser console shows the new hash; the only effect meanwhile is a brief flash
// of the wrong theme.
const PAYLOAD_THEME_SCRIPT_HASH = "'sha256-eW4XVtkvWTCtmjlnNAPE5rZMcNdfXCcVtmT7b4zs/SM='";

// Dashboard pages that must stay reachable before the two-step code is entered.
const ADMIN_OPEN = /^\/admin\/(login|logout|forgot|reset|create-first-user|unauthorized)(\/|$)/;

export function proxy(request: NextRequest) {
  // Signed in to the dashboard but no two-step pass yet: go and enter the code first. The real
  // check is in the access rules (src/access/roles.ts); this just sends people to the right page.
  const path = request.nextUrl.pathname;
  if (path.startsWith('/admin') && !ADMIN_OPEN.test(path) && request.cookies.has('payload-token') && !request.cookies.has('oj_staff_2fa')) {
    const url = new URL('/staff/two-step', request.url);
    url.searchParams.set('next', path + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';
  const isAdmin = request.nextUrl.pathname.startsWith('/admin');
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isAdmin ? ` ${PAYLOAD_THEME_SCRIPT_HASH}` : ''} https://va.vercel-scripts.com https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://challenges.cloudflare.com",
    'frame-src https://challenges.cloudflare.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:png|jpg|jpeg|svg|webp|ico)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
