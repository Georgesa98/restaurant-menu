import { Hono } from "hono"
import { prisma } from "../../lib/prisma"
import { requireAuth } from "../middleware/auth"
import type { Variables } from "../types"

export const categories = new Hono<{ Variables: Variables }>()

categories.use("*", requireAuth)

categories.get("/", async (c) => {
  const tenantId = c.req.query("tenantId")
  const userTenantId = c.get("userTenantId")
  const role = c.get("userRole")

  const effectiveTenantId = role === "SUPER_ADMIN" ? tenantId : userTenantId
  if (!effectiveTenantId) return c.json({ error: "tenantId required" }, 400)

  const cats = await prisma.category.findMany({
    where: { tenantId: effectiveTenantId },
    orderBy: { displayOrder: "asc" },
    include: { translations: true },
  })

  return c.json(cats)
})

categories.get("/:id", async (c) => {
  const id = c.req.param("id")
  const cat = await prisma.category.findUnique({
    where: { id },
    include: { translations: true },
  })
  if (!cat) return c.json({ error: "Not found" }, 404)
  return c.json(cat)
})

categories.post("/", async (c) => {
  const body = await c.req.json()
  const userTenantId = c.get("userTenantId")
  const role = c.get("userRole")

  const tenantId = role === "SUPER_ADMIN" ? body.tenantId : userTenantId
  if (!tenantId) return c.json({ error: "tenantId required" }, 400)

  const cat = await prisma.category.create({
    data: {
      tenantId,
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      displayOrder: body.displayOrder ?? 0,
    },
  })

  return c.json(cat, 201)
})

categories.put("/:id", async (c) => {
  const id = c.req.param("id")
  const body = await c.req.json()

  const cat = await prisma.category.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      displayOrder: body.displayOrder,
      isActive: body.isActive,
    },
  })

  return c.json(cat)
})

categories.delete("/:id", async (c) => {
  const id = c.req.param("id")
  await prisma.category.delete({ where: { id } })
  return c.json({ success: true })
})
