import { Hono } from 'hono';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { requireAuth } from '../middleware/auth';
import type { Variables } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

async function ensureDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch {}
}

export const upload = new Hono<{ Variables: Variables }>();

upload.use('*', requireAuth);

upload.post('/', async (c) => {
  await ensureDir();

  const formData = await c.req.raw.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof File)) return c.json({ error: 'No file uploaded' }, 400);

  const ext = path.extname(file.name).toLowerCase();
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];
  if (!allowed.includes(ext)) return c.json({ error: 'Unsupported file type' }, 400);

  const buffer = Buffer.from(await file.arrayBuffer());
  const base = crypto.randomUUID();

  const thumbnail = `${base}_thumb.webp`;
  const card = `${base}_card.webp`;
  const full = `${base}_full.webp`;

  await Promise.all([
    sharp(buffer)
      .resize(150, 150, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toFile(path.join(UPLOADS_DIR, thumbnail)),

    sharp(buffer)
      .resize(600, 400, { fit: 'cover', position: 'center' })
      .webp({ quality: 82 })
      .toFile(path.join(UPLOADS_DIR, card)),

    sharp(buffer)
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(UPLOADS_DIR, full)),
  ]);

  const baseUrl = process.env.STORAGE_ENDPOINT
    ? `${process.env.STORAGE_ENDPOINT.replace(/\/+$/, '')}/uploads`
    : `/uploads`;

  return c.json({
    thumbnail: `${baseUrl}/${thumbnail}`,
    card: `${baseUrl}/${card}`,
    full: `${baseUrl}/${full}`,
  });
});
