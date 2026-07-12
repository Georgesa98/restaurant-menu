"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useAuth } from "./auth-provider"
import { api } from "@/lib/api"

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  displayOrder: number
  isActive: boolean
  translations: { locale: string; name: string; description: string | null }[]
}

const LOCALES = ["en", "ar"]

export function CategoriesView() {
  const t = useTranslations("admin")
  const { user } = useAuth()
  const [cats, setCats] = useState<Category[]>([])
  const [editing, setEditing] = useState<Category | null>(null)
  const [localeTab, setLocaleTab] = useState("en")

  const tenantId = user?.role === "SUPER_ADMIN" ? "" : user?.tenantId

  async function load() {
    const res = await api.get("/api/categories", { params: { tenantId } })
    setCats(res.data)
  }

  useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const form = e.target as HTMLFormElement
    const data = new FormData(form)

    const base = {
      name: data.get("name") as string,
      slug: data.get("slug") as string,
      description: (data.get("description") as string) || null,
      displayOrder: Number(data.get("displayOrder")),
      isActive: data.get("isActive") === "on",
    }

    if (editing.id) {
      await api.put(`/api/categories/${editing.id}`, base)
    } else {
      await api.post("/api/categories", { ...base, tenantId: user?.tenantId })
    }

    // Save translations
    for (const locale of LOCALES) {
      const trName = data.get(`tr_name_${locale}`) as string
      const trDesc = data.get(`tr_description_${locale}`) as string
      if (trName && editing.id) {
        await api.put(`/api/translations/categories/${editing.id}/${locale}`, {
          name: trName,
          description: trDesc || null,
        })
      }
    }

    setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm(t("confirmDelete"))) return
    await api.delete(`/api/categories/${id}`)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("categories")}</h1>
        <button
          onClick={() => setEditing({ id: "", name: "", slug: "", description: "", displayOrder: 0, isActive: true, translations: [] })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {t("addCategory")}
        </button>
      </div>

      <div className="space-y-2">
        {cats.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{cat.name}</p>
              <p className="text-sm text-gray-500">/{cat.slug}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing({ ...cat })} className="text-sm text-blue-600 hover:underline">
                {t("edit")}
              </button>
              <button onClick={() => remove(cat.id)} className="text-sm text-red-600 hover:underline">
                {t("delete")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditing(null)}>
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-lg font-bold">{editing.id ? t("edit") : t("create")} {t("categories")}</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">{t("name")}</label>
                <input name="name" defaultValue={editing.name} className="w-full rounded-lg border px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("slug")}</label>
                <input name="slug" defaultValue={editing.slug} className="w-full rounded-lg border px-3 py-2 text-sm" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("description")}</label>
              <input name="description" defaultValue={editing.description ?? ""} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("displayOrder")}</label>
              <input name="displayOrder" type="number" defaultValue={editing.displayOrder} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input name="isActive" type="checkbox" defaultChecked={editing.isActive} />
              {t("isAvailable")}
            </label>

            {/* Locale tabs for translations */}
            <div>
              <div className="flex gap-1 mb-3 border-b">
                {LOCALES.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLocaleTab(l)}
                    className={`px-3 py-1.5 text-sm rounded-t ${localeTab === l ? "bg-gray-100 font-medium" : "text-gray-500"}`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              {LOCALES.map((l) => (
                <div key={l} className={localeTab === l ? "space-y-3" : "hidden"}>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t("name")} ({l})</label>
                    <input
                      name={`tr_name_${l}`}
                      defaultValue={editing.translations?.find((tr) => tr.locale === l)?.name ?? ""}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t("description")} ({l})</label>
                    <input
                      name={`tr_description_${l}`}
                      defaultValue={editing.translations?.find((tr) => tr.locale === l)?.description ?? ""}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">
                {t("cancel")}
              </button>
              <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                {t("save")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
