import sharp from 'sharp';
import { uploadToBucket } from '@/lib/storage';
import { requireSession } from '@/lib/require-session';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const { userTenantId, userRole } = r.session;

  const formData = await req.formData();
  // Super admins manage many tenants: allow an explicit override, otherwise
  // the uploader's own tenant (matches the old Hono behavior).
  const override = formData.get('tenantId');
  const tenantId =
    userRole === 'SUPER_ADMIN' && typeof override === 'string' && override
      ? override
      : userTenantId;
  if (!tenantId) return Response.json({ error: 'Tenant not found' }, { status: 400 });

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return Response.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];
  if (!allowed.includes(ext)) return Response.json({ error: 'Unsupported file type' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const base = crypto.randomUUID();

  // Crop to 4:3, generate card sizes for srcset.
  const [cardBuf, retinaBuf] = await Promise.all([
    sharp(buffer).resize(400, 300, { fit: 'cover', position: 'center' }).webp({ quality: 80 }).toBuffer(),
    sharp(buffer).resize(800, 600, { fit: 'cover', position: 'center' }).webp({ quality: 80 }).toBuffer(),
  ]);

  const keys = await uploadToBucket(tenantId, [
    { key: `${base}_card.webp`, buffer: cardBuf, contentType: 'image/webp' },
    { key: `${base}_card@2x.webp`, buffer: retinaBuf, contentType: 'image/webp' },
  ]);

  // Direct public S3 URL — no proxy. Bucket must be public-read.
  const publicBase = process.env.STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, '');
  if (!publicBase) return Response.json({ error: 'STORAGE_PUBLIC_BASE_URL not configured' }, { status: 500 });

  return Response.json({
    url: `${publicBase}/${keys[`${base}_card`]}`,
  });
}
