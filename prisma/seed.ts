import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  // Clear existing translations + items + categories so we can seed cleanly
  await prisma.menuItemTranslation.deleteMany();
  await prisma.categoryTranslation.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tenant.deleteMany();

  const trattoria = await prisma.tenant.create({
    data: {
      name: 'Trattoria Roma',
      slug: 'trattoria-roma',
      domain: 'luigispizzeria.com',
      primaryColor: '#c0392b',
      secondaryColor: '#2c3e50',
      accentColor: '#f39c12',
      backgroundColor: '#fef9f0',
      surfaceColor: '#ffffff',
      textColor: '#1a1a2e',
      textMuted: '#64748b',
      headingFont: "'Playfair Display', Georgia, serif",
      bodyFont: "'Inter', system-ui, sans-serif",
      borderRadiusSm: '4px',
      borderRadiusMd: '8px',
      borderRadiusLg: '16px',
      shadow: '0 2px 12px rgba(0,0,0,0.08)',
      cardStyle: 'elevated',
      menuLayout: 'single',
      spacing: 'comfortable',
      description: 'Authentic Italian cuisine since 1982',
      address: '42 Via Roma, Florence',
      phone: '+39 055 1234567',
      instagram: '@trattoriaroma',
      defaultLocale: 'en',
      availableLocales: ['en', 'ar'],
    },
  });

  const sushiBar = await prisma.tenant.create({
    data: {
      name: 'Sakura Sushi Bar',
      slug: 'sakura-sushi',
      domain: 'sakurasushi.com',
      primaryColor: '#e91e63',
      secondaryColor: '#263238',
      accentColor: '#ffb300',
      backgroundColor: '#fafafa',
      surfaceColor: '#ffffff',
      textColor: '#1a1a2e',
      textMuted: '#78909c',
      headingFont: "'DM Serif Display', Georgia, serif",
      bodyFont: "'Inter', system-ui, sans-serif",
      borderRadiusSm: '2px',
      borderRadiusMd: '4px',
      borderRadiusLg: '8px',
      shadow: '0 1px 4px rgba(0,0,0,0.06)',
      cardStyle: 'bordered',
      menuLayout: 'two-column',
      spacing: 'compact',
      description: 'Fresh sushi & Japanese delicacies',
      address: '15 Cherry Blossom Lane, Tokyo',
      phone: '+81 3 1234 5678',
      instagram: '@sakurasushi',
      defaultLocale: 'en',
      availableLocales: ['en', 'ar'],
    },
  });

  // ── Categories + Items for Trattoria Roma ──

  const antipasti = await prisma.category.create({
    data: {
      tenantId: trattoria.id,
      name: 'Antipasti',
      slug: 'antipasti',
      description: 'To share',
      displayOrder: 0,
      items: {
        create: [
          {
            tenantId: trattoria.id,
            name: 'Bruschetta al Pomodoro',
            description: 'Toasted sourdough, ripe tomatoes, basil, extra virgin olive oil',
            price: 8.5,
            displayOrder: 0,
            dietaryTags: ['vegetarian', 'vegan'],
          },
          {
            tenantId: trattoria.id,
            name: 'Calamari Fritti',
            description: 'Crispy fried squid with lemon and aioli',
            price: 12.0,
            displayOrder: 1,
            dietaryTags: [],
          },
          {
            tenantId: trattoria.id,
            name: 'Prosciutto e Melone',
            description: 'Parma ham with sweet melon',
            price: 11.0,
            displayOrder: 2,
            dietaryTags: ['gluten-free'],
          },
        ],
      },
    },
    include: { items: true },
  });

  const pasta = await prisma.category.create({
    data: {
      tenantId: trattoria.id,
      name: 'Pasta',
      slug: 'pasta',
      displayOrder: 1,
      items: {
        create: [
          {
            tenantId: trattoria.id,
            name: 'Spaghetti Carbonara',
            description: 'Guanciale, egg yolk, pecorino, black pepper',
            price: 14.0,
            displayOrder: 0,
            dietaryTags: [],
          },
          {
            tenantId: trattoria.id,
            name: 'Pappardelle al Ragù',
            description: 'Slow-cooked beef and pork ragù on fresh pappardelle',
            price: 15.5,
            displayOrder: 1,
            dietaryTags: [],
          },
          {
            tenantId: trattoria.id,
            name: 'Gnocchi al Pesto',
            description: 'Potato gnocchi with basil pesto, pine nuts, parmesan',
            price: 13.0,
            displayOrder: 2,
            dietaryTags: ['vegetarian'],
          },
        ],
      },
    },
    include: { items: true },
  });

  const dolci = await prisma.category.create({
    data: {
      tenantId: trattoria.id,
      name: 'Dolci',
      slug: 'dolci',
      displayOrder: 2,
      items: {
        create: [
          {
            tenantId: trattoria.id,
            name: 'Tiramisù',
            description: 'Classic coffee and mascarpone layered dessert',
            price: 8.0,
            displayOrder: 0,
            dietaryTags: ['vegetarian'],
          },
          {
            tenantId: trattoria.id,
            name: 'Panna Cotta',
            description: 'Vanilla panna cotta with berry coulis',
            price: 7.5,
            displayOrder: 1,
            dietaryTags: ['vegetarian', 'gluten-free'],
          },
        ],
      },
    },
    include: { items: true },
  });

  // ── Categories + Items for Sakura Sushi ──

  const appetizers = await prisma.category.create({
    data: {
      tenantId: sushiBar.id,
      name: 'Appetizers',
      slug: 'appetizers',
      displayOrder: 0,
      items: {
        create: [
          {
            tenantId: sushiBar.id,
            name: 'Edamame',
            description: 'Steamed soy beans with sea salt',
            price: 5.0,
            displayOrder: 0,
            dietaryTags: ['vegetarian', 'vegan', 'gluten-free'],
          },
          {
            tenantId: sushiBar.id,
            name: 'Gyoza',
            description: 'Pan-fried pork dumplings with soy dipping sauce',
            price: 7.5,
            displayOrder: 1,
            dietaryTags: [],
          },
          {
            tenantId: sushiBar.id,
            name: 'Miso Soup',
            description: 'Tofu, wakame, green onion in miso broth',
            price: 4.5,
            displayOrder: 2,
            dietaryTags: ['vegetarian', 'vegan'],
          },
        ],
      },
    },
    include: { items: true },
  });

  const sushi = await prisma.category.create({
    data: {
      tenantId: sushiBar.id,
      name: 'Sushi',
      slug: 'sushi',
      displayOrder: 1,
      items: {
        create: [
          {
            tenantId: sushiBar.id,
            name: 'Salmon Nigiri (2 pcs)',
            description: 'Fresh Atlantic salmon on hand-pressed rice',
            price: 8.0,
            displayOrder: 0,
            dietaryTags: ['gluten-free'],
          },
          {
            tenantId: sushiBar.id,
            name: 'Dragon Roll (8 pcs)',
            description: 'Shrimp tempura, avocado, eel sauce, sesame',
            price: 14.0,
            displayOrder: 1,
            dietaryTags: [],
          },
          {
            tenantId: sushiBar.id,
            name: 'Spicy Tuna Roll (6 pcs)',
            description: 'Fresh tuna, sriracha, cucumber, sesame',
            price: 11.0,
            displayOrder: 2,
            dietaryTags: [],
          },
        ],
      },
    },
    include: { items: true },
  });

  const desserts = await prisma.category.create({
    data: {
      tenantId: sushiBar.id,
      name: 'Desserts',
      slug: 'desserts',
      displayOrder: 2,
      items: {
        create: [
          {
            tenantId: sushiBar.id,
            name: 'Mochi Ice Cream (3 pcs)',
            description: 'Assorted flavors: matcha, mango, strawberry',
            price: 6.5,
            displayOrder: 0,
            dietaryTags: ['vegetarian', 'gluten-free'],
          },
          {
            tenantId: sushiBar.id,
            name: 'Matcha Cheesecake',
            description: 'Creamy matcha-infused cheesecake with red bean',
            price: 7.0,
            displayOrder: 1,
            dietaryTags: ['vegetarian'],
          },
        ],
      },
    },
    include: { items: true },
  });

  // ── Arabic Translations for Trattoria Roma ──

  await prisma.categoryTranslation.createMany({
    data: [
      { categoryId: antipasti.id, locale: 'ar', name: 'مقبلات', description: 'للمشاركة' },
      { categoryId: pasta.id, locale: 'ar', name: 'معكرونة', description: null },
      { categoryId: dolci.id, locale: 'ar', name: 'حلويات', description: null },
    ],
  });

  await prisma.menuItemTranslation.createMany({
    data: [
      {
        menuItemId: antipasti.items[0].id,
        locale: 'ar',
        name: 'بروشيتا بالطماطم والريحان',
        description: 'خبز محمص مع طماطم طازجة وريحان وزيت زيتون',
      },
      {
        menuItemId: antipasti.items[1].id,
        locale: 'ar',
        name: 'كالاماري مقلي',
        description: 'حبار مقرمش مع ليمون وصلصة أيولي',
      },
      {
        menuItemId: antipasti.items[2].id,
        locale: 'ar',
        name: 'بروسكيوتو بالبطيخ',
        description: 'لحم بارما مع البطيخ الحلو',
      },
      {
        menuItemId: pasta.items[0].id,
        locale: 'ar',
        name: 'سباغيتي كاربونارا',
        description: 'غوانتشيال، صفار بيض، جبن بيكورينو، فلفل أسود',
      },
      {
        menuItemId: pasta.items[1].id,
        locale: 'ar',
        name: 'بابارديل بالراغو',
        description: 'راغو لحم بقري وخنزير مطهو ببطء على بابارديل طازجة',
      },
      {
        menuItemId: pasta.items[2].id,
        locale: 'ar',
        name: 'نيوكي بالبيستو',
        description: 'نيوكي البطاطس مع بيستو الريحان والصنوبر والبارميزان',
      },
      {
        menuItemId: dolci.items[0].id,
        locale: 'ar',
        name: 'تيراميسو',
        description: 'حلوى القهوة والمسكربون الكلاسيكية',
      },
      {
        menuItemId: dolci.items[1].id,
        locale: 'ar',
        name: 'بانا كوتا',
        description: 'بانا كوتا بالفانيليا مع صلصة التوت',
      },
    ],
  });

  // ── Arabic Translations for Sakura Sushi ──

  await prisma.categoryTranslation.createMany({
    data: [
      { categoryId: appetizers.id, locale: 'ar', name: 'مقبلات', description: null },
      { categoryId: sushi.id, locale: 'ar', name: 'سوشي', description: null },
      { categoryId: desserts.id, locale: 'ar', name: 'حلويات', description: null },
    ],
  });

  await prisma.menuItemTranslation.createMany({
    data: [
      {
        menuItemId: appetizers.items[0].id,
        locale: 'ar',
        name: 'إدامامي',
        description: 'فول الصويا المطهو على البخار مع ملح البحر',
      },
      {
        menuItemId: appetizers.items[1].id,
        locale: 'ar',
        name: 'غيوزا',
        description: 'زلابية لحم الخنزير المقلية مع صلصة الصويا',
      },
      {
        menuItemId: appetizers.items[2].id,
        locale: 'ar',
        name: 'حساء ميسو',
        description: 'التوفو والواكامي والبصل الأخضر في مرق الميسو',
      },
      {
        menuItemId: sushi.items[0].id,
        locale: 'ar',
        name: 'نيجيري سلمون (قطعتان)',
        description: 'سلمون أطلسي طازج على أرز مضغوط',
      },
      {
        menuItemId: sushi.items[1].id,
        locale: 'ar',
        name: 'رول التنين (8 قطع)',
        description: 'جمبري مقلي، أفوكادو، صلصة إيل، سمسم',
      },
      {
        menuItemId: sushi.items[2].id,
        locale: 'ar',
        name: 'رول التونة الحارة (6 قطع)',
        description: 'تونة طازجة، سريراتشا، خيار، سمسم',
      },
      {
        menuItemId: desserts.items[0].id,
        locale: 'ar',
        name: 'آيس كريم موتشي (3 قطع)',
        description: 'نكهات مشكلة: ماتشا، مانجو، فراولة',
      },
      {
        menuItemId: desserts.items[1].id,
        locale: 'ar',
        name: 'تشيز كيك ماتشا',
        description: 'تشيز كيك بنكهة الماتشا مع الفاصوليا الحمراء',
      },
    ],
  });

  console.log('Seeded 2 tenants, 6 categories, 16 items, Arabic translations');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
