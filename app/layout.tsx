import type { Metadata } from 'next';
import './globals.css';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Restaurant Menu',
  description: 'Digital menus for restaurants',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className={cn('font-sans', geist.variable)}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
