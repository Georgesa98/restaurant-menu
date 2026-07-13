# Implementation Plan

## Phase 0: Foundation ✓ _(done)_

## Phase 1: Public Menu + Custom Domain Routing + Theme System ✓ _(done)_

## Phase 1.5: i18n ✓ _(done)_

## Phase 2: API Server (Hono + better-auth) ✓ _(done)_

## Phase 3: Admin Panel + shadcn/ui ✓ _(done)_

## Phase 4: Super Admin Panel ✓ _(done)_

## Phase 5: Image Optimization ✓ _(done)_

## Phase 5.5: Import / Export ✓ _(done)_

## Phase 6: Photo Card + Running Total Counter ✓ _(done)_

## Phase 7: Deployment (Coolify) ⏳ _(pending)_

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

Domain→slug map inlined at build time into the root `index.html`. The redirect is a client-side JS lookup on the hostname → `location.replace()`. _(This will be moved to Traefik-level redirects in Phase 7 — see 7.4.)_

```html
<script>
  (function () {
    var map = { 'luigispizzeria.com': 'trattoria-roma', 'sakurasushi.com': 'sakura-sushi' };
    var slug = map[location.hostname];
    if (slug && !location.pathname.startsWith('/' + slug)) location.replace('/' + slug + '/menu/');
  })();
</script>
```

### 1.2 — Expanded theme system

17 design tokens stored on the Tenant model, injected as `<style>:root{...}</style>` at build time.

| Field             | CSS Variable         |
| ----------------- | -------------------- |
| `primaryColor`    | `--primary`          |
| `secondaryColor`  | `--secondary`        |
| `accentColor`     | `--accent`           |
| `backgroundColor` | `--bg`               |
| `surfaceColor`    | `--surface`          |
| `textColor`       | `--text`             |
| `textMuted`       | `--text-muted`       |
| `headingFont`     | `--font-heading`     |
| `bodyFont`        | `--font-body`        |
| `borderRadiusSm`  | `--radius-sm`        |
| `borderRadiusMd`  | `--radius-md`        |
| `borderRadiusLg`  | `--radius-lg`        |
| `shadow`          | `--shadow`           |
| `cardStyle`       | `.menu-card { ... }` |
| `menuLayout`      | `--menu-grid`        |
| `spacing`         | `--space`            |
| `customCss`       | _(raw injection)_    |

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
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
```

**`i18n/request.ts`** — load UI messages per locale:

```ts
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
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
  (function () {
    var map = { 'luigispizzeria.com': 'trattoria-roma', 'sakurasushi.com': 'sakura-sushi' };
    var slug = map[location.hostname];
    if (slug) {
      var lang = navigator.language.startsWith('ar') ? 'ar' : 'en';
      if (!location.pathname.startsWith('/' + lang + '/' + slug)) location.replace('/' + lang + '/' + slug + '/menu/');
    }
  })();
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
});
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
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      tenantId: { type: 'string', required: false },
      role: { type: 'string', required: true, defaultValue: 'TENANT_ADMIN' },
    },
  },
});

const app = new Hono();
app.use('/api/*', cors({ origin: '*', credentials: true }));
app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw));
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

## Phase 3 — Admin Panel (Client-rendered) ✓ _(done)_

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

## Phase 4: Super Admin Panel ✓ _(done)_

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

## Phase 5: Image Optimization ✓ _(done)_

- sharp installed in `api-server/`
- `POST /api/upload` resizes to 3 WebP variants (150×150 thumbnail, 600×400 card, 1200×800 full) via sharp, persists to local `uploads/` in dev
- Schema: `imageThumbnail`/`imageCard`/`imageFull` columns on `MenuItem`
- Migration `20260713224750_add_image_fields` applied
- Upload button + preview in admin items dialog

## Phase 5.5: Import / Export ✓ _(done)_

- `POST /api/import` — upserts categories (with Arabic→English name map) and items (matched by `tenantId + categoryId + name`), creates Arabic+English translations
- `GET /api/export` — dumps all categories + items + translations as JSON
- `ImportView` component — drag-and-drop file upload, confirm, result display with counts/errors
- `ExportButton` component — one-click JSON download from sidebar
- Both registered in `api-server/index.ts` and admin sidebar navigation

## Phase 6: Photo Card + Running Total Counter ✓ _(done)_

- `components/menu/order-menu.tsx` — responsive card grid (`grid-cols-1 sm:2 lg:3`, `aspect-[3/2]` photo), +/- buttons, sticky order bar with total
- `components/menu/language-switcher.tsx` extracted to separate file
- Purely client-side state (no API calls), `Intl.NumberFormat` for locale-aware pricing

