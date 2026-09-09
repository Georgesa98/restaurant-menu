// One-off: converts prisma/seed.ts literals into the Flutter demo seed asset.
// Usage: node tool/export-seed.mjs <output-json-path>
// Parses (never imports) seed.ts, so its DB-writing main() never runs.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const seedPath = new URL('../prisma/seed.ts', import.meta.url);
const outPath = process.argv[2];
if (!outPath) {
  console.error('usage: node tool/export-seed.mjs <output-json-path>');
  process.exit(1);
}

const src = readFileSync(seedPath, 'utf8');

function extractArrayLiteral(source, marker) {
  const idx = source.indexOf(marker);
  if (idx < 0) throw new Error(`marker not found: ${marker}`);
  // Anchor on '=' so TS type annotations like `SeedItem[]` are skipped.
  const eq = source.indexOf('=', idx);
  const open = source.indexOf('[', eq);
  let depth = 0;
  let inStr = null;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (inStr) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inStr = ch;
      continue;
    }
    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  throw new Error(`unbalanced brackets after: ${marker}`);
}

function extractObjectLiteral(source, marker) {
  const idx = source.indexOf(marker);
  if (idx < 0) throw new Error(`marker not found: ${marker}`);
  // Anchor past `data:` so the create({ brace is skipped.
  const dataIdx = source.indexOf('data:', idx);
  const open = source.indexOf('{', dataIdx);
  let depth = 0;
  let inStr = null;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (inStr) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inStr = ch;
      continue;
    }
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  throw new Error(`unbalanced braces after: ${marker}`);
}

// eslint-disable-next-line @typescript-eslint/no-implied-eval
const evaluate = (literal) => new Function(`return (${literal});`)();

const categories = evaluate(extractArrayLiteral(src, 'const categoriesData'));
const items = evaluate(extractArrayLiteral(src, 'const itemsData'));
const tenant = evaluate(extractObjectLiteral(src, 'const tenant = await prisma.tenant.create({\n    data:'));

const tokenKeys = [
  'primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor',
  'surfaceColor', 'textColor', 'textMuted', 'headingFont', 'bodyFont',
  'borderRadiusSm', 'borderRadiusMd', 'borderRadiusLg', 'shadow',
  'cardStyle', 'menuLayout', 'spacing', 'description', 'address',
  'phone', 'instagram', 'defaultLocale', 'availableLocales',
];
const tokens = {};
for (const k of tokenKeys) {
  if (tenant[k] !== undefined) tokens[k] = tenant[k];
}

const out = {
  source: 'restaurant-menu/prisma/seed.ts (valley-star dataset, demo tenant)',
  tenant: { name: tenant.name, ...tokens },
  categories: categories.map((c) => ({
    slug: c.slug,
    nameAr: c.nameAr,
    nameEn: c.nameEn,
    descriptionAr: c.descriptionAr ?? '',
    descriptionEn: c.descriptionEn ?? '',
    order: c.order ?? 0,
  })),
  items: items.map((it) => ({
    categorySlug: categories.find((c) => c.nameAr === it.categoryName)?.slug ?? null,
    name: it.name,
    nameEn: it.nameEn,
    description: it.description ?? '',
    basePrice: it.basePrice ?? null,
    order: it.order ?? 0,
    isAvailable: it.isAvailable ?? true,
    variants: (it.variants ?? []).map((v) => ({
      label: v.label,
      labelEn: v.labelEn ?? v.label,
      price: v.price,
    })),
  })),
};

const missing = out.items.filter((i) => !i.categorySlug);
if (missing.length > 0) {
  console.error(`unmatched categories for ${missing.length} items:`,
    [...new Set(missing.map((i) => i.name))].slice(0, 5));
  process.exit(1);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${outPath}: ${out.categories.length} categories, ${out.items.length} items`);
