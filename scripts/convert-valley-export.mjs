import { readFileSync, writeFileSync } from 'node:fs';

const src = process.argv[2] ?? 'seed/valley-menu-export.json';
const out = process.argv[3] ?? 'seed/valley-menu-import.json';

const data = JSON.parse(readFileSync(src, 'utf8'));
if (!Array.isArray(data.categories) || !Array.isArray(data.items)) {
  console.error('Expected { categories: [], items: [] }');
  process.exit(1);
}

// Flat items collapsed into one item with variants:
// [baseName, [flatItemName, variantLabel, variantLabelEn, price], ...]
const VARIANT_GROUPS = [
  ['كباب مشوي', [
    ['كباب مشوي', 'كيلو', '1Kg', 4400],
    ['وجبة كباب مشوي', 'وجبة', 'Meal', 1100],
  ]],
  ['شقف', [
    ['كيلو شقف', 'كيلو', '1Kg', 4500],
    ['وجبة شقف', 'وجبة', 'Meal', 1150],
  ]],
  ['مشاوي مشكل', [
    ['كيلو مشاوي مشكل', 'كيلو', '1Kg', 3650],
    ['نصف كيلو مشاوي مشكل', 'نصف كيلو', '1/2Kg', 3650],
    ['وجبة مشاوي مشكل', 'وجبة', 'Meal', 1050],
  ]],
  ['شيش طاووق', [
    ['كيلو شيش طاووق', 'كيلو', '1Kg', 2100],
    ['وجبة شيش طاووق', 'وجبة', 'Meal', 750],
  ]],
  ['شيش بالفخار', [
    ['كيلو شيش بالفخار', 'كيلو', '1Kg', 2250],
    ['وجبة شيش بالفخار', 'وجبة', 'Meal', 900],
  ]],
  ['معسل', [
    ['معسل', 'عادي', 'Regular', 400],
    ['معسل اكسترا', 'معسل اكسترا', 'Extra', 600],
    ['نربيش صحي', 'نربيش صحي', 'Sterilized Hose', 100],
  ]],
  ['عرق', [
    ['كأس عرق', 'كأس', 'Glass', 200],
    ['ربعية عرق', 'ربعية', '1/4L', 300],
    ['نصية عرق', 'نصية', '1/2L', 600],
    ['سوداية عرق', 'سوداية', 'Soudaya', 770],
    ['ليتر عرق', 'ليتر', '1L', 1100],
  ]],
  ['فودكا', [
    ['كأس فودكا', 'كأس', 'Glass', 400],
    ['كأس فودكا عصير', 'مع عصير', '+Juice', 430],
    ['كأس فودكا اينرجي', 'مع اينرجي', '+Energy', 500],
    ['كأس فودكا ريد بول', 'ريد بول', 'Red Bull', 600],
    ['كأس فودكا سفن و ليمون', 'سفن و ليمون', '7up & Lemon', 550],
  ]],
  ['ويسكي', [
    ['كأس ويسكي ريد', 'ريد', 'Red', 650],
    ['كأس ويسكي بلاك', 'بلاك', 'Black', 770],
    ['كأس ويسكي شيفاز', 'شيفاز', 'Chivas', 850],
  ]],
  ['نبيذ', [
    ['كأس نبيذ', 'كأس', 'Glass', 300],
    ['ليتر نبيذ', 'ليتر', 'Liter', 2600],
    ['ليتر نبيذ سلاف', 'سلاف', 'Solaf', 1300],
    ['ليتر نبيذ كفريا', 'كفريا', 'Kifryah', 1050],
  ]],
  ['بيرة المازا', [
    ['بيرة المازا', 'عادي', 'Regular', 600],
    ['بيرة المازا مكسيكي', 'مكسيكي', 'Mexican', 650],
  ]],
  ['بيرة بيروت', [
    ['بيرة بيروت', 'عادي', 'Regular', 550],
    ['بيرة بيروت مكسيكي', 'مكسيكي', 'Mexican', 600],
  ]],
  ['بيرة كورونا', [
    ['بيرة كورونا', 'عادي', 'Regular', 650],
    ['بيرة كورونا مكسيكي', 'مكسيكي', 'Mexican', 700],
  ]],
];

const flatByName = new Map(data.items.map((i) => [i.name, i]));
const groupedNames = new Set(VARIANT_GROUPS.flatMap(([, vs]) => vs.map((v) => v[0])));

const byCategory = new Map();
for (const c of data.categories) byCategory.set(c.name, { ...c, items: [] });

// Emit grouped variant items first (anchor on the first member's category).
for (const [baseName, variants] of VARIANT_GROUPS) {
  const first = flatByName.get(variants[0][0]);
  if (!first) {
    console.warn(`Variant group "${baseName}": missing "${variants[0][0]}" — skipped`);
    continue;
  }
  const cat = byCategory.get(first.categoryName);
  if (!cat) {
    console.warn(`Variant group "${baseName}": unknown category "${first.categoryName}"`);
    continue;
  }
  const { categoryName: _drop, financialPrice: _drop2, ...rest } = first;
  delete rest.consumerPrice;
  cat.items.push({
    ...rest,
    name: baseName,
    nameEn: baseName === 'معسل' ? 'Shisha'
      : baseName === 'عرق' ? 'Arak'
      : baseName === 'فودكا' ? 'Vodka'
      : baseName === 'ويسكي' ? 'Whiskey'
      : baseName === 'نبيذ' ? 'Wine'
      : baseName === 'بيرة المازا' ? 'Almaza Beer'
      : baseName === 'بيرة بيروت' ? 'Beirut Beer'
      : baseName === 'بيرة كورونا' ? 'Corona Beer'
      : baseName === 'كباب مشوي' ? 'Grilled Kebab'
      : baseName === 'شقف' ? 'Shekaf'
      : baseName === 'مشاوي مشكل' ? 'Mixed Grills'
      : baseName === 'شيش طاووق' ? 'Shish Tawook'
      : 'Shish Tawook in Pot',
    variants: variants.map(([, label, labelEn, price]) => ({ label, labelEn, price })),
  });
}

const missing = new Set();
for (const item of data.items) {
  if (groupedNames.has(item.name)) continue;
  const cat = byCategory.get(item.categoryName);
  if (!cat) {
    missing.add(item.categoryName);
    continue;
  }
  const { categoryName: _drop, financialPrice: _drop2, ...rest } = item;
  cat.items.push(rest);
}

for (const cat of byCategory.values()) {
  cat.items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
const categories = [...byCategory.values()].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

if (missing.size) console.warn('Items with unknown category:', [...missing]);

writeFileSync(out, JSON.stringify({ categories }, null, 2));
const items = categories.reduce((n, c) => n + c.items.length, 0);
console.log(`Wrote ${out}: ${categories.length} categories, ${items} items`);
