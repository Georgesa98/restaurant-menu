import { prisma } from '@/lib/prisma';
import Script from 'next/script';

export default async function Home() {
  let tenants: { slug: string; name: string; description: string | null; primaryColor: string; domain: string | null; defaultLocale: string }[];
  try {
    tenants = await prisma.tenant.findMany({
      where: { isActive: true, slug: { not: null } },
      orderBy: { name: 'asc' },
      select: { slug: true, name: true, description: true, primaryColor: true, domain: true, defaultLocale: true },
    }) as typeof tenants;
  } catch {
    tenants = [];
  }

  const domainMap: Record<string, { slug: string; locale: string }> = {};
  for (const t of tenants) {
    if (t.domain) domainMap[t.domain] = { slug: t.slug, locale: t.defaultLocale };
  }

  return (
    <>
      <Script
        id="domain-redirect"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(){var m=${JSON.stringify(domainMap)};var entry=m[location.hostname];if(entry){var lang=navigator.language&&navigator.language.startsWith("ar")?"ar":entry.locale;if(!location.pathname.startsWith("/"+lang+"/"+entry.slug))location.replace("/"+lang+"/"+entry.slug+"/menu/")}})()`,
        }}
      />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Restaurant Menus
        </h1>
        <p className="text-[var(--text-muted)] mb-8">Choose a restaurant to view their menu</p>
        <div className="grid gap-4">
          {tenants.map((t) => (
            <a
              key={t.slug}
              href={`/en/${t.slug}/menu`}
              className="block p-5 bg-[var(--surface)] rounded-[var(--radius-md)] shadow-[var(--shadow)] hover:shadow-md transition-shadow border-l-4"
              style={{ borderLeftColor: t.primaryColor }}
            >
              <h2 className="text-lg font-semibold">{t.name}</h2>
              {t.description && <p className="text-sm text-[var(--text-muted)] mt-1">{t.description}</p>}
              {t.domain && <p className="text-xs mt-1 opacity-60">{t.domain}</p>}
            </a>
          ))}
        </div>
      </main>
    </>
  );
}
