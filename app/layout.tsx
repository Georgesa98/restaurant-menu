import type { Metadata } from 'next';
import './globals.css';
import { Playfair_Display, Jost, Alex_Brush, Amiri } from 'next/font/google';
import { cn } from '@/lib/utils';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const alexBrush = Alex_Brush({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
});

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Restaurant Menu',
  description: 'Digital menus for restaurants',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      suppressHydrationWarning
      className={cn(
        'font-sans',
        playfair.variable,
        jost.variable,
        alexBrush.variable,
        amiri.variable
      )}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
