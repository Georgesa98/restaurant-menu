import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const trattoria = await prisma.tenant.upsert({
    where: { slug: "trattoria-roma" },
    update: {},
    create: {
      name: "Trattoria Roma",
      slug: "trattoria-roma",
      primaryColor: "#c0392b",
      secondaryColor: "#2c3e50",
      accentColor: "#f39c12",
      backgroundColor: "#fef9f0",
      fontFamily: "Georgia, serif",
      description: "Authentic Italian cuisine since 1982",
      address: "42 Via Roma, Florence",
      phone: "+39 055 1234567",
      instagram: "@trattoriaroma",
    },
  })

  const sushiBar = await prisma.tenant.upsert({
    where: { slug: "sakura-sushi" },
    update: {},
    create: {
      name: "Sakura Sushi Bar",
      slug: "sakura-sushi",
      primaryColor: "#e91e63",
      secondaryColor: "#263238",
      accentColor: "#ffb300",
      backgroundColor: "#fafafa",
      fontFamily: "Inter, system-ui, sans-serif",
      description: "Fresh sushi & Japanese delicacies",
      address: "15 Cherry Blossom Lane, Tokyo",
      phone: "+81 3 1234 5678",
      instagram: "@sakurasushi",
    },
  })

  await prisma.category.create({
    data: {
      tenantId: trattoria.id,
      name: "Antipasti",
      slug: "antipasti",
      description: "To share",
      displayOrder: 0,
      items: {
        create: [
          { tenantId: trattoria.id, name: "Bruschetta al Pomodoro", description: "Toasted sourdough, ripe tomatoes, basil, extra virgin olive oil", price: 8.5, displayOrder: 0, dietaryTags: ["vegetarian", "vegan"] },
          { tenantId: trattoria.id, name: "Calamari Fritti", description: "Crispy fried squid with lemon and aioli", price: 12.0, displayOrder: 1, dietaryTags: [] },
          { tenantId: trattoria.id, name: "Prosciutto e Melone", description: "Parma ham with sweet melon", price: 11.0, displayOrder: 2, dietaryTags: ["gluten-free"] },
        ],
      },
    },
  })

  await prisma.category.create({
    data: {
      tenantId: trattoria.id,
      name: "Pasta",
      slug: "pasta",
      displayOrder: 1,
      items: {
        create: [
          { tenantId: trattoria.id, name: "Spaghetti Carbonara", description: "Guanciale, egg yolk, pecorino, black pepper", price: 14.0, displayOrder: 0, dietaryTags: [] },
          { tenantId: trattoria.id, name: "Pappardelle al Ragù", description: "Slow-cooked beef and pork ragù on fresh pappardelle", price: 15.5, displayOrder: 1, dietaryTags: [] },
          { tenantId: trattoria.id, name: "Gnocchi al Pesto", description: "Potato gnocchi with basil pesto, pine nuts, parmesan", price: 13.0, displayOrder: 2, dietaryTags: ["vegetarian"] },
        ],
      },
    },
  })

  await prisma.category.create({
    data: {
      tenantId: trattoria.id,
      name: "Dolci",
      slug: "dolci",
      displayOrder: 2,
      items: {
        create: [
          { tenantId: trattoria.id, name: "Tiramisù", description: "Classic coffee and mascarpone layered dessert", price: 8.0, displayOrder: 0, dietaryTags: ["vegetarian"] },
          { tenantId: trattoria.id, name: "Panna Cotta", description: "Vanilla panna cotta with berry coulis", price: 7.5, displayOrder: 1, dietaryTags: ["vegetarian", "gluten-free"] },
        ],
      },
    },
  })

  await prisma.category.create({
    data: {
      tenantId: sushiBar.id,
      name: "Appetizers",
      slug: "appetizers",
      displayOrder: 0,
      items: {
        create: [
          { tenantId: sushiBar.id, name: "Edamame", description: "Steamed soy beans with sea salt", price: 5.0, displayOrder: 0, dietaryTags: ["vegetarian", "vegan", "gluten-free"] },
          { tenantId: sushiBar.id, name: "Gyoza", description: "Pan-fried pork dumplings with soy dipping sauce", price: 7.5, displayOrder: 1, dietaryTags: [] },
          { tenantId: sushiBar.id, name: "Miso Soup", description: "Tofu, wakame, green onion in miso broth", price: 4.5, displayOrder: 2, dietaryTags: ["vegetarian", "vegan"] },
        ],
      },
    },
  })

  await prisma.category.create({
    data: {
      tenantId: sushiBar.id,
      name: "Sushi",
      slug: "sushi",
      displayOrder: 1,
      items: {
        create: [
          { tenantId: sushiBar.id, name: "Salmon Nigiri (2 pcs)", description: "Fresh Atlantic salmon on hand-pressed rice", price: 8.0, displayOrder: 0, dietaryTags: ["gluten-free"] },
          { tenantId: sushiBar.id, name: "Dragon Roll (8 pcs)", description: "Shrimp tempura, avocado, eel sauce, sesame", price: 14.0, displayOrder: 1, dietaryTags: [] },
          { tenantId: sushiBar.id, name: "Spicy Tuna Roll (6 pcs)", description: "Fresh tuna, sriracha, cucumber, sesame", price: 11.0, displayOrder: 2, dietaryTags: [] },
        ],
      },
    },
  })

  await prisma.category.create({
    data: {
      tenantId: sushiBar.id,
      name: "Desserts",
      slug: "desserts",
      displayOrder: 2,
      items: {
        create: [
          { tenantId: sushiBar.id, name: "Mochi Ice Cream (3 pcs)", description: "Assorted flavors: matcha, mango, strawberry", price: 6.5, displayOrder: 0, dietaryTags: ["vegetarian", "gluten-free"] },
          { tenantId: sushiBar.id, name: "Matcha Cheesecake", description: "Creamy matcha-infused cheesecake with red bean", price: 7.0, displayOrder: 1, dietaryTags: ["vegetarian"] },
        ],
      },
    },
  })

  console.log("Seeded 2 tenants with 6 categories and 16 menu items")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
