"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useAuth } from "./auth-provider"

export function ExportButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleExport = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (user?.role === "SUPER_ADMIN") {
        const tid = prompt("Tenant ID (leave empty for your own):")
        if (tid) params.tenantId = tid
      }

      const res = await api.get("/api/export", {
        params,
        responseType: "blob",
        headers: { Accept: "application/json" },
      })

      const blob = new Blob([res.data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "menu-export.json"
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error("Export failed", e)
      alert("Export failed — check console")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleExport}
      disabled={loading}
      className={`w-full justify-start gap-2.5 text-sidebar-foreground/40 hover:text-sidebar-foreground ${className ?? ""}`}
    >
      <Download className="size-4" />
      {loading ? "Exporting..." : "Export"}
    </Button>
  )
}
