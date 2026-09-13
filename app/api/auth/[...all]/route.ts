import { auth } from '@/lib/auth-server';

// trailingSlash:true makes Next.js 308-redirect POSTs to the slashed URL,
// which better-auth's exact-path router doesn't match (empty 404).
// Strip one trailing slash before delegating so both variants work.
function withoutTrailingSlash(req: Request): Request {
  const url = new URL(req.url);
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
    return new Request(url, req);
  }
  return req;
}

async function handle(req: Request): Promise<Response> {
  return auth.handler(withoutTrailingSlash(req));
}

export const GET = handle;
export const POST = handle;
