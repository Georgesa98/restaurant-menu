# Implementation Plan

## Phase 0: Foundation ✓ *(done)*
## Phase 1: Public Menu + Custom Domain Routing + Theme System ✓ *(done)*
## Phase 1.5: i18n ✓ *(done)*
## Phase 2: API Server (Hono + better-auth) ✓ *(done)*
## Phase 3: Admin Panel + shadcn/ui ⏳ *(in progress)*
## Phase 4: Super Admin Panel ⏳ *(pending)*
## Phase 5: Deployment ⏳ *(pending)*

- Next.js 16 + TypeScript + Tailwind v4 + Prisma 7 + PostgreSQL
- better-auth for auth (email/password, session management)
- `output: "export"` — fully static build
- Prisma schema: `User`, `Session`, `Account`, `Verification`, `TwoFactor` (managed by better-auth) + `Tenant`, `Category`, `MenuItem`
- Migration + seed with 2 demo tenants (Trattoria Roma, Sakura Sushi Bar), 6 categories, 16 items
- `lib/prisma.ts` — PrismaClient with PostgreSQL driver adapter
- `lib/auth-server.ts` — better-auth server config
- `lib/auth-client.ts` — better-auth client SDK for browser

### i18n additions to schema

Add `CategoryTranslation` and `MenuItemTranslation` tables + locale fields on Tenant:

```prisma
model Tenant {
  // ...existing fields...
  defaultLocale    String   @default("en")
  availableLocales String[]
}

model CategoryTranslation {
  id          String   @id @default(uuid()) @db.Uuid
  categoryId  String   @db.Uuid
  locale      String
  name        String
  description String?

  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@unique([categoryId, locale])
  @@map("category_translations")
}

model MenuItemTranslation {
  id          String   @id @default(uuid()) @db.Uuid
  menuItemId  String   @db.Uuid
  locale      String
  name        String
  description String?

  menuItem MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Cascade)
  @@unique([menuItemId, locale])
  @@map("menu_item_translations")
}
```

The `name`/`description` on `Category`/`MenuItem` serve as the fallback (English). Translations override per locale.

---

## Phase 1 — Public Menu + Custom Domain Routing + Theme System

### 1.1 — Domain-based routing for custom domains

Inline a domain→slug map in the root `index.html` at build time:

```html
<script>
  (function(){
    var map = {"luigispizzeria.com":"trattoria-roma","sakurasushi.com":"sakura-sushi"}
    var slug = map[location.hostname]
    if (slug && !location.pathname.startsWith("/"+slug)) location.replace("/"+slug+"/menu/")
  })()
</script>
```

### 1.2 — Expanded theme system

17 design tokens stored on the Tenant model, injected as `<style>:root{...}</style>` at build time.

| Field | CSS Variable |
|---|---|
| `primaryColor` | `--primary` |
| `secondaryColor` | `--secondary` |
| `accentColor` | `--accent` |
| `backgroundColor` | `--bg` |
| `surfaceColor` | `--surface` |
| `textColor` | `--text` |
| `textMuted` | `--text-muted` |
| `headingFont` | `--font-heading` |
| `bodyFont` | `--font-body` |
| `borderRadiusSm` | `--radius-sm` |
| `borderRadiusMd` | `--radius-md` |
| `borderRadiusLg` | `--radius-lg` |
| `shadow` | `--shadow` |
| `cardStyle` | `.menu-card { ... }` |
| `menuLayout` | `--menu-grid` |
| `spacing` | `--space` |
| `customCss` | *(raw injection)* |

### 1.3 — Category deep links

`app/[slug]/menu/[categorySlug]/page.tsx` — statically generated per tenant per category.

### 1.4 — Build output

```
out/
  index.html
  trattoria-roma/menu/index.html
  trattoria-roma/menu/antipasti/
  trattoria-roma/menu/pasta/
  trattoria-roma/menu/dolci/
  sakura-sushi/menu/index.html
  sakura-sushi/menu/sushi/
  sakura-sushi/menu/desserts/
```

### 1.5 — Verified

Build passes, themes correct, zero client JS on public pages, domain redirect works.

---

## Phase 1.5 — i18n (Internationalization)

### Overview

