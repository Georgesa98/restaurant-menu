import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  // Same-origin: auth routes live at /api/auth on this host.
});
