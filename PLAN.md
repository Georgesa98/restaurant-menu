# Implementation Plan

## Phase 0: Foundation

### Step 0.1 — Init Next.js project
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
```

Configure `next.config.ts`:
```ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
}

export default nextConfig
```

### Step 0.2 — Install dependencies
```bash
npm install prisma @prisma/client @better-auth/prisma-adapter better-auth better-auth/plugins hono zod
npm install -D @types/node tsx
npx prisma init
```

### Step 0.3 — Write Prisma schema
Create `prisma/schema.prisma` with:
- **better-auth managed tables**: `User`, `Session`, `Account`, `Verification`, `TwoFactor`
  - On `User` model, add custom fields: `tenantId String?` and `role String @default("TENANT_ADMIN")`
- **App tables**: `Tenant`, `Category`, `MenuItem`

Generate the initial schema from better-auth, then merge in app tables:
```bash
npx @better-auth/cli generate --adapter prisma --output prisma/schema.prisma
# Then manually add Tenant, Category, MenuItem models to the generated file
```

Or write it all manually from the schema in `product.md`.

Run migration:
```bash
npx prisma migrate dev --name init
```

### Step 0.4 — Set up project structure
```
src/
  app/                    # Next.js App Router pages
    [slug]/menu/          # Public menu pages
    admin/                # Admin panel pages
    _super/               # Super admin pages
  components/
    menu/                 # Public menu components
    admin/                # Admin panel components
    ui/                   # Shared UI primitives
  lib/
    prisma.ts             # Prisma client singleton
    auth-server.ts        # better-auth server config (for API server)
    auth-client.ts        # better-auth client SDK (for admin UI in browser)
api-server/               # Hono server with better-auth (separate service)
prisma/
  schema.prisma
  seed.ts
```

### Step 0.5 — Seed script
Create `prisma/seed.ts` with demo data:
- 2 tenants (Italian restaurant, Sushi bar)
- 3-4 categories each
- 5-8 menu items each
- 1 tenant admin user per tenant (via better-auth API)
- 1 super admin user

---

## Phase 1: Public Menu (Static)

### Step 1.1 — `app/[slug]/menu/page.tsx`
- `generateStaticParams()` queries all active tenants
- Fetches tenant data + categories + items at build time
- Renders full menu page with tenant theme injected as CSS vars

### Step 1.2 — `app/layout.tsx`
- Root layout with metadata generation
- No `'use client'` — fully server component

### Step 1.3 — Menu components
- `MenuPage` — orchestrates layout
- `RestaurantHeader` — logo, name, description, contact
- `CategoryNav` — horizontal scrollable tabs
- `MenuItemCard` — name, description, price, dietary tags, image

### Step 1.4 — CSS theming
- `app/globals.css` uses `var(--primary)` etc.
- Each tenant page renders a `<style>` block in `<head>` with their colors

### Step 1.5 — Build + verify
```bash
npm run build
```
Check `out/` directory has static files per tenant.
Open in browser to verify.

---

## Phase 2: API Server

### Step 2.1 — Init API server
```bash
mkdir api-server && cd api-server
npm init -y
npm install hono @prisma/client better-auth @better-auth/prisma-adapter zod
npm install -D typescript @types/node tsx
```

Create `src/index.ts` with Hono + better-auth:

```ts
import { Hono } from "hono"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaClient } from "@prisma/client"
import { cors } from "hono/cors"

const prisma = new PrismaClient()

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      tenantId: { type: "string", required: false },
      role: { type: "string", required: true, defaultValue: "TENANT_ADMIN" },
    },
  },
})

const app = new Hono()
app.use("/api/*", cors({ origin: "*", credentials: true }))

// Mount better-auth handlers
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw))

// Protected CRUD routes (wrap with better-auth middleware)
// ...

export default app
```

### Step 2.2 — CRUD endpoints
Standard REST for: `categories`, `items`, `tenants`, `upload`
All protected by better-auth session middleware.

```ts
import { authMiddleware } from "./auth-middleware"