Add Arabic alongside English. Route structure: `/{locale}/[slug]/menu/`. Content stored via translation tables. Uses **next-intl** for UI messages (labels, buttons) with prefix-based routing (no middleware, since static export).

### 1.5.1 — Install next-intl

```bash
npm install next-intl
```

### 1.5.2 — next-intl config files

**`i18n/routing.ts`** — locale definitions, prefix-based routing:
```ts
export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
})
```

**`i18n/request.ts`** — load UI messages per locale:
```ts
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
```

**`messages/en.json`** and **`messages/ar.json`** — UI strings (e.g. "nav.home" → "Menu" / "القائمة", "price" → "Price" / "السعر").

### 1.5.3 — Restructure routes

Move all pages from `/[slug]/menu/` to `/[locale]/[slug]/menu/`:

```
app/
  [locale]/
    layout.tsx             ← NextIntlClientProvider, setRequestLocale, dir="rtl" for ar
    [slug]/
      menu/
        page.tsx           ← generateStaticParams produces all locale×tenant combos
        [categorySlug]/
          page.tsx         ← generateStaticParams produces all locale×tenant×category combos
```

The root `app/page.tsx` still handles domain redirect, but now also detects browser language and includes the locale in the redirect path:

```html
<script>
  (function(){
    var map = {"luigispizzeria.com":"trattoria-roma","sakurasushi.com":"sakura-sushi"}
    var slug = map[location.hostname]
    if (slug) {
      var lang = navigator.language.startsWith("ar") ? "ar" : "en"
      if (!location.pathname.startsWith("/"+lang+"/"+slug))
        location.replace("/"+lang+"/"+slug+"/menu/")
    }
  })()
</script>
```

### 1.5.4 — Data fetching with translations

At build time, include translations for the requested locale:

```ts
const data = await prisma.tenant.findUnique({
  where: { slug },
  include: {
    categories: {
      include: {
        items: true,
        translations: { where: { locale } },
        items: { include: { translations: { where: { locale } } } },
      },
    },
  },
})
```

In the component, merge: `name = translation?.name ?? fallback.name`.

### 1.5.5 — Language switcher

A small client component in the menu header. Toggles between `/en/...` and `/ar/...` by replacing the first path segment. Shows a flag or language code button.

### 1.5.6 — RTL support

When locale is `ar`, set `<html dir="rtl">`. Tailwind has built-in RTL support (`rtl:` prefix). Adjust card layouts, margins, and icon positions for right-to-left reading.

### 1.5.7 — Seed Arabic translations

Add Arabic translations for all 6 categories and 16 menu items across both demo tenants. For example:

```
Category "Antipasti" → "مقبلات"
Item "Bruschetta al Pomodoro" → "بروشيتا بالطماطم والريحان"
```

### 1.5.8 — Build output (doubled)

```
out/
  index.html
  en/trattoria-roma/menu/index.html
  en/trattoria-roma/menu/antipasti/
  ar/trattoria-roma/menu/index.html       ← RTL, Arabic content
  ar/trattoria-roma/menu/antipasti/       ← RTL, Arabic content
  en/sakura-sushi/menu/index.html
  ar/sakura-sushi/menu/index.html
  ar/sakura-sushi/menu/sushi/
  ...
```

---

## Phase 2 — API Server (Hono + better-auth)

### 2.1 — Create `api-server/`

Separate directory, Hono app with better-auth.

```ts
import { Hono } from "hono"
import { cors } from "hono/cors"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaClient } from "@prisma/client"

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
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw))
```

### 2.2 — Auth endpoints

```
POST /api/auth/sign-up/email   → register
POST /api/auth/sign-in/email   → login
GET  /api/auth/session         → current session
POST /api/auth/sign-out        → destroy session
```

### 2.3 — CRUD routes

```
GET    /api/categories?tenantId=
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id

GET    /api/items?tenantId=&categoryId=
POST   /api/items
PUT    /api/items/:id
DELETE /api/items/:id
PATCH  /api/items/:id/availability

POST   /api/upload

# i18n — manage translations
PUT    /api/categories/:id/translations/:locale
PUT    /api/items/:id/translations/:locale
```

Translation endpoints accept `{ name, description }` and upsert into the translation table.

### 2.4 — Build hook

```
POST /api/builds/trigger → calls Coolify webhook, returns { buildId }
```

