# Product: Multi-Tenant Restaurant Menu Website

## Problem

Restaurant menus change frequently — price updates, seasonal items, out-of-stock dishes. Each change requires reprinting physical menus, costing time and money. Digital menus are often PDFs (same problem) or bloated web apps that load poorly on slow internet.

## Solution

A **lightweight, static, multi-tenant website** where restaurants get a beautiful digital menu they can update in real-time. The public-facing menu is pre-rendered static HTML — loads instantly even on 3G. An admin panel lets staff manage categories and items. A super admin (us) manages all tenants, domains, and theming.

---

## Target Users

| User | Goal |
|---|---|
| **Restaurant owner / staff** | Update menu items, prices, categories, and theme colors — no technical skills needed |
| **Customer** | Browse the menu on their phone, see photos, prices, and dietary info — fast even on slow networks |
| **Super admin (us)** | Onboard new restaurants, configure custom domains, manage billing, oversee all tenants |

---

## Core Features

### Public Menu (Customer-facing)
- View restaurant menu grouped by categories
- See item name, description, price, photo, dietary tags
- Filter by category or dietary preference
- Responsive design — works perfectly on mobile phones
- Zero JavaScript on initial load (pure HTML/CSS)
- Each restaurant gets its own domain or subdomain
- Each restaurant has unique theme (colors, fonts) matching their brand

### Admin Panel (Restaurant staff)
- Secure login (email + password) via **better-auth**
- Dashboard with quick stats
- Manage categories (create, rename, reorder, hide)
- Manage menu items (create, edit price/description/photo, toggle availability, reorder)
- Manage restaurant info (address, phone, social links, logo, cover photo)
- Theme editor (pick brand colors, see live preview)

### Super Admin Panel (Us)
- List all tenants with status
- Create new tenant (assign slug, domain, initial theme)
- Manage tenant users (invite, suspend)
- Configure custom domain mapping
- View build/deploy status per tenant

---

