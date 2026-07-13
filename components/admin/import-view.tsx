"use client"

import { useState, useRef } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-provider"
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react"

type ImportResult = {
  imported: { categories: number; items: number; translations: number }
  errors?: string[]
} | null

export function ImportView() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const handleFile = (f: File | undefined) => {
    if (!f) return
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = () => setPreview((reader.result as string).slice(0, 300))
    reader.readAsText(f)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setResult(null)
    try {
      const text = await file.text()
      const json = JSON.parse(text)

      const params: Record<string, string> = {}
      if (user?.role === "SUPER_ADMIN") {
        const tid = prompt("Tenant ID:")
        if (tid) params.tenantId = tid
      }

      const res = await api.post("/api/import", json, { params })
      setResult(res.data)
    } catch (e) {
      console.error("Import failed", e)
      alert("Import failed — check console")
    } finally {
      setImporting(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview("")
    setResult(null)
  }

  return (
    <div className="space-y-4">
      {!result && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {file ? file.name : "Drop a JSON file or click to browse"}
          </p>
          {preview && (
            <pre className="mt-3 text-xs text-left bg-muted p-3 rounded max-h-32 overflow-auto">
              {preview}...
            </pre>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {file && (
            <div className="flex gap-2 justify-center mt-4">
              <Button size="sm" onClick={handleImport} disabled={importing}>
                {importing ? "Importing..." : "Import"}
              </Button>
              <Button size="sm" variant="ghost" onClick={reset}>Cancel</Button>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="size-5" />
            <span className="font-medium">Import complete</span>
          </div>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>Categories: {result.imported.categories}</p>
            <p>Items: {result.imported.items}</p>
            <p>Translations: {result.imported.translations}</p>
          </div>
          {result.errors && result.errors.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="size-4" />
                <span className="text-sm font-medium">Errors</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-0.5 ml-6 list-disc">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          <Button size="sm" variant="outline" onClick={reset}>
            Import another file
          </Button>
        </div>
      )}
    </div>
  )
}