### 2.5 — Seed admin users

Create 1 super admin + 1 tenant admin per demo tenant via better-auth API.

---

## Phase 3 — Admin Panel (Client-rendered) ⏳ *(in progress)*

### 3.1 — UI overhaul: shadcn/ui

Replace raw Tailwind inputs/buttons/modals with shadcn/ui components for a polished admin experience.

```bash
pnpm dlx shadcn@latest init     # configure base styles
pnpm dlx shadcn@latest add button card input label select dialog tabs
```

Components will be ported to use shadcn primitives:
- Login form → `Card` + `Input` + `Button`
- Sidebar → `Button` variants
- Category/item modals → `Dialog` + `Tabs` (locale switching)
- Settings → `Card` + `Input`

### 3.2 — better-auth client

```ts
import { createAuthClient } from "better-auth/client"
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
})
```

### 3.2 — Login

`/admin/login` → email/password via `authClient.signIn.email()`.

### 3.3 — Auth provider

`AuthProvider` wraps admin routes, checks `authClient.useSession()`, redirects to login if unauthenticated.

### 3.4 — Dashboard

`/admin/dashboard` → stats, quick actions, last build status.

### 3.5 — Category management

`/admin/categories` → list with search, create, edit, delete. Drag-and-drop reorder. When editing, show tabs for each locale (`en` / `ar`) with separate name/description inputs.

### 3.6 — Item management

- `/admin/items` — table with search/filter, availability toggle.
- `/admin/items/new` — create form with locale tabs for name/description.
- `/admin/items/[id]/edit` — edit form with locale tabs.
- Dietary tags and image are locale-independent (shared).

### 3.7 — Settings + Theme editor

`/admin/settings` → restaurant info + theme picker for all 17 design tokens + "Advanced CSS" textarea. Locale selector for default language and available languages (checkboxes for `en`, `ar`).

---

## Phase 4: Super Admin Panel

### 4.1 — Tenant list

`/_super/tenants` → table with search, status, domain, available locales.

### 4.2 — Create / Edit tenant

`/_super/tenants/new` and `/_super/tenants/[id]/edit` — full form with theme presets, locale settings.

### 4.3 — User management

`/_super/tenants/[id]/users` → invite, suspend, remove tenant admins.

### 4.4 — Build history

`/_super/tenants/[id]/builds` → rebuild statuses.

### 4.5 — Domain verification

`/_super/tenants/[id]/domains` → add domain, check DNS.

---

## Phase 5: Deployment (Coolify)

### 5.1 — Static Site Service
- Type: **Static Site**, build: `npm run build`, publish: `out/`
- Env: `DATABASE_URL`
- Custom domains: Add each tenant's domain in Coolify UI

### 5.2 — API Server Service
- Type: **Node.js**, port: 3001
- Env: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `COOLIFY_BUILD_HOOK`, `STORAGE_ENDPOINT`, `STORAGE_KEY`

### 5.3 — PostgreSQL
- Add PostgreSQL in Coolify, connection string → `DATABASE_URL`

### 5.4 — Traefik routing

```
luigispizzeria.com ──► Static Site
  → domain redirect → /en/trattoria-roma/menu/ (or /ar/ based on browser language)
sakurasushi.com    ──► Static Site
api.menuhost.com   ──► API Server
```

### 5.5 — Build hooks
- Coolify webhook called by API on data change → site rebuilds (~30s)

---

## Verification Checklist

- [ ] `npm run build` succeeds
- [ ] `out/` contains `/{locale}/{slug}/menu/` for all locale×tenant combinations
- [ ] Each tenant page renders with correct design tokens per locale
- [ ] English pages have LTR layout, Arabic pages have RTL layout
- [ ] Category/item names show correct translation per locale
- [ ] Fallback works: if translation missing, shows English name
- [ ] Language switcher toggles between `/en/...` and `/ar/...`
- [ ] Domain redirect includes locale detection (`navigator.language`)
- [ ] Public menu has 0 KB client JavaScript (excluding language switcher component)
- [ ] API CRUD includes translation upsert endpoints
- [ ] Admin forms have locale tabs for multilingual content
- [ ] Admin login/auth works
- [ ] Super admin can manage tenants + locale settings
- [ ] Mobile responsive, Lighthouse ≥ 95
