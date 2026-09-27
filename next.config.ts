import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const storagePublicBaseUrl =
  process.env.STORAGE_PUBLIC_BASE_URL ?? 'https://cdn-menu.georgesalebe.me/menu-media';
const storageFallbackBaseUrl =
  process.env.STORAGE_FALLBACK_PUBLIC_BASE_URL ?? 'https://s3-menu.georgesalebe.me/menu-media';
const storageUrls = [new URL(storagePublicBaseUrl), new URL(storageFallbackBaseUrl)];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: storageUrls.map((url) => ({
      protocol: 'https',
      hostname: url.hostname,
      pathname: `${url.pathname.replace(/\/$/, '')}/**`,
    })),
  },
  trailingSlash: true,
};

export default withNextIntl(nextConfig);
