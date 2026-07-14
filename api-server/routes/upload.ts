import { Hono } from 'hono';
import sharp from 'sharp';
import path from 'path';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth';
import { uploadToBucket } from '../../lib/storage';
import type { Variables } from '../types';

export const upload = new Hono<{ Variables: Variables }>();

upload.use('*', requireAuth);

upload.post('/', async (c) => {
  const tenantId = c.get('userTenantId');
  if (!tenantId) return c.json({ error: 'Tenant not found' }, 400);

  const formData = await c.req.raw.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof File)) return c.json({ error: 'No file uploaded' }, 400);

  const ext = path.extname(file.name).toLowerCase();
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];
  if (!allowed.includes(ext)) return c.json({ error: 'Unsupported file type' }, 400);

  const buffer = Buffer.from(await file.arrayBuffer());
  const base = crypto.randomUUID();

  // Crop to 4:3, generate card (~400w) and retina (~800w) WebP sizes.
  const [thumbBuf, cardBuf, retinaBuf, fullBuf] = await Promise.all([
    sharp(buffer).resize(150, 150, { fit: 'cover', position: 'center' }).webp({ quality: 80 }).toBuffer(),
    sharp(buffer).resize(400, 300, { fit: 'cover', position: 'center' }).webp({ quality: 80 }).toBuffer(),
    sharp(buffer).resize(800, 600, { fit: 'cover', position: 'center' }).webp({ quality: 80 }).toBuffer(),
    sharp(buffer).resize(1200, 900, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(),
  ]);

  const keys = await uploadToBucket(tenantId, [
    { key: `${base}_thumb.webp`, buffer: thumbBuf, contentType: 'image/webp' },
    { key: `${base}_card.webp`, buffer: cardBuf, contentType: 'image/webp' },
    { key: `${base}_card@2x.webp`, buffer: retinaBuf, contentType: 'image/webp' },
    { key: `${base}_full.webp`, buffer: fullBuf, contentType: 'image/webp' },
  ]);

  return c.json({
    thumbnail: `/${keys.thumbnail}`,
    card: `/${keys.card}`,
    full: `/${keys.full}`,
  });
});
