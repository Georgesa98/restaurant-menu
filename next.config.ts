import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3-menu.georgesalebe.me',
        pathname: '/menu-media/**',
      },
    ],
  },
  trailingSlash: true,
};

export default withNextIntl(nextConfig);
