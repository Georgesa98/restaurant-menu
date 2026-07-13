"use client"

import { useState, useMemo } from "react"
import type { TenantData, WithTranslations } from "@/lib/types"
import { LanguageSwitcher } from "./language-switcher"

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

function formatPrice(price: number, locale: string): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

export function OrderMenu({ tenant, locale }: { tenant: TenantData; locale: string }) {
  const [quantities, setQuantities] = useState<Map<string, number>>(new Map())

  const space = spaceToPx(tenant.spacing)
  const gridCols = tenant.menuLayout === "two-column" ? "repeat(2, 1fr)" : "1fr"
  const isRtl = locale === "ar"

  const totalItems = useMemo(() => {
    let count = 0
    for (const q of quantities.values()) count += q
    return count
  }, [quantities])

  const totalPrice = useMemo(() => {
    let total = 0
    for (const [id, q] of quantities) {
      const item = tenant.categories
        .flatMap((c) => c.items)
        .find((i) => i.id === id)
      if (item) total += Number(item.price) * q
    }
    return total
  }, [quantities, tenant.categories])

  function setQuantity(id: string, delta: number) {
    setQuantities((prev) => {
      const next = new Map(prev)
      const current = next.get(id) ?? 0
      const updated = current + delta
      if (updated <= 0) next.delete(id)
      else next.set(id, updated)
      return next
    })
  }

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
        {/* Order bar */}
        {totalItems > 0 && (
          <div
            className="sticky top-0 z-10 py-3 px-4"
            style={{
              background: tenant.primaryColor,
              color: "#fff",
            }}
          >
            <div className="mx-auto flex items-center justify-between" style={{ maxWidth: tenant.menuLayout === "two-column" ? "900px" : "640px" }}>
              <span className="text-sm font-medium">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </span>
              <span className="text-sm font-bold">
                {formatPrice(totalPrice, locale)}
              </span>
            </div>
          </div>
        )}

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
                  <section key={category.id}>
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
                        const qty = quantities.get(item.id) ?? 0
                        return (
                          <div
                            key={item.id}
                            className="menu-card overflow-hidden"
                          >
                            {item.imageCard && (
                              <div className="aspect-[3/2] overflow-hidden">
                                <img
                                  src={item.imageCard}
                                  alt={itemTrans.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="p-4">
                              <div className={`flex items-start justify-between gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                                <h3 className="font-medium">{itemTrans.name}</h3>
                                <span
                                  className="font-bold whitespace-nowrap shrink-0"
                                  style={{ color: tenant.primaryColor }}
                                >
                                  {formatPrice(Number(item.price), locale)}
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
                              <div className={`flex items-center gap-2 mt-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                                {qty > 0 ? (
                                  <>
                                    <button
                                      onClick={() => setQuantity(item.id, -1)}
                                      className="size-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                                      style={{
                                        background: tenant.primaryColor + "15",
                                        color: tenant.primaryColor,
                                      }}
                                    >
                                      −
                                    </button>
                                    <span className="text-sm font-semibold w-5 text-center tabular-nums">
                                      {qty}
                                    </span>
                                  </>
                                ) : null}
                                <button
                                  onClick={() => setQuantity(item.id, 1)}
                                  className="size-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                                  style={{
                                    background: qty > 0 ? tenant.primaryColor : tenant.primaryColor + "15",
                                    color: qty > 0 ? "#fff" : tenant.primaryColor,
                                  }}
                                >
                                  +
                                </button>
                              </div>
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
