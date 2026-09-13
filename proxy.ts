import { NextResponse, type NextRequest } from 'next/server';
import { isLocale } from './i18n/routing';

// Compat: old shared/bookmarked URLs like /en/<slug>/menu or /ar/admin
// redirect to the prefixless URL and persist the locale in a cookie.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/');
  const maybeLocale = segments[1];

  if (!isLocale(maybeLocale)) return NextResponse.next();

  const rest = '/' + segments.slice(2).join('/');
  const url = request.nextUrl.clone();
  url.pathname = rest === '/' ? '/' : rest.replace(/\/+$/, '') || '/';
  url.search = request.nextUrl.search;

  const response =
    rest === '/' || rest === ''
      ? NextResponse.redirect(url)
      : NextResponse.redirect(url, 308);

  response.cookies.set('locale', maybeLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: ['/(en|ar)/:path*'],
};
