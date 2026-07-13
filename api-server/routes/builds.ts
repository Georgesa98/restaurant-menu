import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { Variables } from '../types';

export const builds = new Hono<{ Variables: Variables }>();

builds.use('*', requireAuth);

builds.post('/trigger', async (c) => {
  const hookUrl = process.env.COOLIFY_BUILD_HOOK;
  if (!hookUrl) return c.json({ error: 'Build hook not configured' }, 500);

  const res = await fetch(hookUrl, { method: 'POST' });
  if (!res.ok) {
    return c.json({ error: `Hook returned ${res.status}` }, 502);
  }

  return c.json({ triggered: true });
});
