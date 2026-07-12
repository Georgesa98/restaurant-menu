import { createMiddleware } from "hono/factory"
import { auth } from "../../lib/auth-server"
import type { Variables } from "../types"

export const requireAuth = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: "Unauthorized" }, 401)

  c.set("userId", session.user.id)
  c.set("userTenantId", (session.user.tenantId as string | null) ?? null)
  c.set("userRole", session.user.role as string)

  await next()
})