## Phase 7: Deployment (Coolify) ⏳ _(pending)_

### Overview

Three services in Coolify:

| Service                   | Type        | Port | Build Command                                         | Start Command                    | Publish Dir |
| ------------------------- | ----------- | ---- | ----------------------------------------------------- | -------------------------------- | ----------- |
| **Static Site** (Next.js) | Static Site | —    | `npm run build`                                       | —                                | `out/`      |
| **API Server** (Hono)     | Node.js     | 3001 | `cd api-server && npm install && npx prisma generate` | `cd api-server && npm run start` | —           |
| **PostgreSQL**            | Database    | 5432 | —                                                     | —                                | —           |

### 7.1 — PostgreSQL (Coolify native database)

1. In Coolify, **Resources → Databases → PostgreSQL**.
2. Name it `restaurant-menu-db`.
3. Copy the internal connection string — it'll look like:
   ```
   postgresql://postgres:randompw@restaurant-menu-db:5432/restaurant-menu-db?schema=public
   ```
   This is the value for `DATABASE_URL` in both other services.

### 7.2 — Static Site (Next.js) — Coolify "Static Site"

**Settings:**

| Setting           | Value           |
| ----------------- | --------------- |
| Build pack        | `Static Site`   |
| Build command     | `npm run build` |
| Publish directory | `out/`          |
| Install command   | `npm install`   |
| Base directory    | `/`             |

**Environment variables:**

```
DATABASE_URL=postgresql://postgres:...@restaurant-menu-db:5432/restaurant-menu-db?schema=public
```

> `DATABASE_URL` is required at build time — Prisma runs `prisma generate` and fetches tenant/category data during the static export.

**Domains:**

Add custom domains in Coolify UI → one per tenant. The client-side JS redirect in `out/index.html` handles mapping `hostname → slug`. Add as many as needed:

| Domain                  | Redirects To               |
| ----------------------- | -------------------------- |
| `menu.valley-group.com` | `/en/valley-group/menu/`   |
| `luigispizzeria.com`    | `/en/trattoria-roma/menu/` |
| `sakurasushi.com`       | `/en/sakura-sushi/menu/`   |

### 7.3 — API Server (Hono) — Coolify "Node.js"

**Settings:**

| Setting        | Value                                                 |
| -------------- | ----------------------------------------------------- |
| Build pack     | `Node.js`                                             |
| Port           | `3001`                                                |
| Start command  | `npm run api:start`                                   |
| Build command  | `cd api-server && npm install && npx prisma generate` |
| Base directory | `/`                                                   |

The root `package.json` has a root-level workspace, and the API server lives in `api-server/`. The build/start commands `cd` into that directory. No Dockerfile needed — Coolify's Node.js buildpack auto-detects the port.

**Environment variables:**

```
DATABASE_URL=postgresql://postgres:...@restaurant-menu-db:5432/restaurant-menu-db?schema=public
BETTER_AUTH_SECRET=<generate: openssl rand -hex 32>
BETTER_AUTH_URL=https://api.yourdomain.com
COOLIFY_BUILD_HOOK=<from Coolify Static Site deployment settings>
```

- `BETTER_AUTH_SECRET` — a random hex string, generates session tokens
- `BETTER_AUTH_URL` — must be the public URL of the API server (Coolify auto-assigns `https://api-xxxx.xxxxxx.xyz` or use a custom domain)
- `COOLIFY_BUILD_HOOK` — found in the Static Site deployment's settings → "Build hook" → copy the URL. This is what the API calls to trigger a rebuild when data changes

**Optional: Custom domain for the API**

In Coolify, add a domain like `api.menuhost.com` to the API Server resource. Then set `BETTER_AUTH_URL=https://api.menuhost.com`.

### 7.4 — Domain routing strategy (MVP)

For the MVP, keep the **client-side JS redirect** in `out/index.html`. The script:

1. Looks up `hostname` in the domain→slug map
2. Detects browser language (`navigator.language`)
3. Redirects to `/{locale}/{slug}/menu/`

This is zero-cost (no Traefik config, no edge workers) and works with any number of domains.

**To add a new tenant's domain:**

1. Add the domain to Coolify's Static Site resource (so Traefik routes it there)
2. Add an entry to the domain map in `app/page.tsx`
3. Rebuild the site (via build hook or manual deploy)

**Future: Traefik-level redirects**

When the number of domains grows, migrate to Traefik middleware rules to eliminate the JS redirect:

```yaml
# Applied to the Static Site service in Coolify's docker-compose.yml
labels:
  - 'traefik.http.routers.static.rule=Host(`luigispizzeria.com`)'
  - 'traefik.http.middlewares.trattoria-redirect.redirectregex.regex=^/'
  - 'traefik.http.middlewares.trattoria-redirect.redirectregex.replacement=/en/trattoria-roma/menu/'
  - 'traefik.http.routers.static.middlewares=trattoria-redirect'
```

Browser language detection can be added via a small edge middleware or Coolify's redirect rules. For now, English is the default; the language switcher handles toggling to Arabic.

### 7.5 — Build hooks (auto-rebuild on data change)

When an admin creates/edits/deletes categories or items, the site needs to rebuild to reflect the changes.

**Flow:**

1. Admin performs CRUD in the API server
2. API server fires a `POST` to the Coolify build hook URL
3. Coolify queues a new deployment of the Static Site
4. After ~30s, the site is updated

**Implementation:**

The endpoint already exists in the plan (see Phase 2.4). Create `api-server/routes/builds.ts`:

```ts
import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';

export const builds = new Hono();
builds.use('*', requireAuth);

builds.post('/trigger', async (c) => {
  const hookUrl = process.env.COOLIFY_BUILD_HOOK;
  if (!hookUrl) return c.json({ error: 'Build hook not configured' }, 500);

  const res = await fetch(hookUrl, { method: 'POST' });
  if (!res.ok) throw new Error(`Hook returned ${res.status}`);

  return c.json({ triggered: true });
});
```

**Wiring:** Call this endpoint from the items/categories CRUD routes after any write operation. Use `c.exec()` or a simple `fetch` fire-and-forget inside the route handler. For the MVP, a manual "Rebuild site" button in the admin panel is sufficient — no auto-trigger on every save.

**Manual rebuild button:**

Add a button in the admin sidebar:

```
Rebuild Site  (calls POST /api/builds/trigger)
```

This gives the admin control over when the site refreshes, avoiding rebuild storms on every item save.

### 7.6 — Storage for uploaded images

The `POST /api/upload` route currently saves to a local `uploads/` directory. In Coolify:

- **Dev/MVP:** Keep local storage. Coolify's persistent storage mounts (`/data/uploads`) survive container restarts.
- **Production:** Migrate to an S3-compatible bucket (Backblaze B2, Wasabi, or DigitalOcean Spaces). Set `STORAGE_ENDPOINT`, `STORAGE_KEY`, `STORAGE_BUCKET` env vars.

For the static site, images are served from the API server's URL (or CDN). In the static export, `<img>` tags reference the full URL — no hotlinking needed since images are public.

### 7.7 — One-command deploy checklist

```
□ 1. Add PostgreSQL in Coolify → copy DATABASE_URL
□ 2. Create Static Site service → paste DATABASE_URL, set build/publish
□ 3. Create API Server service → paste DATABASE_URL, set build/start/port
□ 4. Generate BETTER_AUTH_SECRET → set on API Server
□ 5. Deploy API Server first → copy its Coolify-assigned URL
□ 6. Set BETTER_AUTH_URL on API Server to that URL
□ 7. Copy build hook URL from Static Site → set COOLIFY_BUILD_HOOK on API Server
□ 8. Deploy Static Site (it needs the API to be running for build? No — static export is independent)
□ 9. Add custom domains to Static Site in Coolify UI
□ 10. Run `npx prisma migrate deploy` on the API server (or manually via terminal)
□ 11. Run `npx tsx api-server/seed-admin.ts` to seed users
□ 12. Verify: visit public menu + admin login
```

---

## Verification Checklist

- [x] `npm run build` succeeds
- [x] `out/` contains `/{locale}/{slug}/menu/` for all locale×tenant combinations
- [x] Each tenant page renders with correct design tokens per locale
- [x] English pages have LTR layout, Arabic pages have RTL layout
- [x] Category/item names show correct translation per locale
- [x] Fallback works: if translation missing, shows English name
- [x] Language switcher toggles between `/en/...` and `/ar/...`
- [ ] Domain redirect is handled at Traefik level (no client-side JS redirect)
- [x] Public menu has minimal client JavaScript (language switcher + OrderMenu only)
- [x] API CRUD includes translation upsert endpoints
- [x] Image upload resizes + converts to WebP via sharp (3 sizes)
- [x] Menu items render in a photo card grid with consistent aspect ratios
- [x] Running total counter works client-side with no API calls
- [x] Admin login/auth works (better-auth, email/password)
- [x] Super admin can manage tenants + locale settings
- [x] Import/export works via JSON file (sidebar Import view, Export button)
- [x] Admin CRUD includes `financialPrice` field
- [ ] Mobile responsive, Lighthouse ≥ 95