## Technical Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Traefik (Coolify)                       │
│                                                              │
│  Host header routing ─┬──────────────┬──────────────────┐    │
│                       │              │                  │    │
│  ┌──────────────────┐ │ ┌──────────┐ │ ┌──────────────┐ │    │
│  │ tenant1.com      │ │ │tenant2   │ │ │api.menuhost  │ │    │
│  │ → /{slug}/menu  │ │ │.com/*    │ │ │.com          │ │    │
│  └────────┬─────────┘ │ └────┬─────┘ │ │  better-auth │ │    │
│           │                  │       │ │  CRUD        │ │    │
│  ┌────────▼──────────────────▼──────┐ │ │  webhooks    │ │    │
│  │ Static Site (Nginx / CDN)       │ │ └──────┬───────┘ │    │
│  │ out/{slug}/menu/index.html       │ │        │          │    │
│  │ out/{slug}/menu/starters/        │ │        │          │    │
│  └──────────────────────────────────┘ │        │          │    │
│                                       │        │          │    │
│  ┌────────────────────────────────────▼────────▼──────┐   │    │
│  │              PostgreSQL (via Coolify)                │   │    │
│  │  better-auth tables (user, session, account, ...)    │   │    │
│  │  + app tables (tenants, categories, menu_items)      │   │    │
│  └──────────────────────────────────────────────────────┘   │    │
└──────────────────────────────────────────────────────────────┘
```

### Split Deployment Rationale

We use **`output: 'export'`** (static export) for the public menu + admin UI because:

- **Speed**: Static HTML loads instantly on any connection. No server round-trip for page content.
- **Reliability**: No server to crash. The site is served from a CDN / static file server.
- **Cost**: Static hosting is cheap (or free) even at scale.

Since static export disables Next.js API routes and runtime middleware, a **separate API server** handles:

1. Authentication via **better-auth** (session management, email/password, social login in future)
2. Admin CRUD operations (categories, items, tenants)
3. Webhook triggers (tell Coolify to rebuild the static site when data changes)
4. File uploads (menu item photos, logos)

The API server uses **Hono** with better-auth's Hono adapter, deployed as a separate Coolify service.

The admin UI (static export) uses **better-auth client SDK** (`createAuthClient`) to talk to the API server from the browser — login, session checks, and protected API calls.

### Traefik routing rules

```yaml
# Coolify / Traefik config concept
# For each tenant with a custom domain:
- rule: "Host(`luigispizzeria.com`) && PathPrefix(`/`)"
  middleware:
    - "replacePathRegex: ^/(.*) /luigi-pizzeria/$1"

# For the API (includes better-auth endpoints):
- rule: "Host(`api.menuhost.com`)"
  service: "api-server:3001"
```

---

## Data Model (Prisma Schema)

### better-auth managed tables

better-auth manages these tables automatically. We configure the Prisma adapter and let better-auth create them via `npx @better-auth/cli generate`.

```prisma
// better-auth models — managed by the CLI, do not edit manually
model User {
  id               String      @id
  name             String
  email            String       @unique
  emailVerified    Boolean      @default(false)
  image            String?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  twoFactorEnabled Boolean?     @default(false)
  username         String?
  displayUsername  String?
  sessions         Session[]
  accounts         Account[]
  twofactors       TwoFactor[]

  // Custom fields for multi-tenant support
  tenantId String? // null = super admin
  role     String  @default("TENANT_ADMIN") // SUPER_ADMIN | TENANT_ADMIN

  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}

model TwoFactor {
  id        String   @id
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  secret    String?
  backupCodes String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("twofactor")
}
```

### Application tables

```prisma
enum TenantPlan {
  FREE
  STARTER
  PRO
}

model Tenant {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  slug      String   @unique
  domain    String?  @unique
  plan      TenantPlan @default(FREE)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // ── Branding / Theme (CSS custom properties) ──
  primaryColor    String @default("#e74c3c")
  secondaryColor  String @default("#2c3e50")
  accentColor     String @default("#f39c12")
  backgroundColor String @default("#fdf5e6")
  fontFamily      String @default("Inter, system-ui, sans-serif")
  borderRadius    String @default("8px")

  // ── Restaurant Info ──
  logoUrl     String?
  coverUrl    String?
  description String?
  address     String?
  phone       String?
  instagram   String?
  website     String?

  // ── Relations ──
  categories Category[]
  items      MenuItem[]

  @@map("tenants")
}

model Category {
  id           String   @id @default(uuid()) @db.Uuid
  tenantId     String   @db.Uuid
  name         String
  slug         String
  description  String?
  displayOrder Int      @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tenant Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  items  MenuItem[]

  @@unique([tenantId, slug])
  @@map("categories")
}

model MenuItem {
  id           String   @id @default(uuid()) @db.Uuid
  tenantId     String   @db.Uuid
  categoryId   String   @db.Uuid
  name         String
  description  String?
  price        Decimal  @db.Decimal(10, 2)
  imageUrl     String?
  isAvailable  Boolean  @default(true)
  displayOrder Int      @default(0)
  dietaryTags  String[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tenant   Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@index([tenantId, categoryId])
  @@map("menu_items")
}
```

### Entity relationships

```
Tenant (1) ──< Category (many)
Tenant (1) ──< MenuItem (many)
Tenant (1) ──< User.tenantId (many, via better-auth additionalFields)

User (1) ──< Session (many)     ← managed by better-auth
User (1) ──< Account (many)     ← managed by better-auth

Category (1) ──< MenuItem (many)
```

### Indexing Strategy
- `MenuItem.tenantId + categoryId` — composite index for menu queries
- `Category.tenantId + slug` — unique for clean URL resolution
- `User.email` — unique (handled by better-auth)
- `Tenant.slug` — unique for URL routing
- `Tenant.domain` — unique (sparse, nullable) for custom domain lookup

---

## Better Auth Integration

### How it works

```
Browser (static export)              API Server (Hono)
┌──────────────────────┐            ┌──────────────────────┐
│                      │            │                      │
│  createAuthClient()  │──POST──►   │  better-auth handler │
│  signIn.email()      │   /api/    │  → validate creds    │
│                      │   auth/    │  → create session    │
│  ← cookie or token   │◄──resp──  │  → return user +     │
│                      │            │    session           │
│  useSession()        │──GET──►   │  GET /api/auth/       │
│  → { user, session } │◄──resp──  │  session             │
│                      │            │                      │
└──────────────────────┘            └──────────────────────┘
```

**On the API server** (Hono):

```ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      tenantId: { type: "string", required: false },
      role: { type: "string", required: true, defaultValue: "TENANT_ADMIN" },
    },
  },
})
```

**In the admin UI** (static export, browser):

```ts
import { createAuthClient } from "better-auth/client"

export const authClient = createAuthClient({
  baseURL: "https://api.menuhost.com", // the API server
})

// Login
await authClient.signIn.email({ email, password })

// Check session
const { data: session } = await authClient.useSession()
```

### Why better-auth over custom JWT

| Feature | Custom JWT | better-auth |
|---|---|---|
| Session management | Manual | Built-in (cookie + DB session) |
| Password hashing | Manual | Built-in (argon2) |
| Email verification | Manual | Plugin |
| Social login | Manual | Plugin (Google, GitHub, etc.) |
| Multi-tenant roles | Custom code | Additional fields |
| Rate limiting | Manual | Plugin |
| CSRF protection | Manual | Built-in |
| Client SDK | Manual | `createAuthClient()` |

---

## Route Design (Next.js App Router)

```
/                                    → Landing / tenant selector
/[slug]/menu                         → Full public menu (static)
/[slug]/menu/[categorySlug]          → Filtered menu (static)

/admin/login                         → Admin login page (client-rendered, uses better-auth client)
/admin                               → Redirect to dashboard
/admin/categories                    → Manage categories
/admin/items                         → Manage menu items
/admin/items/new                     → Create menu item
/admin/items/[id]/edit               → Edit menu item
/admin/settings                      → Restaurant info + theme

/_super/login                        → Super admin login
/_super/tenants                      → List / manage all tenants
/_super/tenants/new                  → Create tenant
/_super/tenants/[id]/edit            → Edit tenant
/_super/tenants/[id]/users           → Manage tenant users
/_super/builds                       → Build status history
```

---

## Component Tree (Simplified)

### Public Menu

```
<RootLayout slug={slug}>
  ← reads tenant CSS vars from build-time data, injects into <head>
  └─ <MenuPage>
       ├─ <RestaurantHeader logo description />
       ├─ <CategoryNav categories />
       │    (scrollable tabs for each category)
       └─ <MenuList>
            └─ <CategorySection category>
                 └─ <MenuItemCard>
                      ├─ <ItemPhoto />
                      ├─ <ItemInfo>
                      │    ├─ name
                      │    ├─ description
                      │    ├─ dietary tags
                      │    └─ price
                      └─ </ItemInfo>
                 └─ </MenuItemCard>
           </CategorySection>
      </MenuList>
</RootLayout>
```

### Admin Panel

```
<AdminLayout>                      ← AuthProvider (better-auth useSession)
  ├─ <Sidebar />                   ← nav links
  └─ <Outlet />                    ← page content
       ├─ <Dashboard />            ← stats
       ├─ <CategoryList />         ← CRUD table
       ├─ <ItemList />             ← CRUD table with filters
       ├─ <ItemForm />             ← create/edit form
       └─ <SettingsForm />         ← restaurant info + theme
```

---

## Theming per Tenant

Each tenant's brand colors are stored as DB columns on the `Tenant` model. At build time, they are injected into the page as CSS custom properties:

```html
<style>
  :root {
    --primary: #e74c3c;
    --secondary: #2c3e50;
    --accent: #f39c12;
    --bg: #fdf5e6;
    --font: 'Inter', system-ui, sans-serif;
    --radius: 8px;
  }
</style>
```

The CSS uses these variables throughout:

```css
.menu-card { background: var(--bg); border-radius: var(--radius); }
.price { color: var(--primary); font-weight: 700; }
.category-heading { color: var(--secondary); border-bottom: 2px solid var(--accent); }
```

---

## Admin UX Flow

```
1. Staff navigates to {restaurant-domain}/admin/login
2. Enters email + password
3. better-auth client calls API server → validates → sets session cookie
4. AuthProvider detects session → redirects to dashboard
5. Can:
   - Click "Categories" → see list, drag to reorder, add/edit/delete
   - Click "Menu Items" → table with search/filter, click to edit inline
   - Click "Settings" → edit restaurant name, address, upload logo
   - Click "Theme" → color pickers that show live preview
6. On save → API updates DB → API triggers Coolify build hook → site rebuilds
   (build takes ~30s — we show a "Your menu is being updated" toast)
```

---

## API Endpoints

The API server uses Hono with better-auth middleware for auth:

```
# Better auth handles these automatically:
POST   /api/auth/sign-up/email    → register with email + password
POST   /api/auth/sign-in/email    → login, returns session
GET    /api/auth/session          → get current session / user
POST   /api/auth/sign-out         → destroy session

# Our custom endpoints (protected by better-auth middleware):
GET    /api/categories?tenantId=  → Category[]
POST   /api/categories           → Category (create)
PUT    /api/categories/:id       → Category (update)
DELETE /api/categories/:id       → void

GET    /api/items?tenantId=&categoryId= → MenuItem[]
POST   /api/items                → MenuItem (create, accepts multipart for image)
PUT    /api/items/:id            → MenuItem (update)
DELETE /api/items/:id            → void
PATCH  /api/items/:id/availability → { isAvailable }

GET    /api/tenants              → Tenant[] (super admin only)
POST   /api/tenants              → Tenant (create)
PUT    /api/tenants/:id          → Tenant (update, including theme colors)
DELETE /api/tenants/:id          → void (deactivate)

POST   /api/builds/trigger       → { buildId }
POST   /api/upload               → { url } (image upload to S3/DO Spaces/B2)
```

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| **Lighthouse Performance** | 95+ on mobile (public menu) |
| **Page weight** | < 50 KB total (HTML + CSS), 0 JS on public menu |
| **TTFB** | < 200ms (static file from CDN/edge) |
| **Build time** | < 2 min for 100 tenants |
| **API response time** | < 100ms p95 |
| **SEO** | Each restaurant menu gets unique meta tags, OG images |
| **Accessibility** | WCAG 2.1 AA |
| **Offline resilience** | Public menu works offline via service worker caching (phase 2) |

---

## Future (Phase 2+)

- QR code generation per table with table number param for analytics
- Order-ahead integration (links to delivery platforms)
- Multi-language menus
- Menu analytics (most viewed items, peak hours)
- Printable PDF menu auto-generated from the same data
- POS integration (Square, Toast, Lightspeed)
- Self-service signup with Stripe billing
- Edge builds per tenant (only rebuild changed tenant's pages)

---

## Glossary

| Term | Definition |
|---|---|
| **Tenant** | A single restaurant that uses the platform |
| **Slug** | URL-friendly identifier for a tenant (e.g., `luigi-pizzeria`) |
| **Static Export** | Next.js build mode that outputs pure HTML/CSS — no server needed |
| **Build Hook** | URL that triggers a rebuild of the static site (provided by Coolify) |
| **CSS Custom Properties** | CSS variables (e.g., `--primary`) used for theming without JS |
| **better-auth** | Open-source auth library handling sessions, passwords, and roles |
| **Traefik** | Reverse proxy used by Coolify for domain routing |
