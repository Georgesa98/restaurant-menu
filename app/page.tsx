import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Script from 'next/script';
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Showcase } from '@/components/landing/showcase';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Pricing } from '@/components/landing/pricing';
import { Faq } from '@/components/landing/faq';
import { Contact, Footer } from '@/components/landing/contact';

// Fully dynamic sales landing (Arabic-first). Only the custom-domain map is
// read from the DB — no tenant data is rendered or exposed here.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'نظام المنيو | منيو إلكتروني لمطعمك',
  description: 'صفحة منيو باسم مطعمك، بالعربي والإنجليزي، بتتحدث لحالا. احكينا واتساب.',
};

export default async function Home() {
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true, slug: { not: null } },
    select: { slug: true, domain: true, defaultLocale: true },
  }) as { slug: string; domain: string | null; defaultLocale: string }[];

  const domainMap: Record<string, { slug: string; locale: string }> = {};
  for (const t of tenants) {
    if (t.domain) domainMap[t.domain] = { slug: t.slug, locale: t.defaultLocale };
  }

  return (
    <div lang="ar" dir="rtl">
      <Script
        id="domain-redirect"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(){var m=${JSON.stringify(domainMap)};var entry=m[location.hostname];if(entry){var lang=navigator.language&&navigator.language.startsWith("ar")?"ar":entry.locale;if(!location.pathname.startsWith("/"+lang+"/"+entry.slug))location.replace("/"+lang+"/"+entry.slug+"/menu/")}})()`,
        }}
      />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Showcase />
        <HowItWorks />
        <Pricing />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
