export function LanguageSwitcher({ locale, slug }: { locale: string; slug: string }) {
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
