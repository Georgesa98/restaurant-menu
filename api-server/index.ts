import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from '../lib/auth-server';
import { categories } from './routes/categories';
import { items } from './routes/items';
import { translations } from './routes/translations';
import { tenants } from './routes/tenants';
import { upload } from './routes/upload';
import { exportData } from './routes/export';
import { importData } from './routes/import';
import { builds } from './routes/builds';
import { streamFromBucket } from '../lib/storage';

const app = new Hono();

app.use(
  '/api/*',
  cors({
    origin: (origin) => origin,
    credentials: true,
  }),
);
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

app.route('/api/categories', categories);
app.route('/api/items', items);
app.route('/api/translations', translations);
app.route('/api/tenants', tenants);
app.route('/api/upload', upload);
app.route('/api/export', exportData);
app.route('/api/import', importData);
app.route('/api/builds', builds);

app.get('/uploads/*', async (c) => {
  const key = c.req.path.slice(1);
  try {
    const { stream, contentType } = await streamFromBucket(key);
    return new Response(stream, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch {
    return c.notFound();
  }
});

app.get('/*', async (c) => {
  const { serveStatic } = await import('@hono/node-server/serve-static');
  const res = await serveStatic({ root: './out' })(c, () => Promise.resolve());
  if (res) return res;
  const { readFile } = await import('fs/promises');
  try {
    const html = await readFile('./out/index.html', 'utf-8');
    return c.html(html);
  } catch {
    return c.notFound();
  }
});

app.notFound((c) => c.json({ error: 'Not found', path: c.req.path }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

serve({ fetch: app.fetch, port }, () => {
  console.log(`API server running on http://localhost:${port}`);
});
