"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useAuth } from "./auth-provider"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Users } from "lucide-react"

type Tenant = {
  id: string
  name: string
  slug: string
  domain: string | null
  plan: string
  isActive: boolean
  defaultLocale: string
  availableLocales: string[]
  _count: { categories: number; items: number }
  description: string | null
  address: string | null
  phone: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  createdAt: string
}

type User = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

function TenantUsers({ tenantId }: { tenantId: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      api.get(`/api/tenants/${tenantId}/users`).then((res) => setUsers(res.data))
    }
  }, [open, tenantId])

  return (
    <>
      <Button variant="ghost" size="xs" onClick={() => setOpen(true)} title="View users">
        <Users className="size-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Users</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {users.length === 0 && <p className="text-sm text-muted-foreground">No users</p>}
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {u.role === "SUPER_ADMIN" ? "Super" : "Admin"}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function TenantsView() {
  const t = useTranslations("admin")
  const { user } = useAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [editing, setEditing] = useState<Partial<Tenant> | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  async function load() {
    const res = await api.get("/api/tenants", { params: { search } })
    setTenants(res.data)
  }

  useEffect(() => { load() }, [search])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const form = e.target as HTMLFormElement
    const data = new FormData(form)

    const base = {
      name: data.get("name") as string,
      slug: data.get("slug") as string,
      domain: (data.get("domain") as string) || null,
      plan: data.get("plan") as string,
      isActive: data.get("isActive") === "on",
      defaultLocale: data.get("defaultLocale") as string,
      description: (data.get("description") as string) || null,
      address: (data.get("address") as string) || null,
      phone: (data.get("phone") as string) || null,
    }

    if (editing.id) {
      await api.put(`/api/tenants/${editing.id}`, base)
    } else {
      await api.post("/api/tenants", base)
    }

    setOpen(false)
    setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm(t("confirmDelete"))) return
    await api.delete(`/api/tenants/${id}`)
    load()
  }

  function openEdit(tenant?: Tenant) {
    setEditing(
      tenant ?? {
        id: "",
        name: "",
        slug: "",
        domain: "",
        plan: "FREE",
        isActive: true,
        defaultLocale: "en",
        availableLocales: ["en"],
        description: "",
        address: "",
        phone: "",
        _count: { categories: 0, items: 0 },
        primaryColor: "#e74c3c",
        secondaryColor: "#2c3e50",
        accentColor: "#f39c12",
        createdAt: "",
      },
    )
    setOpen(true)
  }

  const planBadge = (plan: string) => {
    const colors: Record<string, string> = {
      FREE: "bg-muted text-muted-foreground",
      STARTER: "bg-primary/10 text-primary",
      PRO: "bg-amber/10 text-amber",
    }
    return colors[plan] ?? colors.FREE
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Tenants</h1>
          <p className="text-sm text-muted-foreground mt-1">{tenants.length} total</p>
        </div>
        <Button onClick={() => openEdit()}>
          <Plus className="size-4" />
          Add tenant
        </Button>
      </div>

      <Input
        placeholder="Search tenants…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-64 mb-4"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tenants.map((tenant) => (
          <div
            key={tenant.id}
            className="relative bg-card rounded-xl ring-1 ring-foreground/5 py-4 px-4 hover:ring-foreground/10 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full shrink-0 ${tenant.isActive ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                <span className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded ${planBadge(tenant.plan)}`}>
                  {tenant.plan}
                </span>
              </div>
              {tenant.domain && (
                <span className="text-[10px] text-muted-foreground truncate max-w-24">{tenant.domain}</span>
              )}
            </div>
            <p className="text-sm font-medium mb-0.5">{tenant.name}</p>
            <p className="text-xs text-muted-foreground mb-2">/{tenant.slug}</p>
            {tenant.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{tenant.description}</p>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span>{tenant._count.categories} categories</span>
              <span>{tenant._count.items} items</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="xs" onClick={() => openEdit(tenant)}>
                <Pencil className="size-3.5" />
              </Button>
              <TenantUsers tenantId={tenant.id} />
              <Button variant="ghost" size="xs" onClick={() => remove(tenant.id)}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={save}>
            <DialogHeader>
              <DialogTitle>
                {editing?.id ? "Edit" : "Create"} tenant
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input name="name" defaultValue={editing?.name} required />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input name="slug" defaultValue={editing?.slug} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Domain</Label>
                <Input name="domain" defaultValue={editing?.domain ?? ""} placeholder="e.g. luigispizzeria.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <select
                    name="plan"
                    defaultValue={editing?.plan ?? "FREE"}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  >
                    <option value="FREE">Free</option>
                    <option value="STARTER">Starter</option>
                    <option value="PRO">Pro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Default locale</Label>
                  <select
                    name="defaultLocale"
                    defaultValue={editing?.defaultLocale ?? "en"}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input name="isActive" type="checkbox" defaultChecked={editing?.isActive} />
                Active
              </label>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input name="description" defaultValue={editing?.description ?? ""} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input name="address" defaultValue={editing?.address ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input name="phone" defaultValue={editing?.phone ?? ""} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t("save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
