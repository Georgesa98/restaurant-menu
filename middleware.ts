import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Locale handling for /en/* and /ar/* paths only. The root landing (/) is
// intentionally excluded so it is never locale-redirected away.
export default createMiddleware(routing);

export const config = {
  matcher: ['/(en|ar)/:path*'],
};
