import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const endpoint = process.env.STORAGE_ENDPOINT;
const region = process.env.STORAGE_REGION ?? 'auto';
const bucket = process.env.STORAGE_BUCKET;
const publicUrl = process.env.STORAGE_PUBLIC_URL;

function getClient(): S3Client {
  const creds = process.env.STORAGE_ACCESS_KEY_ID
    ? { accessKeyId: process.env.STORAGE_ACCESS_KEY_ID, secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? '' }
    : undefined;

  return new S3Client({
    endpoint,
    region,
    credentials: creds,
    forcePathStyle: true,
  });
}

let client: S3Client | null = null;

function s3(): S3Client {
  if (!client) client = getClient();
  return client;
}

export async function uploadToBucket(
  tenantId: string,
  variants: { key: string; buffer: Buffer; contentType: string }[],
) {
  if (!bucket) throw new Error('STORAGE_BUCKET not configured');

  const baseUrl = publicUrl ? publicUrl.replace(/\/+$/, '') : `${endpoint?.replace(/\/+$/, '')}/${bucket}`;

  const results = await Promise.all(
    variants.map((v) =>
      s3().send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: `uploads/${tenantId}/${v.key}`,
          Body: v.buffer,
          ContentType: v.contentType,
        }),
      ).then(() => `${baseUrl}/uploads/${tenantId}/${v.key}`),
    ),
  );

  const [thumbnail, card, full] = results;
  return { thumbnail, card, full };
}
