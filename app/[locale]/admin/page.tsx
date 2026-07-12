"use client"

import { useState, use } from "react"
import { AuthProvider } from "@/components/admin/auth-provider"
import { AdminLayout, type AdminView } from "@/components/admin/admin-layout"
import { Dashboard } from "@/components/admin/dashboard"
import { CategoriesView } from "@/components/admin/categories-view"
import { ItemsView } from "@/components/admin/items-view"
import { SettingsView } from "@/components/admin/settings-view"

export default function AdminPage({ params: paramsPromise }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(paramsPromise)
  const [view, setView] = useState<AdminView>("dashboard")

  return (
    <AuthProvider locale={locale}>
      <AdminLayout view={view} onNavigate={setView}>
        {view === "dashboard" && <Dashboard />}
        {view === "categories" && <CategoriesView />}
        {view === "items" && <ItemsView />}
        {view === "settings" && <SettingsView />}
      </AdminLayout>
    </AuthProvider>
  )
}
