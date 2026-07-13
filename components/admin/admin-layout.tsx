"use client"

import { useTranslations } from "next-intl"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { ExportButton } from "./export-button"
import { RebuildButton } from "./rebuild-button"
import {
  ListTree,
  UtensilsCrossed,
  Building2,
  Upload,
  LogOut,
} from "lucide-react"
import type { ReactNode } from "react"

const views = ["items", "categories"] as const
export type AdminView = (typeof views)[number]

export type ExtendedView = AdminView | "tenants" | "import"

const viewIcons: Record<string, ReactNode> = {
  items: <UtensilsCrossed className="size-4" />,
  categories: <ListTree className="size-4" />,
  tenants: <Building2 className="size-4" />,
  import: <Upload className="size-4" />,
}

export function AdminLayout({
  view,
  onNavigate,
  children,
}: {
  view: string
  onNavigate: (v: ExtendedView) => void
  children: ReactNode
}) {
  const t = useTranslations("admin")
  const { user, signOut } = useAuth()
  const isSuper = user?.role === "SUPER_ADMIN"

  return (
    <div className="min-h-dvh flex">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        <div className="h-1 shrink-0 bg-amber" />
        <div className="px-4 pt-4 pb-3">
          <h2 className="font-bold text-sm tracking-wide">MenuHost</h2>
          <p className="text-xs text-sidebar-foreground/50 mt-0.5 truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {views.map((v) => {
            const Icon = viewIcons[v]
            return (
              <Button
                key={v}
                variant={view === v ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onNavigate(v)}
                className="w-full justify-start gap-2.5 data-[slot=button]:text-sidebar-foreground/70"
              >
                {Icon}
                {t(v)}
              </Button>
            )
          })}
          {isSuper && (
            <Button
              variant={view === "tenants" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onNavigate("tenants")}
              className="w-full justify-start gap-2.5 data-[slot=button]:text-sidebar-foreground/70"
            >
              <Building2 className="size-4" />
              Tenants
            </Button>
          )}
        </nav>
        <div className="p-2 border-t border-sidebar-border space-y-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("import")}
            className={`w-full justify-start gap-2.5 ${view === "import" ? "text-sidebar-foreground bg-sidebar-accent" : "text-sidebar-foreground/40 hover:text-sidebar-foreground"}`}
          >
            <Upload className="size-4" />
            Import
          </Button>
          <ExportButton />
          <RebuildButton />
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start gap-2.5 text-sidebar-foreground/40 hover:text-sidebar-foreground"
          >
            <LogOut className="size-4" />
            {t("logout")}
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
    </div>
  )
}
