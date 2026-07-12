import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import Link from "next/link"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export default async function Home() {
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { slug: true, name: true, description: true, primaryColor: true, domain: true },
  })

  const domainMap: Record<string, string> = {}
  for (const t of tenants) {
    if (t.domain) domainMap[t.domain] = t.slug
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var m=${JSON.stringify(domainMap)};var s=m[location.hostname];if(s&&!location.pathname.startsWith("/"+s))location.replace("/"+s+"/menu/")})()`,
        }}
      />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Restaurant Menus
        </h1>
        <p className="text-[var(--text-muted)] mb-8">Choose a restaurant to view their menu</p>
        <div className="grid gap-4">
          {tenants.map((t) => (
            <Link
              key={t.slug}
              href={`/${t.slug}/menu`}
              className="block p-5 bg-[var(--surface)] rounded-[var(--radius-md)] shadow-[var(--shadow)] hover:shadow-md transition-shadow border-l-4"
              style={{ borderLeftColor: t.primaryColor }}
            >
              <h2 className="text-lg font-semibold">{t.name}</h2>
              {t.description && (
                <p className="text-sm text-[var(--text-muted)] mt-1">{t.description}</p>
              )}
              {t.domain && (
                <p className="text-xs mt-1 opacity-60">{t.domain}</p>
              )}
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
