# Android handoff — 2026-09-14

From: Android track (restaurant_menu_android). Owner decisions executed on Android; web side still to do.

## Decisions (owner, 2026-09-14)

1. **Dietary tags removed** — useless field. No enum, no chips, no admin input.
2. **Currency SYP-only** — no per-tenant currency column. Android hardcodes `SYP 180` / `180 ل.س`, Latin digits always.

## Android — done

- Dropped `menu_items.dietary_tags_csv` (drift `schemaVersion` 1 → 2 with `ALTER TABLE menu_items DROP COLUMN dietary_tags_csv` migration in `lib/core/db/app_db.dart`).
- Removed admin tags textbox + `dietaryTags` param (`items_admin_page.dart`, `admin_writes.dart`).
- Removed kiosk tag pills + `MenuItemView.tags` (`menu_item_card.dart`, `menu_providers.dart`).
- Sync: `itemPushJson` no longer sends `dietaryTags`; `parseServerItem` ignores inbound `dietaryTags` (old servers still sending it won't crash). Seed loader ignores it too.
- `menu_format.dart` comment now says SYP-only locked; no behavior change (already SYP-only).
- `docs/PLAN.md` §1/§14/§23 updated. `flutter analyze` clean, `flutter test` 70/70 green.

## Web — todo (your call)

### 1. Drop `dietaryTags`
Files referencing it (rg `dietaryTags`):
- `prisma/schema.prisma:182` (`MenuItem.dietaryTags String[]`) → remove field + `prisma migrate dev` (new migration dropping column). Note existing migration `20260712171337_init` has `"dietaryTags" TEXT[]` — history stays, new migration drops it.
- `prisma/seed.ts:409`, `app/api/tenants/[id]/starter-seed/route.ts:69` (`dietaryTags: []`) → delete lines.
- `lib/types.ts:46`, `components/menu/order-menu.tsx:123,872-874` (type + chip render) → remove.
- `components/admin/items-view.tsx:33,192,261,500-503` (type + form parse/default + input) → remove.
- `app/api/items/route.ts:52`, `app/api/items/[id]/route.ts:47` → stop reading/writing.
- `app/api/import/route.ts:94,121`, `app/api/export/route.ts:39` → drop field.
- `app/api/sync/push/route.ts:23,170,190` (Zod-ish type + create/update) → drop; keep **accept-but-ignore** `dietaryTags` on push during rollout so old APKs (pre-v2) don't 400, then remove entirely.
- `messages/en.json:52`, `messages/ar.json:52` (`dietaryTags` label) → delete keys.
- `product.md:278`, `PLAN.md` (whatever mirrors it) → mark removed.

Pull shape: Android ignores unknown `dietaryTags`, so you can stop sending it immediately — no Android coordination needed. Push shape: new Android never sends it.

### 2. Currency — close as SYP-only
- Do **not** add `Tenant.currency`. Close the open "per-tenant currency" item.
- If web renders prices anywhere configurable, lock to `SYP` / `ل.س` to match Android (`menu_format.dart`).

## Still open from Android (unchanged)
- **Server slugify mirror**: send the exact slugify function web uses for categories so tablet offline slugs match (`@@unique([tenantId, slug])`, 409 regen path).
- **better-auth session TTL + 401 shape** (for offline-grace tuning).

## Verify
- `rg dietaryTags` → zero hits (excluding old migration SQL + this file).
- `pnpm db:migrate` + seed + `pnpm build` green; pull response has no `dietaryTags`; push with a stray `dietaryTags` key is ignored, not rejected.
