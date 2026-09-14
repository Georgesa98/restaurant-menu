import { createAuthClient } from 'better-auth/client';
import { usernameClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  // Same-origin: auth routes live at /api/auth on this host.
  plugins: [usernameClient()],
});
