# Implementation Plan

## Phase 0: Foundation ✓ *(done)*
## Phase 1: Public Menu + Custom Domain Routing + Theme System ✓ *(done)*
## Phase 1.5: i18n ✓ *(done)*
## Phase 2: API Server (Hono + better-auth) ✓ *(done)*
## Phase 3: Admin Panel + shadcn/ui ✓ *(done)*
## Phase 4: Super Admin Panel ✓ *(done)*
## Phase 5: Image Optimization ⏳ *(pending)*
## Phase 6: Photo Card + Running Total Counter ⏳ *(pending)*
## Phase 7: Deployment (Coolify) ⏳ *(pending)*

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

Domain→slug map inlined at build time into the root `index.html`. The redirect is a client-side JS lookup on the hostname → `location.replace()`. *(This will be moved to Traefik-level redirects in Phase 7 — see 7.4.)*

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

## Phase 3 — Admin Panel (Client-rendered) ✓ *(done)*

### 3.1 — shadcn/ui components installed

Authenticated SPA at `/[locale]/admin/` with dark sidebar, warm ivory content area, 3 brand colors (chili, juniper, amber).

### 3.2 — Auth

Login page, `AuthProvider` wrapper, session check via `authClient.useSession()`, redirect to login if unauthenticated.

### 3.3 — Items view

Card grid with search + category filter pills + availability toggle + drag-and-drop reorder + inline EN/AR translations in dialog (no tabs).

### 3.4 — Categories view

Card grid with drag-and-drop reorder + inline EN/AR translations in dialog (no tabs).

### 3.5 — Layout

Two nav items by default (items, categories). "Tenants" nav item shown only for `SUPER_ADMIN` role.

---

## Phase 4: Super Admin Panel ✓ *(done)*

### 4.1 — Tenant list

Card grid with search, status dot, plan badge, categories/items count, domain.

### 4.2 — Create / Edit tenant

Dialog form with name, slug, domain, plan tier, default locale, description, address, phone, active toggle.

### 4.3 — User management

Per-tenant user dialog showing all admins for that tenant with role badges.

### 4.4 — Tenant CRUD API

`GET/POST/PUT/DELETE /api/tenants` gated by `SUPER_ADMIN` role check in middleware. `GET /api/tenants/:id/users` for user listing.

### 4.5 — API registration

Routes registered in `api-server/index.ts` under `/api/tenants`.

---

## Phase 5: Image Optimization ⏳ *(pending)*

### 5.1 — Install sharp

```bash
cd api-server && npm install sharp
```

### 5.2 — Rewrite POST /api/upload

Accept multipart upload, pipe through `sharp` before persisting:

- Resize to 3 variants: **thumbnail** (150×150 WebP, crop-center), **card** (600×400 WebP, cover), **full** (1200×800 max WebP, inside)
- Strip EXIF metadata
- Persist to `STORAGE_ENDPOINT` (S3-compatible bucket or local filesystem for dev)
- Return `{ thumbnail, card, full }` URLs

### 5.3 — Schema

Add an `ImageSet` model or store three URL columns directly on `MenuItem`:

```prisma
model MenuItem {
  // ...existing fields...
  imageThumbnail String?  // 150×150 WebP
  imageCard      String?  // 600×400 WebP
  imageFull      String?  // 1200×800 WebP
}
```

### 5.4 — Static build integration

At build time, fetch images and include them as static assets, or reference the CDN URLs directly in the static HTML (latter is simpler — images stay on the CDN, no need to bloat the static export).

### 5.5 — Migration

Generate migration for new image columns, run against production DB.

---

## Phase 6: Photo Card + Running Total Counter ⏳ *(pending)*

### 6.1 — Card grid layout

Update `app/[locale]/[slug]/menu/page.tsx` to render items in a responsive card grid (`grid-cols-1 sm:2 lg:3`) with:

- `aspect-[3/2]` photo box (uses `imageCard`)
- Item name (localized), description (localized), price
- Dietary tags (vegetarian, vegan, gluten-free — locale-independent)

### 6.2 — Running total counter

Small islands-style client component in the menu header:

- Maintains a local `Map<itemId, quantity>` in React state
- "+" / "–" buttons on each card
- Header shows total items count and running total price
- **No API calls** — purely client-side state
- `"use client"` boundary kept small so the rest of the page stays zero-JS

### 6.3 — Price formatting

Locale-aware: `en` → `$12.50`, `ar` → `١٢٫٥٠ $` (or appropriate Arabic numeral format). Use `Intl.NumberFormat` from the client component.

---

## Phase 7: Deployment (Coolify) ⏳ *(pending)*

### 7.1 — Static Site Service
- Type: **Static Site**, build: `npm run build`, publish: `out/`
- Env: `DATABASE_URL`
- Custom domains: Add each tenant's domain in Coolify UI

### 7.2 — API Server Service
- Type: **Node.js**, port: 3001
- Env: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `COOLIFY_BUILD_HOOK`, `STORAGE_ENDPOINT`, `STORAGE_KEY`

### 7.3 — PostgreSQL
- Add PostgreSQL in Coolify, connection string → `DATABASE_URL`

### 7.4 — Traefik routing (redirect at proxy level)

Replace the client-side JS redirect in `index.html` with Traefik middleware rules. Each custom domain gets a static redirect before the browser ever downloads a page:

```yaml
# docker-compose.yml (Coolify)
labels:
  - "traefik.http.routers.static.rule=Host(`luigispizzeria.com`)"
  - "traefik.http.middlewares.trattoria-redirect.redirectregex.regex=^/"
  - "traefik.http.middlewares.trattoria-redirect.redirectregex.replacement=/en/trattoria-roma/menu/"
  - "traefik.http.routers.static.middlewares=trattoria-redirect"

  - "traefik.http.routers.static2.rule=Host(`sakurasushi.com`)"
  - "traefik.http.middlewares.sakura-redirect.redirectregex.regex=^/"
  - "traefik.http.middlewares.sakura-redirect.redirectregex.replacement=/en/sakura-sushi/menu/"
  - "traefik.http.routers.static2.middlewares=sakura-redirect"
```

Browser language detection: Can be extended per domain (e.g. `sakurasushi.com` redirects to `/ja/sakura-sushi/menu/` if needed via a small edge middleware or by using Coolify's own redirect rules). For the MVP, English is the default; the language switcher on the menu page covers toggling to Arabic.

The root `index.html` becomes a true 0-JS page (just a `<meta http-equiv="refresh">` fallback or a static landing page).

### 7.5 — Build hooks
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
- [ ] Domain redirect is handled at Traefik level (no client-side JS redirect)
- [ ] Public menu has 0 KB client JavaScript (excluding language switcher and counter components)
- [ ] API CRUD includes translation upsert endpoints
- [ ] Image upload resizes + converts to WebP via sharp (3 sizes)
- [ ] Menu items render in a photo card grid with consistent aspect ratios
- [ ] Running total counter works client-side with no API calls
- [ ] Admin login/auth works
- [ ] Super admin can manage tenants + locale settings
- [ ] Mobile responsive, Lighthouse ≥ 95
