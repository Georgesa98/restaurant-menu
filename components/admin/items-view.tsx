"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useAuth } from "./auth-provider"
import { api } from "@/lib/api"

type Item = {
  id: string
  categoryId: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  isAvailable: boolean
  displayOrder: number
  dietaryTags: string[]
  category?: { name: string }
  translations: { locale: string; name: string; description: string | null }[]
}

type Category = { id: string; name: string }

const LOCALES = ["en", "ar"]

export function ItemsView() {
  const t = useTranslations("admin")
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<Partial<Item> | null>(null)
  const [localeTab, setLocaleTab] = useState("en")

  const tenantId = user?.role === "SUPER_ADMIN" ? "" : user?.tenantId

  async function load() {
    const [itemRes, catRes] = await Promise.all([
      api.get("/api/items", { params: { tenantId } }),
      api.get("/api/categories", { params: { tenantId } }),
    ])
    setItems(itemRes.data)
    setCategories(catRes.data)
  }

  useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const form = e.target as HTMLFormElement
    const data = new FormData(form)

    const base = {
      categoryId: data.get("categoryId") as string,
      name: data.get("name") as string,
      description: (data.get("description") as string) || null,
      price: parseFloat(data.get("price") as string),
      imageUrl: (data.get("imageUrl") as string) || null,
      isAvailable: data.get("isAvailable") === "on",
      displayOrder: Number(data.get("displayOrder")),
      dietaryTags: (data.get("dietaryTags") as string).split(",").map((s) => s.trim()).filter(Boolean),
    }

    let saved: Item
    if (editing.id) {
      const res = await api.put(`/api/items/${editing.id}`, base)
      saved = res.data
    } else {
      const res = await api.post("/api/items", { ...base, tenantId: user?.tenantId })
      saved = res.data
    }

    for (const locale of LOCALES) {
      const trName = data.get(`tr_name_${locale}`) as string
      const trDesc = data.get(`tr_description_${locale}`) as string
      if (trName && saved.id) {
        await api.put(`/api/translations/items/${saved.id}/${locale}`, {
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
    await api.delete(`/api/items/${id}`)
    load()
  }

  async function toggleAvailability(item: Item) {
    await api.patch(`/api/items/${item.id}/availability`, { isAvailable: !item.isAvailable })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("items")}</h1>
        <button
          onClick={() => setEditing({ categoryId: "", name: "", description: "", price: 0, isAvailable: true, displayOrder: 0, dietaryTags: [], imageUrl: null, translations: [], id: "" })}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          {t("addItem")}
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleAvailability(item)}
                className={`w-3 h-3 rounded-full ${item.isAvailable ? "bg-green-500" : "bg-red-400"}`}
                title={item.isAvailable ? t("isAvailable") : t("notAvailable")}
              />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.category?.name} — ${Number(item.price).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing({ ...item })} className="text-sm text-blue-600 hover:underline">{t("edit")}</button>
              <button onClick={() => remove(item.id)} className="text-sm text-red-600 hover:underline">{t("delete")}</button>
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
            <h2 className="text-lg font-bold">{editing.id ? t("edit") : t("create")} {t("items")}</h2>

            <div>
              <label className="block text-sm font-medium mb-1">{t("categories")}</label>
              <select name="categoryId" defaultValue={editing.categoryId} className="w-full rounded-lg border px-3 py-2 text-sm" required>
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("name")}</label>
              <input name="name" defaultValue={editing.name} className="w-full rounded-lg border px-3 py-2 text-sm" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("description")}</label>
              <input name="description" defaultValue={editing.description ?? ""} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">{t("price")}</label>
                <input name="price" type="number" step="0.01" defaultValue={editing.price} className="w-full rounded-lg border px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("displayOrder")}</label>
                <input name="displayOrder" type="number" defaultValue={editing.displayOrder} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("imageUrl")}</label>
              <input name="imageUrl" defaultValue={editing.imageUrl ?? ""} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">{t("dietaryTags")}</label>
              <input name="dietaryTags" defaultValue={(editing.dietaryTags ?? []).join(", ")} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="e.g. vegan, gluten-free" />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input name="isAvailable" type="checkbox" defaultChecked={editing.isAvailable} />
              {t("isAvailable")}
            </label>

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
                    <input name={`tr_name_${l}`} defaultValue={editing.translations?.find((tr) => tr.locale === l)?.name ?? ""} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t("description")} ({l})</label>
                    <input name={`tr_description_${l}`} defaultValue={editing.translations?.find((tr) => tr.locale === l)?.description ?? ""} className="w-full rounded-lg border px-3 py-2 text-sm" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">{t("cancel")}</button>
              <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">{t("save")}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
