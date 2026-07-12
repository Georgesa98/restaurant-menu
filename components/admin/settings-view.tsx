"use client"

import { useTranslations } from "next-intl"

const THEME_FIELDS = [
  "primaryColor", "secondaryColor", "accentColor",
  "backgroundColor", "surfaceColor", "textColor", "textMuted",
  "headingFont", "bodyFont",
  "borderRadiusSm", "borderRadiusMd", "borderRadiusLg",
  "shadow",
] as const

const LAYOUT_FIELDS = [
  "cardStyle", "menuLayout", "spacing",
] as const

export function SettingsView() {
  const t = useTranslations("admin")

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("settings")}</h1>
      <p className="text-gray-500 text-sm">Theme editor coming in a future update.</p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {THEME_FIELDS.map((field) => (
          <div key={field} className="bg-white rounded-xl shadow-sm border p-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t(field)}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="w-8 h-8 rounded border cursor-pointer"
                defaultValue={getDefault(field)}
              />
              <input
                type="text"
                className="flex-1 text-xs border rounded px-2 py-1"
                defaultValue={getDefault(field)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getDefault(field: string): string {
  const defaults: Record<string, string> = {
    primaryColor: "#e74c3c",
    secondaryColor: "#2c3e50",
    accentColor: "#f39c12",
    backgroundColor: "#fdf5e6",
    surfaceColor: "#ffffff",
    textColor: "#1a1a2e",
    textMuted: "#64748b",
    headingFont: "Georgia, serif",
    bodyFont: "Inter, system-ui, sans-serif",
    borderRadiusSm: "4px",
    borderRadiusMd: "8px",
    borderRadiusLg: "16px",
    shadow: "0 2px 8px rgba(0,0,0,0.08)",
  }
  return defaults[field] ?? ""
}
