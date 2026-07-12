import { Prisma } from "@prisma/client"

type TenantWithMenu = Prisma.TenantGetPayload<{
  include: {
    categories: {
      include: {
        items: true
      }
    }
  }
}>

export function MenuPage({ tenant }: { tenant: TenantWithMenu }) {
  return (
    <>
      <style>{`
        :root {
          --primary: ${tenant.primaryColor};
          --secondary: ${tenant.secondaryColor};
          --accent: ${tenant.accentColor};
          --bg: ${tenant.backgroundColor};
          --font: ${tenant.fontFamily};
          --radius: ${tenant.borderRadius};
        }
      `}</style>
      <main
        className="min-h-dvh"
        style={{ fontFamily: tenant.fontFamily, background: tenant.backgroundColor }}
      >
        <div className="max-w-2xl mx-auto px-4 py-8">
          <header className="text-center mb-10">
            {tenant.logoUrl && (
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="h-16 mx-auto mb-4 object-contain"
              />
            )}
            <h1
              className="text-3xl font-bold"
              style={{ color: tenant.secondaryColor }}
            >
              {tenant.name}
            </h1>
            {tenant.description && (
              <p className="mt-1" style={{ color: tenant.secondaryColor, opacity: 0.8 }}>
                {tenant.description}
              </p>
            )}
            {(tenant.address || tenant.phone) && (
              <div className="mt-3 text-sm space-y-1" style={{ color: tenant.secondaryColor, opacity: 0.7 }}>
                {tenant.address && <p>{tenant.address}</p>}
                {tenant.phone && <p>{tenant.phone}</p>}
              </div>
            )}
          </header>

          <div className="space-y-10">
            {tenant.categories
              .filter((c) => c.isActive)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((category) => (
              <section key={category.id}>
                <div
                  className="flex items-center gap-3 mb-4 pb-2"
                  style={{ borderBottom: `2px solid ${tenant.accentColor}` }}
                >
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: tenant.secondaryColor }}
                  >
                    {category.name}
                  </h2>
                  {category.description && (
                    <span className="text-sm" style={{ color: tenant.secondaryColor, opacity: 0.6 }}>
                      — {category.description}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {category.items
                    .filter((i) => i.isAvailable)
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 rounded-[var(--radius)]"
                      style={{ background: "var(--surface, #ffffff)" }}
                    >
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-20 h-20 rounded-[var(--radius)] object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium">{item.name}</h3>
                          <span
                            className="font-bold whitespace-nowrap shrink-0"
                            style={{ color: tenant.primaryColor }}
                          >
                            ${Number(item.price).toFixed(2)}
                          </span>
                        </div>
                        {item.description && (
                          <p
                            className="text-sm mt-1"
                            style={{ color: tenant.secondaryColor, opacity: 0.7 }}
                          >
                            {item.description}
                          </p>
                        )}
                        {item.dietaryTags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {item.dietaryTags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  background: tenant.accentColor + "20",
                                  color: tenant.accentColor,
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {tenant.instagram && (
            <footer className="text-center mt-12 pb-8">
              <a
                href={`https://instagram.com/${tenant.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm inline-flex items-center gap-1"
                style={{ color: tenant.secondaryColor, opacity: 0.6 }}
              >
                {tenant.instagram}
              </a>
            </footer>
          )}
        </div>
      </main>
    </>
  )
}
