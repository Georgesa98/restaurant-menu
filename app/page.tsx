import Link from "next/link"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export default async function Home() {
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">Restaurant Menus</h1>
      <p className="text-[var(--text-muted)] mb-8">Choose a restaurant to view their menu</p>
      <div className="grid gap-4">
        {tenants.map((t) => (
          <Link
            key={t.id}
            href={`/${t.slug}/menu`}
            className="block p-5 bg-[var(--surface)] rounded-[var(--radius)] shadow-sm hover:shadow-md transition-shadow border-l-4"
            style={{ borderLeftColor: t.primaryColor }}
          >
            <h2 className="text-lg font-semibold">{t.name}</h2>
            {t.description && (
              <p className="text-sm text-[var(--text-muted)] mt-1">{t.description}</p>
            )}
          </Link>
        ))}
      </div>
    </main>
  )
}
