import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';

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

/**
 * Ensure the bucket exists and is public-read-only (GetObject for anyone,
 * all writes still require credentials). Safe to call on every boot.
 * Direct public S3 URLs only work if this policy is in place.
 */
export async function ensureBucket() {
  if (!bucket) throw new Error('STORAGE_BUCKET not configured');

  try {
    await s3().send(new HeadBucketCommand({ Bucket: bucket }));
  } catch {
    await s3().send(new CreateBucketCommand({ Bucket: bucket }));
  }

  await s3().send(
    new PutBucketPolicyCommand({
      Bucket: bucket,
      Policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucket}/*`],
          },
        ],
      }),
    }),
  );
}
