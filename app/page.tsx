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
    select: { slug: true, domain: true },
  }) as { slug: string; domain: string | null }[];

  const domainMap: Record<string, string> = {};
  for (const t of tenants) {
    if (t.domain) domainMap[t.domain] = t.slug;
  }

  return (
    <div lang="ar" dir="rtl">
      <Script
        id="domain-redirect"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(){var m=${JSON.stringify(domainMap)};var slug=m[location.hostname];if(slug){if(!document.cookie.match(/(?:^|; )locale=/)){var l=navigator.language&&navigator.language.toLowerCase().startsWith("ar")?"ar":"en";document.cookie="locale="+l+";path=/;max-age=31536000;SameSite=Lax"}if(!location.pathname.startsWith("/"+slug+"/"))location.replace("/"+slug+"/menu/")}})()`,
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
