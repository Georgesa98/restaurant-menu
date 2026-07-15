import { Readable } from 'stream';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const endpoint = process.env.STORAGE_ENDPOINT;
const region = process.env.STORAGE_REGION ?? 'auto';
const bucket = process.env.STORAGE_BUCKET;

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

  const results: Record<string, string> = {};
  await Promise.all(
    variants.map((v) => {
      const storageKey = `uploads/${tenantId}/${v.key}`;
      return s3()
        .send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: storageKey,
            Body: v.buffer,
            ContentType: v.contentType,
          }),
        )
        .then(() => {
          const name = v.key.replace(/\.\w+$/, '');
          results[name] = storageKey;
        });
    }),
  );

  return results;
}

export async function streamFromBucket(key: string) {
  if (!bucket) throw new Error('STORAGE_BUCKET not configured');

  const { Body, ContentType } = await s3().send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );

  const stream = Readable.toWeb(Body as Readable);
  return { stream, contentType: ContentType ?? 'image/webp' };
}
