import "dotenv/config"
import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { auth } from "../lib/auth-server"
import { categories } from "./routes/categories"
import { items } from "./routes/items"
import { translations } from "./routes/translations"

const app = new Hono()

app.use("/api/*", cors({
  origin: (origin) => origin,
  credentials: true,
}))
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))

app.route("/api/categories", categories)
app.route("/api/items", items)
app.route("/api/translations", translations)

app.post("/api/upload", (c) => c.json({ error: "Not implemented" }, 501))

app.notFound((c) => c.json({ error: "Not found", path: c.req.path }, 404))

app.onError((err, c) => {
  console.error(err)
  return c.json({ error: "Internal server error" }, 500)
})

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001

serve({ fetch: app.fetch, port }, () => {
  console.log(`API server running on http://localhost:${port}`)
})