const api = new Hono()
api.use("*", authMiddleware(auth))

api.get("/categories", async (c) => { /* ... */ })
api.post("/categories", async (c) => { /* ... */ })
// ...
```

Input validated with Zod schemas.

### Step 2.3 — Upload endpoint
Accept multipart form data, upload to S3-compatible storage (DO Spaces / Backblaze B2), return URL.

### Step 2.4 — Build hook endpoint
```
POST /api/builds/trigger
```
Calls Coolify deployment webhook URL (stored as env var). Returns build ID.

---

## Phase 3: Admin Panel

### Step 3.1 — better-auth client setup
Create `src/lib/auth-client.ts`:
```ts
import { createAuthClient } from "better-auth/client"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL!, // "https://api.menuhost.com"
})
```

### Step 3.2 — Auth layer
- `app/admin/login/page.tsx` — email/password form using `authClient.signIn.email()`
- `AuthProvider` client component using `authClient.useSession()` to check auth state
- Route protection (redirect to login if no session)

### Step 3.3 — Dashboard
- `app/admin/dashboard/page.tsx`
- Fetch stats from API
- Quick action buttons

### Step 3.4 — Category management
- `app/admin/categories/page.tsx` — list with create/edit/delete
- Drag-and-drop reorder
- Toggle visibility

### Step 3.5 — Item management
- `app/admin/items/page.tsx` — table with search, filter by category
- `app/admin/items/new/page.tsx` — create form
- `app/admin/items/[id]/edit/page.tsx` — edit form
- Quick availability toggle

### Step 3.6 — Settings
- `app/admin/settings/page.tsx`
- Restaurant info + logo/cover upload
- Theme color pickers with live preview

---

## Phase 4: Super Admin Panel

### Step 4.1 — Tenant list
- `app/_super/tenants/page.tsx`
- Table: name, slug, domain, plan, status, created date
- Search + filter, quick actions

### Step 4.2 — Create/Edit tenant
- `app/_super/tenants/new/page.tsx`
- `app/_super/tenants/[id]/edit/page.tsx`
- Fields: name, slug, domain, plan, theme colors, restaurant info

### Step 4.3 — Tenant user management
- `app/_super/tenants/[id]/users/page.tsx`
- Invite users via email (create user via better-auth API)
- List/suspend/remove tenant admins

---

## Phase 5: Deployment (Coolify)

### Step 5.1 — Static site service
- Type: **Static Site**
- Build: `npm run build`
- Publish dir: `out/`
- Env vars: `DATABASE_URL` (for build-time Prisma queries)

### Step 5.2 — API server service
- Type: **Node.js**
- Start: `node dist/index.js` or `npx tsx src/index.ts`
- Port: 3001
- Env: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `COOLIFY_BUILD_HOOK`, `STORAGE_ENDPOINT`, `STORAGE_KEY`
- `BETTER_AUTH_URL` must point to the API server URL (e.g., `https://api.menuhost.com`)

### Step 5.3 — Traefik routing
- Custom domain mapping per tenant
- `api.menuhost.com` → API server (includes better-auth routes)

### Step 5.4 — PostgreSQL service
- Add PostgreSQL in Coolify
- Connection string → `DATABASE_URL` for both services

---

## Verification Checklist

- [ ] `npm run build` succeeds with zero errors
- [ ] `out/` contains `{slug}/menu/index.html` for each tenant
- [ ] Each tenant menu renders with correct theme colors
- [ ] API server starts and all endpoints respond
- [ ] Admin login works via better-auth (wrong creds rejected, correct creds get session)
- [ ] Admin can create/edit/delete categories
- [ ] Admin can create/edit/delete menu items
- [ ] Admin can update restaurant info + theme colors
- [ ] Super admin can create/edit/deactivate tenants
- [ ] Build hook triggers rebuild on data change
- [ ] Custom domain routing works (tenant.com → their menu)
- [ ] Mobile responsive — test at 375px width
- [ ] Lighthouse score ≥ 95 on public menu
- [ ] No client JS on public menu pages
