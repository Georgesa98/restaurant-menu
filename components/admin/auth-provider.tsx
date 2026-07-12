"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

type User = {
  id: string
  email: string
  name: string
  role: string
  tenantId: string | null
}

type AuthContext = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthCtx = createContext<AuthContext>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children, locale }: { children: ReactNode; locale: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    api.get("/api/auth/get-session", { withCredentials: true })
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user)
        } else {
          router.replace(`/${locale}/admin/login`)
        }
      })
      .catch(() => {
        router.replace(`/${locale}/admin/login`)
      })
      .finally(() => setLoading(false))
  }, [])

  async function signOut() {
    await api.post("/api/auth/sign-out", {}, { withCredentials: true })
    setUser(null)
    router.replace(`/${locale}/admin/login`)
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full" />
      </div>
    )
  }

  if (!user) return null

  return <AuthCtx.Provider value={{ user, loading, signOut }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
