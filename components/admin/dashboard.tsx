"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useAuth } from "./auth-provider"
import { api } from "@/lib/api"

export function Dashboard() {
  const t = useTranslations("admin")
  const { user } = useAuth()
  const [stats, setStats] = useState<{ categories: number; items: number } | null>(null)

  useEffect(() => {
    const tenantId = user?.tenantId
    if (!tenantId && user?.role !== "SUPER_ADMIN") return

    const params = tenantId ? { tenantId } : {}
    Promise.all([
      api.get("/api/categories", { params }),
      api.get("/api/items", { params }),
    ]).then(([catRes, itemRes]) => {
      setStats({
        categories: catRes.data.length,
        items: itemRes.data.length,
      })
    })
  }, [user])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("dashboard")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">{t("categories")}</p>
          <p className="text-3xl font-bold mt-1">{stats?.categories ?? "—"}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">{t("items")}</p>
          <p className="text-3xl font-bold mt-1">{stats?.items ?? "—"}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">{t("settings")}</p>
          <p className="text-3xl font-bold mt-1">{user?.name?.[0]?.toUpperCase() ?? "—"}</p>
        </div>
      </div>
    </div>
  )
}
