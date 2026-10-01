import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sufra · سفرة',
    short_name: 'Sufra',
    description: 'Digital menus for restaurants — Sufra',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f5f0',
    theme_color: '#c8412f',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
