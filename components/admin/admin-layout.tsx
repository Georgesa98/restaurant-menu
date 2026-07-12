"use client"

import { useTranslations } from "next-intl"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import {
  ListTree,
  UtensilsCrossed,
  LogOut,
} from "lucide-react"
import type { ReactNode } from "react"

const views = ["items", "categories"] as const
export type AdminView = (typeof views)[number]

const viewIcons: Record<AdminView, ReactNode> = {
  items: <UtensilsCrossed className="size-4" />,
  categories: <ListTree className="size-4" />,
}

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
      <aside className="w-56 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
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
        </nav>
        <div className="p-2 border-t border-sidebar-border">
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
