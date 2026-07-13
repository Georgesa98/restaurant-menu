import 'dotenv/config';
import { prisma } from '../lib/prisma';

const EN_CATEGORY_NAMES: Record<string, string> = {
  'مشروبات ساخنة': 'Hot Drinks',
  'مشروبات باردة': 'Cold Drinks',
  غربي: 'Western',
  كريبات: 'Crepes',
  شرقي: 'Eastern',
  'مشروبات كحولية': 'Alcoholic Drinks',
  بيتزا: 'Pizza',
  باريستا: 'Barista',
  'مقبلات باردة': 'Cold Appetizers',
  'مقبلات ساخنة': 'Hot Appetizers',
  سلطات: 'Salads',
  باستا: 'Pasta',
  اراكيل: 'Shisha',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const importData = require('./valley-data.json');

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'valley-group' },
    update: {},
    create: {
      name: 'Valley Group',
      slug: 'valley-group',
      domain: 'menu.valley-group.com',
      plan: 'PRO',
      isActive: true,
      defaultLocale: 'ar',
      availableLocales: ['ar', 'en'],
      description: 'Valley Group Restaurant & Lounge',
      address: 'Syria',
      primaryColor: '#C8412F',
      secondaryColor: '#1D3D3B',
      accentColor: '#DFAA4A',
      backgroundColor: '#F7F5F0',
      surfaceColor: '#FFFFFF',
      textColor: '#1a1a2e',
      textMuted: '#64748b',
      headingFont: 'Georgia, serif',
      bodyFont: 'Inter, system-ui, sans-serif',
    },
  });

  console.log(`Tenant: ${tenant.name} (${tenant.id})`);

  let catCount = 0;
  let itemCount = 0;

  for (const cat of importData.categories) {
    const enName = EN_CATEGORY_NAMES[cat.name] ?? cat.name;
    const catSlug = slugify(enName);

    const category = await prisma.category.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: catSlug } },
      update: { name: enName, displayOrder: cat.order ?? 0 },
      create: {
        tenantId: tenant.id,
        name: enName,
        slug: catSlug,
        displayOrder: cat.order ?? 0,
      },
    });
    catCount++;

    if (cat.name !== enName) {
      await prisma.categoryTranslation.upsert({
        where: { categoryId_locale: { categoryId: category.id, locale: 'ar' } },
        update: { name: cat.name },
        create: { categoryId: category.id, locale: 'ar', name: cat.name },
      });
    }

    const catItems = importData.items.filter((i: any) => i.categoryName === cat.name);
    for (const item of catItems) {
      const itemName = item.nameEn ?? item.name;

      const existing = await prisma.menuItem.findFirst({
        where: { tenantId: tenant.id, categoryId: category.id, name: itemName },
      });

      const data = {
        name: itemName,
        price: item.consumerPrice,
        financialPrice: item.financialPrice ?? item.consumerPrice,
        displayOrder: item.order ?? 0,
        isAvailable: item.isAvailable ?? true,
        dietaryTags: item.dietaryTags ?? [],
        categoryId: category.id,
      };

      let menuItem;
      if (existing) {
        menuItem = await prisma.menuItem.update({ where: { id: existing.id }, data });
      } else {
        menuItem = await prisma.menuItem.create({ data: { ...data, tenantId: tenant.id } });
      }
      itemCount++;

      await prisma.menuItemTranslation.upsert({
        where: { menuItemId_locale: { menuItemId: menuItem.id, locale: 'ar' } },
        update: { name: item.name },
        create: { menuItemId: menuItem.id, locale: 'ar', name: item.name },
      });

      if (item.nameEn) {
        await prisma.menuItemTranslation.upsert({
          where: { menuItemId_locale: { menuItemId: menuItem.id, locale: 'en' } },
          update: { name: item.nameEn },
          create: { menuItemId: menuItem.id, locale: 'en', name: item.nameEn },
        });
      }
    }
  }

  console.log(`Imported ${catCount} categories, ${itemCount} items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
