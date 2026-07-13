"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export function RebuildButton() {
  const [loading, setLoading] = useState(false)

  const handleRebuild = async () => {
    setLoading(true)
    try {
      const res = await api.post("/api/builds/trigger")
      if (res.data.triggered) {
        alert("Build triggered! The site will update in ~30s.")
      }
    } catch {
      alert("Rebuild failed — is COOLIFY_BUILD_HOOK set on the server?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRebuild}
      disabled={loading}
      className="w-full justify-start gap-2.5 text-sidebar-foreground/40 hover:text-sidebar-foreground"
    >
      <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Rebuilding..." : "Rebuild Site"}
    </Button>
  )
}
