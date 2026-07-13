import type { TenantData, WithTranslations } from "@/lib/types"

function t(item: WithTranslations<{ name: string; description: string | null }>): { name: string; description: string | null } {
  const tr = item.translations?.[0]
  return {
    name: tr?.name ?? item.name,
    description: tr?.description ?? item.description,
  }
}

function spaceToPx(space: string): string {
  if (space === "compact") return "12px"
  if (space === "spacious") return "24px"
  return "16px"
}

export function MenuPage({
  tenant,
  locale,
  highlightCategory,
}: {
  tenant: TenantData
  locale: string
  highlightCategory?: string
}) {
  const space = spaceToPx(tenant.spacing)
  const gridCols = tenant.menuLayout === "two-column" ? "repeat(2, 1fr)" : "1fr"
  const isRtl = locale === "ar"

  return (
    <>
      <style>{`
        :root {
          --primary: ${tenant.primaryColor};
          --secondary: ${tenant.secondaryColor};
          --accent: ${tenant.accentColor};
          --bg: ${tenant.backgroundColor};
          --surface: ${tenant.surfaceColor};
          --text: ${tenant.textColor};
          --text-muted: ${tenant.textMuted};
          --font-heading: ${tenant.headingFont};
          --font-body: ${tenant.bodyFont};
          --radius-sm: ${tenant.borderRadiusSm};
          --radius-md: ${tenant.borderRadiusMd};
          --radius-lg: ${tenant.borderRadiusLg};
          --shadow: ${tenant.shadow};
          --card-style: ${tenant.cardStyle};
          --menu-grid: ${gridCols};
          --space: ${space};
        }
        ${tenant.cardStyle === "bordered"
          ? `.menu-card { background: var(--surface); border: 1px solid color-mix(in srgb, var(--text-muted) 20%, transparent); border-radius: var(--radius-md); }`
          : tenant.cardStyle === "flat"
          ? `.menu-card { background: var(--surface); border-radius: var(--radius-md); }`
          : `.menu-card { background: var(--surface); border-radius: var(--radius-md); box-shadow: var(--shadow); }`}
        ${tenant.customCss ?? ""}
      `}</style>

      <main
        className="min-h-dvh"
        style={{
          fontFamily: tenant.bodyFont,
          background: tenant.backgroundColor,
          color: tenant.textColor,
        }}
      >
        <div
          className="mx-auto px-4 py-8"
          style={{ maxWidth: tenant.menuLayout === "two-column" ? "900px" : "640px" }}
        >
          {/* Language Switcher */}
          <div className={`mb-6 ${isRtl ? "text-left" : "text-right"}`}>
            <LanguageSwitcher locale={locale} slug={tenant.slug} />
          </div>

          <header className={`text-center mb-10 ${isRtl ? "rtl" : ""}`}>
            {tenant.logoUrl && (
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="h-16 mx-auto mb-4 object-contain"
              />
            )}
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: tenant.headingFont, color: tenant.secondaryColor }}
            >
              {tenant.name}
            </h1>
            {tenant.description && (
              <p className="mt-1" style={{ color: tenant.textMuted }}>
                {tenant.description}
              </p>
            )}
            {(tenant.address || tenant.phone) && (
              <div
                className="mt-3 text-sm space-y-1"
                style={{ color: tenant.textMuted }}
              >
                {tenant.address && <p>{tenant.address}</p>}
                {tenant.phone && <p>{tenant.phone}</p>}
              </div>
            )}
          </header>

          <div className="space-y-10">
            {tenant.categories
              .filter((c) => c.isActive)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((category) => {
                const catTrans = t(category)
                const items = category.items
                  .filter((i) => i.isAvailable)
                  .sort((a, b) => a.displayOrder - b.displayOrder)

                return (
                  <section
                    key={category.id}
                    id={`cat-${category.slug}`}
                    style={{
                      scrollMarginTop: highlightCategory === category.slug ? "-16px" : undefined,
                    }}
                  >
                    <div
                      className={`flex items-center gap-3 mb-4 pb-2 ${isRtl ? "flex-row-reverse" : ""}`}
                      style={{ borderBottom: `2px solid ${tenant.accentColor}` }}
                    >
                      <h2
                        className="text-xl font-semibold"
                        style={{ fontFamily: tenant.headingFont, color: tenant.secondaryColor }}
                      >
                        {catTrans.name}
                      </h2>
                      {catTrans.description && (
                        <span className="text-sm" style={{ color: tenant.textMuted }}>
                          — {catTrans.description}
                        </span>
                      )}
                    </div>

                    <div
                      className="gap-3"
                      style={{
                        display: "grid",
                        gridTemplateColumns: gridCols,
                        gap: space,
                      }}
                    >
                      {items.map((item) => {
                        const itemTrans = t(item)
                        return (
                          <div
                            key={item.id}
                            className="menu-card flex gap-3 p-4"
                          >
                            {item.imageCard && (
                              <img
                                src={item.imageCard}
                                alt={itemTrans.name}
                                className={`w-20 h-20 object-cover shrink-0 ${isRtl ? "order-last" : ""}`}
                                style={{ borderRadius: tenant.borderRadiusSm }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className={`flex items-start justify-between gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                                <h3 className="font-medium">{itemTrans.name}</h3>
                                <span
                                  className="font-bold whitespace-nowrap shrink-0"
                                  style={{ color: tenant.primaryColor }}
                                >
                                  ${Number(item.price).toFixed(2)}
                                </span>
                              </div>
                              {itemTrans.description && (
                                <p
                                  className="text-sm mt-1"
                                  style={{ color: tenant.textMuted }}
                                >
                                  {itemTrans.description}
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
                        )
                      })}
                    </div>
                  </section>
                )
              })}
          </div>

          {tenant.instagram && (
            <footer className="text-center mt-12 pb-8">
              <a
                href={`https://instagram.com/${tenant.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm inline-flex items-center gap-1"
                style={{ color: tenant.textMuted }}
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

function LanguageSwitcher({ locale, slug }: { locale: string; slug: string }) {
  const otherLocale = locale === "ar" ? "en" : "ar"
  const label = otherLocale === "ar" ? "العربية" : "English"

  return (
    <a
      href={`/${otherLocale}/${slug}/menu`}
      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-[var(--radius-sm)] transition-colors hover:opacity-80"
      style={{
        background: "color-mix(in srgb, var(--text-muted) 10%, transparent)",
        color: "var(--text-muted)",
      }}
    >
      {label}
    </a>
  )
}
