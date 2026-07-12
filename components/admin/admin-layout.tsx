"use client"

import { useTranslations } from "next-intl"
import { useAuth } from "./auth-provider"
import type { ReactNode } from "react"

const views = ["dashboard", "categories", "items", "settings"] as const
export type AdminView = (typeof views)[number]

export function AdminLayout({
  view,
  onNavigate,
  children,
}: {
  view: AdminView
  onNavigate: (v: AdminView) => void
  children: ReactNode
}) {
  const t = useTranslations("admin")
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-dvh flex">
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold text-sm">MenuHost Admin</h2>
          <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {views.map((v) => (
            <button
              key={v}
              onClick={() => onNavigate(v)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                view === v ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {t(v)}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-700">
          <button
            onClick={signOut}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 transition-colors"
          >
            {t("logout")}
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
    </div>
  )
}
