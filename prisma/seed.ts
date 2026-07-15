import 'dotenv/config';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

const categoriesData = [
  { nameAr: 'مشروبات ساخنة', nameEn: 'Hot Drinks', slug: 'hot-drinks', order: 1, descriptionAr: 'مشروباتنا الساخنة الطازجة لبداية يومك', descriptionEn: 'Fresh hot beverages to start your day' },
  { nameAr: 'مشروبات باردة', nameEn: 'Cold Drinks', slug: 'cold-drinks', order: 2, descriptionAr: 'مشروبات باردة منعشة وعصائر طبيعية', descriptionEn: 'Refreshing cold drinks and fresh juices' },
  { nameAr: 'غربي', nameEn: 'Western', slug: 'western', order: 3, descriptionAr: 'أطباق غربية بنكهة عصرية', descriptionEn: 'Modern Western dishes with a twist' },
  { nameAr: 'كريبات', nameEn: 'Crepes', slug: 'crepes', order: 4, descriptionAr: 'كريبات شهية حلوة وم salty', descriptionEn: 'Delicious sweet and savoury crepes' },
  { nameAr: 'شرقي', nameEn: 'Oriental', slug: 'oriental', order: 5, descriptionAr: 'أشهى المأكولات الشرقية والمشاوي', descriptionEn: 'Finest Levantine cuisine and grilled meats' },
  { nameAr: 'مشروبات كحولية', nameEn: 'Alcoholic Drinks', slug: 'alcoholic-drinks', order: 6, descriptionAr: 'مشروبات كحولية متنوعة', descriptionEn: 'Selected alcoholic beverages' },
  { nameAr: 'بيتزا', nameEn: 'Pizza', slug: 'pizza', order: 7, descriptionAr: 'بيتزا طازجة على أصولها', descriptionEn: 'Authentic oven-baked pizzas' },
  { nameAr: 'باريستا', nameEn: 'Barista', slug: 'barista', order: 8, descriptionAr: 'مشروبات باريستا وكوكتيلات مميزة', descriptionEn: 'Speciality barista drinks and cocktails' },
  { nameAr: 'مقبلات باردة', nameEn: 'Cold Appetizers', slug: 'cold-appetizers', order: 9, descriptionAr: 'مقبلات باردة تقليدية بنكهة أصيلة', descriptionEn: 'Traditional cold mezza with authentic flavours' },
  { nameAr: 'مقبلات ساخنة', nameEn: 'Hot Appetizers', slug: 'hot-appetizers', order: 10, descriptionAr: 'مقبلات ساخنة متنوعة', descriptionEn: 'A variety of hot starters' },
  { nameAr: 'سلطات', nameEn: 'Salads', slug: 'salads', order: 11, descriptionAr: 'سلطات طازجة وصحية', descriptionEn: 'Fresh and healthy salads' },
  { nameAr: 'باستا', nameEn: 'Pasta', slug: 'pasta', order: 12, descriptionAr: 'باستا مطهوة بحب', descriptionEn: 'Pasta made with love' },
  { nameAr: 'اراكيل', nameEn: 'Hookah', slug: 'hookah', order: 14, descriptionAr: 'أجود أنواع الأركيلة', descriptionEn: 'Premium hookah selection' },
] as const;

type SeedItem = {
  categoryName: string;
  name: string;
  nameEn: string;
  description: string;
  basePrice: number;
  order: number;
  isAvailable?: boolean;
  variants?: { label: string; labelEn: string; price: number }[];
};

const itemsData: SeedItem[] = [
  // ---- Hot Drinks ----
  { categoryName: 'مشروبات ساخنة', name: 'قهوة', nameEn: 'Coffee', description: '', basePrice: 150, order: 1, variants: [
    { label: 'عادي', labelEn: 'Regular', price: 150 },
    { label: 'دبل', labelEn: 'Double', price: 220 },
    { label: 'ركوة', labelEn: 'Pot', price: 440 },
  ]},
  { categoryName: 'مشروبات ساخنة', name: 'شاي', nameEn: 'Tea', description: '', basePrice: 145, order: 2, variants: [
    { label: 'كأس', labelEn: 'Cup', price: 145 },
    { label: 'مع قرفة', labelEn: 'With Cinnamon', price: 165 },
    { label: 'ابريق', labelEn: 'Pot', price: 330 },
  ]},
  { categoryName: 'مشروبات ساخنة', name: 'زهورات', nameEn: 'Zhourat', description: '', basePrice: 145, order: 3, variants: [
    { label: 'كأس', labelEn: 'Cup', price: 145 },
    { label: 'ابريق', labelEn: 'Pot', price: 330 },
  ]},
  { categoryName: 'مشروبات ساخنة', name: 'كمون و ليمون', nameEn: 'Cumin & Lemon', description: '', basePrice: 145, order: 4 },
  { categoryName: 'مشروبات ساخنة', name: 'هوت شوكليت', nameEn: 'Hot Chocolat', description: '', basePrice: 175, order: 5 },

  // ---- Cold Drinks ----
  { categoryName: 'مشروبات باردة', name: 'مياه معدني', nameEn: 'Water', description: '', basePrice: 135, order: 1 },
  { categoryName: 'مشروبات باردة', name: 'كولا', nameEn: 'Cola', description: '', basePrice: 200, order: 2 },
  { categoryName: 'مشروبات باردة', name: 'سفن اب', nameEn: 'Seven Up', description: '', basePrice: 200, order: 3 },
  { categoryName: 'مشروبات باردة', name: 'سفن غراندين', nameEn: 'Seven Up Grenadine', description: '', basePrice: 200, order: 4 },
  { categoryName: 'مشروبات باردة', name: 'عصير', nameEn: 'Juice', description: '', basePrice: 220, order: 5 },
  { categoryName: 'مشروبات باردة', name: 'عصير فريش', nameEn: 'Fresh Juice', description: '', basePrice: 280, order: 6 },
  { categoryName: 'مشروبات باردة', name: 'عصير برتقال فريش', nameEn: 'Fresh Orange Juice', description: '', basePrice: 280, order: 7 },
  { categoryName: 'مشروبات باردة', name: 'ابريق عصير', nameEn: 'Jar of juice', description: '', basePrice: 400, order: 8 },
  { categoryName: 'مشروبات باردة', name: 'بوظة مشكلة', nameEn: 'Versatile Ice Cream', description: '', basePrice: 385, order: 9 },
  { categoryName: 'مشروبات باردة', name: 'بولو', nameEn: 'Polo', description: '', basePrice: 220, order: 10 },
  { categoryName: 'مشروبات باردة', name: 'ريد بول', nameEn: 'RedBull', description: '', basePrice: 330, order: 11 },
  { categoryName: 'مشروبات باردة', name: 'صودا', nameEn: 'Soda', description: '', basePrice: 280, order: 12 },
  { categoryName: 'مشروبات باردة', name: 'اينرجي', nameEn: 'Energy', description: '', basePrice: 250, order: 13 },

  // ---- Western ----
  { categoryName: 'غربي', name: 'سوبريم', nameEn: 'Supreme', description: '', basePrice: 750, order: 1 },
  { categoryName: 'غربي', name: 'ستروغانوف دجاج', nameEn: 'Chicken Stroganoff', description: '', basePrice: 800, order: 2 },
  { categoryName: 'غربي', name: 'بيف سترغانوف', nameEn: 'Beef Stroganoff', description: '', basePrice: 1200, order: 3 },
  { categoryName: 'غربي', name: 'كريسبي', nameEn: 'Crispy', description: '', basePrice: 165, order: 4 },
  { categoryName: 'غربي', name: 'سبايسي', nameEn: 'Spicy', description: '', basePrice: 750, order: 5 },
  { categoryName: 'غربي', name: 'كرانشي', nameEn: 'Crunchy', description: '', basePrice: 750, order: 6 },
  { categoryName: 'غربي', name: 'كوردون بلو', nameEn: 'Cordon Blu', description: '', basePrice: 800, order: 7 },
  { categoryName: 'غربي', name: 'كوردون بلو جامبو', nameEn: 'Cordon Jumbo', description: '', basePrice: 850, order: 8 },
  { categoryName: 'غربي', name: 'تشيكن الاكيف', nameEn: 'Chicken a la Kiev', description: '', basePrice: 800, order: 9 },
  { categoryName: 'غربي', name: 'فاهيتا دجاج', nameEn: 'Chicken Fahita', description: '', basePrice: 800, order: 10 },
  { categoryName: 'غربي', name: 'فيلاديلفيا', nameEn: 'Philadelphia', description: '', basePrice: 1200, order: 11 },
  { categoryName: 'غربي', name: 'مكسيكانو', nameEn: 'Mexicano', description: '', basePrice: 750, order: 12 },
  { categoryName: 'غربي', name: 'تشكن نغت', nameEn: 'Chicken Nugget', description: '', basePrice: 750, order: 13 },
  { categoryName: 'غربي', name: 'وجبة فالي ستار', nameEn: 'Valley Star Meal', description: '', basePrice: 850, order: 14 },
  { categoryName: 'غربي', name: 'صحن ميكس', nameEn: 'Mix Plate', description: '', basePrice: 2000, order: 15 },
  { categoryName: 'غربي', name: 'سكالوب', nameEn: 'Escalope', description: '', basePrice: 700, order: 16, variants: [
    { label: 'عادي', labelEn: 'Plain', price: 700 },
    { label: 'صوص', labelEn: 'Sauce', price: 800 },
    { label: 'ميلانيز', labelEn: 'Milanaise', price: 750 },
  ]},
  { categoryName: 'غربي', name: 'شرحات دجاج', nameEn: 'Chicken Cutlets', description: '', basePrice: 750, order: 17, variants: [
    { label: 'مقلية', labelEn: 'Fried', price: 750 },
    { label: 'مطفاية', labelEn: 'Sauteed', price: 800 },
  ]},
  { categoryName: 'غربي', name: 'شرحات لحم صوص', nameEn: 'Sauce Beef Cutlets', description: '', basePrice: 1200, order: 18 },
  { categoryName: 'غربي', name: 'تشيكن داينمت', nameEn: 'Chicken Dynamite', description: '', basePrice: 850, order: 19 },
  { categoryName: 'غربي', name: 'ستيك بوافر', nameEn: 'Poivre Steak', description: '', basePrice: 1200, order: 20 },
  { categoryName: 'غربي', name: 'ستيك انتر كوت', nameEn: 'Entercote Steak', description: '', basePrice: 1200, order: 21 },
  { categoryName: 'غربي', name: 'ستيك صوص مشروم', nameEn: 'Mushroom Sauce Steak', description: '', basePrice: 1200, order: 22 },
  { categoryName: 'غربي', name: 'شاورما', nameEn: 'Shawarma', description: '', basePrice: 700, order: 23 },
  { categoryName: 'غربي', name: 'هبرغر جاج', nameEn: 'Chicken Burger', description: '', basePrice: 550, order: 24 },
  { categoryName: 'غربي', name: 'همبرغر لحمة', nameEn: 'Beef Burger', description: '', basePrice: 660, order: 25 },

  // ---- Crepes ----
  { categoryName: 'كريبات', name: 'كريب شوكولا', nameEn: 'Chocolate Crepe', description: '', basePrice: 385, order: 1 },
  { categoryName: 'كريبات', name: 'كريب موز', nameEn: 'Banana Crepe', description: '', basePrice: 490, order: 2 },
  { categoryName: 'كريبات', name: 'كريب فواكه', nameEn: 'Fruit Crepe', description: '', basePrice: 490, order: 3 },
  { categoryName: 'كريبات', name: 'كريب مكسرات', nameEn: 'Nuts Crepe', description: '', basePrice: 550, order: 4 },
  { categoryName: 'كريبات', name: 'كريب بوظة', nameEn: 'Ice Cream Crepe', description: '', basePrice: 550, order: 5 },

  // ---- Oriental ----
  { categoryName: 'شرقي', name: 'معجوقة', nameEn: 'Maajouka', description: '', basePrice: 1700, order: 1 },
  { categoryName: 'شرقي', name: 'فخاد دجاج تندوري', nameEn: 'Tandoori Chicken Thighs', description: '', basePrice: 820, order: 2 },
  { categoryName: 'شرقي', name: 'فروج مشوي', nameEn: 'Grilled Chicken', description: '', basePrice: 1800, order: 3 },
  { categoryName: 'شرقي', name: 'فروج بالصينية', nameEn: 'Grilled Chicken In A Tray', description: '', basePrice: 2600, order: 4 },
  { categoryName: 'شرقي', name: 'طوشكا', nameEn: 'Toshka', description: '', basePrice: 1000, order: 5 },
  { categoryName: 'شرقي', name: 'ماريا', nameEn: 'Maria', description: '', basePrice: 1000, order: 6 },
  { categoryName: 'شرقي', name: 'جبنة كردية', nameEn: 'Kurdish Cheese', description: '', basePrice: 500, order: 7 },
  { categoryName: 'شرقي', name: 'سجق بالعجين', nameEn: 'Sausage in Dough', description: '', basePrice: 1320, order: 8 },
  { categoryName: 'شرقي', name: 'كبة عالسيخ', nameEn: 'Kibbeh On Skewer', description: '', basePrice: 880, order: 9 },
  { categoryName: 'شرقي', name: 'كباب مشوي', nameEn: 'Grilled Kebab', description: '', basePrice: 1040, order: 10, variants: [
    { label: 'وجبة', labelEn: 'Meal', price: 1040 },
    { label: 'نصف كيلو', labelEn: '1/2 Kg', price: 1900 },
    { label: 'كيلو', labelEn: '1 Kg', price: 3700 },
  ]},
  { categoryName: 'شرقي', name: 'كباب ازمرلي', nameEn: 'Kebab Izmirli', description: '', basePrice: 2000, order: 11, variants: [
    { label: 'نصف كيلو', labelEn: '1/2 Kg', price: 2000 },
    { label: 'كيلو', labelEn: '1 Kg', price: 4000 },
  ]},
  { categoryName: 'شرقي', name: 'شقف', nameEn: 'Shekaf', description: '', basePrice: 1050, order: 12, variants: [
    { label: 'وجبة', labelEn: 'Meal', price: 1050 },
    { label: 'نصف كيلو', labelEn: '1/2 Kg', price: 1950 },
    { label: 'كيلو', labelEn: '1 Kg', price: 3900 },
  ]},
  { categoryName: 'شرقي', name: 'مشاوي مشكل', nameEn: 'Mixed Grills', description: '', basePrice: 990, order: 13, variants: [
    { label: 'وجبة', labelEn: 'Meal', price: 990 },
    { label: 'نصف كيلو', labelEn: '1/2 Kg', price: 1650 },
    { label: 'كيلو', labelEn: '1 Kg', price: 3300 },
  ]},
  { categoryName: 'شرقي', name: 'شيش طاووق', nameEn: 'Shish Tawook', description: '', basePrice: 700, order: 14, variants: [
    { label: 'وجبة', labelEn: 'Meal', price: 700 },
    { label: 'نصف كيلو', labelEn: '1/2 Kg', price: 850 },
    { label: 'كيلو', labelEn: '1 Kg', price: 1700 },
  ]},
  { categoryName: 'شرقي', name: 'شيش طاووق بالفخار', nameEn: 'Shish Tawook in Pot', description: '', basePrice: 850, order: 15, variants: [
    { label: 'وجبة', labelEn: 'Meal', price: 850 },
    { label: 'نصف كيلو', labelEn: '1/2 Kg', price: 950 },
    { label: 'كيلو', labelEn: '1 Kg', price: 1900 },
  ]},
  { categoryName: 'شرقي', name: 'كافتا مع خضار بالصينية', nameEn: 'Kofta With Veggies', description: '', basePrice: 4000, order: 16 },
  { categoryName: 'شرقي', name: 'كافتا مع طحينة بالصينية', nameEn: 'Kofta With Tahini', description: '', basePrice: 4600, order: 17 },
  { categoryName: 'شرقي', name: 'صحن ارز', nameEn: 'Rice Plate', description: '', basePrice: 440, order: 18 },
  { categoryName: 'شرقي', name: 'جوانح', nameEn: 'Wings', description: '', basePrice: 600, order: 19, variants: [
    { label: 'نصف كيلو', labelEn: '1/2 Kg', price: 600 },
    { label: 'كيلو', labelEn: '1 Kg', price: 1200 },
  ]},
  { categoryName: 'شرقي', name: 'وجبة كباب خشخاش', nameEn: 'Kebab Kheshkhash Meal', description: '', basePrice: 3800, order: 20 },

  // ---- Alcoholic Drinks ----
  { categoryName: 'مشروبات كحولية', name: 'بيرة المازا', nameEn: 'Almaza Beer', description: '', basePrice: 500, order: 1 },
  { categoryName: 'مشروبات كحولية', name: 'بيرة بيروت', nameEn: 'Beirut Beer', description: '', basePrice: 420, order: 2 },
  { categoryName: 'مشروبات كحولية', name: 'بيرة كورونا', nameEn: 'Corona Beer', description: '', basePrice: 600, order: 3 },
  { categoryName: 'مشروبات كحولية', name: 'بيرة المازا مكسيكي', nameEn: 'Mexican Almaza Beer', description: '', basePrice: 550, order: 4 },
  { categoryName: 'مشروبات كحولية', name: 'بيرة بيروت مكسيكي', nameEn: 'Mexican Beirut Beer', description: '', basePrice: 450, order: 5 },
  { categoryName: 'مشروبات كحولية', name: 'بيرة كورونا مكسيكي', nameEn: 'Mexican Corona Beer', description: '', basePrice: 630, order: 6 },
  { categoryName: 'مشروبات كحولية', name: 'عرق', nameEn: 'Arak', description: '', basePrice: 130, order: 7, variants: [
    { label: 'كأس', labelEn: 'Glass', price: 130 },
    { label: 'ربعية', labelEn: '1/4 Liter', price: 275 },
    { label: 'نصية', labelEn: '1/2 Liter', price: 550 },
    { label: 'ليتر', labelEn: '1 Liter', price: 1100 },
    { label: 'سوداية', labelEn: 'Soudaya', price: 770 },
  ]},
  { categoryName: 'مشروبات كحولية', name: 'فودكا', nameEn: 'Vodka', description: '', basePrice: 330, order: 8, variants: [
    { label: 'كأس', labelEn: 'Glass', price: 330 },
    { label: 'مع عصير', labelEn: 'With Juice', price: 330 },
    { label: 'مع اينرجي', labelEn: 'With Energy', price: 420 },
    { label: 'مع ريد بول', labelEn: 'With Redbull', price: 500 },
    { label: 'مع سفن و ليمون', labelEn: 'With Seven & Lemon', price: 390 },
  ]},
  { categoryName: 'مشروبات كحولية', name: 'ويسكي', nameEn: 'Whiskey', description: '', basePrice: 440, order: 9, variants: [
    { label: 'ريد', labelEn: 'Red', price: 440 },
    { label: 'بلاك', labelEn: 'Black', price: 550 },
    { label: 'شيفاز', labelEn: 'Chivas', price: 850 },
  ]},
  { categoryName: 'مشروبات كحولية', name: 'نبيذ', nameEn: 'Wine', description: '', basePrice: 220, order: 10, variants: [
    { label: 'كأس', labelEn: 'Glass', price: 220 },
    { label: 'ليتر سلاف', labelEn: 'Liter Solaf', price: 1200 },
    { label: 'ليتر كفريا', labelEn: 'Liter Kifryah', price: 830 },
    { label: 'ليتر', labelEn: 'Liter', price: 2600 },
  ]},
  { categoryName: 'مشروبات كحولية', name: 'جمايكا كحول', nameEn: 'Alcoholic Jamaica', description: '', basePrice: 350, order: 11 },
  { categoryName: 'مشروبات كحولية', name: 'كوكتيل كحولي', nameEn: 'Alcoholic Cocktail', description: '', basePrice: 385, order: 12 },
  { categoryName: 'مشروبات كحولية', name: 'تاكيلا', nameEn: 'Tequila', description: '', basePrice: 275, order: 13 },

  // ---- Pizza ----
  { categoryName: 'بيتزا', name: 'بيتزا فالي ستار', nameEn: 'Valley Star Pizza', description: '', basePrice: 1100, order: 1 },
  { categoryName: 'بيتزا', name: 'بيتزا سجق', nameEn: 'Sausage Pizza', description: '', basePrice: 940, order: 2 },
  { categoryName: 'بيتزا', name: 'بيتزا مارغريتا', nameEn: 'Margerita Pizza', description: '', basePrice: 770, order: 3 },
  { categoryName: 'بيتزا', name: 'بيتزا الفصول الأربعة', nameEn: 'Four Seasons Pizza', description: '', basePrice: 880, order: 4 },
  { categoryName: 'بيتزا', name: 'بيتزا سلامة', nameEn: 'Salami Pizza', description: '', basePrice: 940, order: 5 },
  { categoryName: 'بيتزا', name: 'بيتزا فطر', nameEn: 'Mushroom Pizza', description: '', basePrice: 830, order: 6 },
  { categoryName: 'بيتزا', name: 'بيتزا بيبيروني', nameEn: 'Pepperoni Pizza', description: '', basePrice: 990, order: 7 },
  { categoryName: 'بيتزا', name: 'بيتزا خضار', nameEn: 'Veggies Pizza', description: '', basePrice: 880, order: 8 },
  { categoryName: 'بيتزا', name: 'بيتزا طلياني', nameEn: 'Mortadella Pizza', description: '', basePrice: 940, order: 9 },
  { categoryName: 'بيتزا', name: 'بيتزا طلياني و خضار', nameEn: 'Mortadella Pizza With Veggies', description: '', basePrice: 990, order: 10 },
  { categoryName: 'بيتزا', name: 'بيتزا لحومات', nameEn: 'Meats Pizza', description: '', basePrice: 1050, order: 11 },
  { categoryName: 'بيتزا', name: 'بيتزا لحومات و خضار', nameEn: 'Meats Pizza With Veggies', description: '', basePrice: 1040, order: 12 },

  // ---- Barista ----
  { categoryName: 'باريستا', name: 'كابوتشينو', nameEn: 'Cappuccino', description: '', basePrice: 165, order: 1 },
  { categoryName: 'باريستا', name: 'ميلو', nameEn: 'Milo', description: '', basePrice: 165, order: 2 },
  { categoryName: 'باريستا', name: 'ميلو بحليب', nameEn: 'Milo With Milk', description: '', basePrice: 220, order: 3 },
  { categoryName: 'باريستا', name: 'نسكافيه 3 ب1', nameEn: 'Nescafe 3 in 1', description: '', basePrice: 165, order: 4 },
  { categoryName: 'باريستا', name: 'نسكافيه بالحليب', nameEn: 'Nescafe With Milk', description: '', basePrice: 220, order: 5 },
  { categoryName: 'باريستا', name: 'نسكافيه بلاك', nameEn: 'Nescafe Black', description: '', basePrice: 120, order: 6 },
  { categoryName: 'باريستا', name: 'جمايكا بدون كحول', nameEn: 'Virgin Jamaica', description: '', basePrice: 300, order: 7 },
  { categoryName: 'باريستا', name: 'ايس كافيه', nameEn: 'Ice Coffee', description: '', basePrice: 190, order: 8 },
  { categoryName: 'باريستا', name: 'ايس تي', nameEn: 'Ice Tea', description: '', basePrice: 180, order: 9 },
  { categoryName: 'باريستا', name: 'كوكتيل حليب و شوكولا', nameEn: 'Milk & Chocolate Cocktail', description: '', basePrice: 385, order: 10 },
  { categoryName: 'باريستا', name: 'كوكتيل حليب و فريز', nameEn: 'Milk & Strawberry Cocktail', description: '', basePrice: 385, order: 11 },
  { categoryName: 'باريستا', name: 'كوكتيل حليب و موز', nameEn: 'Milk & Banana Cocktail', description: '', basePrice: 385, order: 12 },
  { categoryName: 'باريستا', name: 'كوكتيل فواكه', nameEn: 'Fruit Cocktail', description: '', basePrice: 440, order: 13 },
  { categoryName: 'باريستا', name: 'ميلك شيك شوكولا', nameEn: 'Chocolate Milkshake', description: '', basePrice: 385, order: 14 },
  { categoryName: 'باريستا', name: 'ميلك شيك فانيليا', nameEn: 'Vanilla Milkshake', description: '', basePrice: 385, order: 15 },
  { categoryName: 'باريستا', name: 'ميلك شيك فريز', nameEn: 'Strawberry Milkshake', description: '', basePrice: 385, order: 16 },

  // ---- Cold Appetizers ----
  { categoryName: 'مقبلات باردة', name: 'سوركة مع زبدة', nameEn: 'Soorka With Butter', description: '', basePrice: 440, order: 1 },
  { categoryName: 'مقبلات باردة', name: 'كشكة مع جوز', nameEn: 'Kishka With Walnuts', description: '', basePrice: 385, order: 2 },
  { categoryName: 'مقبلات باردة', name: 'حمص', nameEn: 'Hummus', description: '', basePrice: 270, order: 3 },
  { categoryName: 'مقبلات باردة', name: 'حمص بيروتي', nameEn: 'Hummus Beiruti', description: '', basePrice: 295, order: 4 },
  { categoryName: 'مقبلات باردة', name: 'حمص باللحمة', nameEn: 'Hummus With Meat', description: '', basePrice: 600, order: 5 },
  { categoryName: 'مقبلات باردة', name: 'متبل', nameEn: 'Mutabbal', description: '', basePrice: 275, order: 6 },
  { categoryName: 'مقبلات باردة', name: 'متبل بالشوندر', nameEn: 'Mutabbal With Beetroot', description: '', basePrice: 295, order: 7 },
  { categoryName: 'مقبلات باردة', name: 'محمرة', nameEn: 'Muhammara', description: '', basePrice: 275, order: 8 },
  { categoryName: 'مقبلات باردة', name: 'سوركة', nameEn: 'Soorka', description: '', basePrice: 385, order: 9 },
  { categoryName: 'مقبلات باردة', name: 'يالنجي', nameEn: 'Yalangi', description: '', basePrice: 275, order: 10 },
  { categoryName: 'مقبلات باردة', name: 'مايونيز', nameEn: 'Mayonnaise', description: '', basePrice: 275, order: 11 },
  { categoryName: 'مقبلات باردة', name: 'كريم ثوم', nameEn: 'Garlic Cream', description: '', basePrice: 275, order: 12 },
  { categoryName: 'مقبلات باردة', name: 'لبنة', nameEn: 'Labneh', description: '', basePrice: 275, order: 13 },
  { categoryName: 'مقبلات باردة', name: 'لبنة متومة', nameEn: 'Labneh With Garlic', description: '', basePrice: 330, order: 14 },
  { categoryName: 'مقبلات باردة', name: 'لبنة مع خيار', nameEn: 'Labneh With Cucumber', description: '', basePrice: 330, order: 15 },
  { categoryName: 'مقبلات باردة', name: 'صحن بسطرما', nameEn: 'Pastrami Plate', description: '', basePrice: 770, order: 16 },
  { categoryName: 'مقبلات باردة', name: 'كبة نية', nameEn: 'Kibbeh Nayeh', description: '', basePrice: 880, order: 17 },
  { categoryName: 'مقبلات باردة', name: 'كبة نية مخضرة', nameEn: 'Kibbeh Nayeh With Veggies', description: '', basePrice: 930, order: 18 },
  { categoryName: 'مقبلات باردة', name: 'هبرة نية', nameEn: 'Habra Nayeh', description: '', basePrice: 880, order: 19 },
  { categoryName: 'مقبلات باردة', name: 'دجاج طرطور', nameEn: 'Chicken With Tarator', description: '', basePrice: 440, order: 20 },
  { categoryName: 'مقبلات باردة', name: 'طرطور', nameEn: 'Tarator', description: '', basePrice: 220, order: 21 },
  { categoryName: 'مقبلات باردة', name: 'بابا غنوج', nameEn: 'Baba Ghannouj', description: '', basePrice: 330, order: 22 },
  { categoryName: 'مقبلات باردة', name: 'مرتديلا حلبي', nameEn: 'Mortadella Halabi', description: '', basePrice: 440, order: 23 },
  { categoryName: 'مقبلات باردة', name: 'جبنة فيتا', nameEn: 'Feta Cheese', description: '', basePrice: 385, order: 24 },
  { categoryName: 'مقبلات باردة', name: 'سيت مقبلات', nameEn: 'Appetizers Set', description: '', basePrice: 390, order: 25 },
  { categoryName: 'مقبلات باردة', name: 'دبس فليفلة', nameEn: 'Chili Sauce', description: '', basePrice: 200, order: 26 },
  { categoryName: 'مقبلات باردة', name: 'صحن طلياني', nameEn: 'Mortadella Plate', description: '', basePrice: 550, order: 27 },
  { categoryName: 'مقبلات باردة', name: 'دبس رمان', nameEn: 'Pomegranate Molasses', description: '', basePrice: 110, order: 28 },
  { categoryName: 'مقبلات باردة', name: 'صحن اجبان', nameEn: 'Cheese Plate', description: '', basePrice: 990, order: 29 },
  { categoryName: 'مقبلات باردة', name: 'كبيس', nameEn: 'Pickles', description: '', basePrice: 110, order: 30 },
  { categoryName: 'مقبلات باردة', name: 'صحن اجبان و لحومات', nameEn: 'Cheese & Meat Plate', description: '', basePrice: 1320, order: 31 },
  { categoryName: 'مقبلات باردة', name: 'جاط اجبان و لحومات', nameEn: 'Cheese & Meat Bowl', description: '', basePrice: 2200, order: 32 },

  // ---- Hot Appetizers ----
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا بروفنسال', nameEn: 'Provencal Potato', description: '', basePrice: 440, order: 1 },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا ويدجز', nameEn: 'Potato Wedges', description: '', basePrice: 330, order: 2 },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا حارة', nameEn: 'Spicy Potato', description: '', basePrice: 330, order: 3 },
  { categoryName: 'مقبلات ساخنة', name: 'برك جبنة', nameEn: 'Cheese Borek', description: '', basePrice: 80, order: 4 },
  { categoryName: 'مقبلات ساخنة', name: 'كبة صاجية', nameEn: 'Kibbeh Sajieh', description: '', basePrice: 330, order: 5 },
  { categoryName: 'مقبلات ساخنة', name: 'سجق رول', nameEn: 'Sausage Roll', description: '', basePrice: 120, order: 6 },
  { categoryName: 'مقبلات ساخنة', name: 'خبز بالثوم', nameEn: 'Garlic Bread', description: '', basePrice: 90, order: 7 },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا مطفاية', nameEn: 'Sauteed Potato', description: '', basePrice: 360, order: 8 },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا مقلية', nameEn: 'Fries', description: '', basePrice: 275, order: 9 },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا مشوية و جبنة', nameEn: 'Grilled Potato With Cheese', description: '', basePrice: 360, order: 10 },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا مشوية', nameEn: 'Grilled Potato', description: '', basePrice: 300, order: 11 },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا بشاميل', nameEn: 'Potato With Bechamel', description: '', basePrice: 385, order: 12 },
  { categoryName: 'مقبلات ساخنة', name: 'نقانق', nameEn: 'Sausage', description: '', basePrice: 820, order: 13 },
  { categoryName: 'مقبلات ساخنة', name: 'جوانح مشوية', nameEn: 'Grilled Wings', description: '', basePrice: 350, order: 14 },
  { categoryName: 'مقبلات ساخنة', name: 'مفركة بالفطر', nameEn: 'Mushroom Mufarake', description: '', basePrice: 880, order: 15 },
  { categoryName: 'مقبلات ساخنة', name: 'باذنجان مشوي', nameEn: 'Grilled Eggplant', description: '', basePrice: 330, order: 16 },
  { categoryName: 'مقبلات ساخنة', name: 'كبة حميص', nameEn: 'Kibbeh Hamis', description: '', basePrice: 130, order: 17 },
  { categoryName: 'مقبلات ساخنة', name: 'جبنة مقلي - مشوي', nameEn: 'Cheese Fried - Grilled', description: '', basePrice: 390, order: 18 },
  { categoryName: 'مقبلات ساخنة', name: 'موزاريلا بانيه', nameEn: 'Paneed Mozzarella', description: '', basePrice: 120, order: 19 },
  { categoryName: 'مقبلات ساخنة', name: 'جوانح بروفنسال', nameEn: 'Provencal Wings', description: '', basePrice: 400, order: 20 },
  { categoryName: 'مقبلات ساخنة', name: 'كبدة دجاج', nameEn: 'Chicken Liver', description: '', basePrice: 450, order: 21 },
  { categoryName: 'مقبلات ساخنة', name: 'سبرينغ رول', nameEn: 'Spring Rolls', description: '', basePrice: 165, order: 22 },
  { categoryName: 'مقبلات ساخنة', name: 'جوانح صوص بافلو', nameEn: 'Buffalo Sauce Wings', description: '', basePrice: 550, order: 23 },
  { categoryName: 'مقبلات ساخنة', name: 'شوربة', nameEn: 'Soup', description: '', basePrice: 275, order: 24 },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا بوت', nameEn: 'Potato Boats', description: '', basePrice: 385, order: 25 },

  // ---- Salads ----
  { categoryName: 'سلطات', name: 'سلطة باذنجان عراقية', nameEn: 'Iraqi Eggplant Salad', description: '', basePrice: 490, order: 1 },
  { categoryName: 'سلطات', name: 'سلطة فليفلة', nameEn: 'Pepper Salad', description: '', basePrice: 330, order: 2 },
  { categoryName: 'سلطات', name: 'سلطة دجاج', nameEn: 'Chicken Salad', description: '', basePrice: 660, order: 3 },
  { categoryName: 'سلطات', name: 'فتوش', nameEn: 'Fattoush', description: '', basePrice: 480, order: 4 },
  { categoryName: 'سلطات', name: 'سلطة شرقية', nameEn: 'Eastern Salad', description: '', basePrice: 440, order: 5 },
  { categoryName: 'سلطات', name: 'سلطة شرقية مقشرة', nameEn: 'Peeled Eastern Salad', description: '', basePrice: 470, order: 6 },
  { categoryName: 'سلطات', name: 'سلطة أرمنية', nameEn: 'Armenian Salad', description: '', basePrice: 440, order: 7 },
  { categoryName: 'سلطات', name: 'سلطة فرنسية', nameEn: 'French Salad', description: '', basePrice: 3500, order: 8 },
  { categoryName: 'سلطات', name: 'سلطة زعتر', nameEn: 'Thyme Salad', description: '', basePrice: 490, order: 9 },
  { categoryName: 'سلطات', name: 'سلطة سيزر', nameEn: 'Caesar Salad', description: '', basePrice: 600, order: 10 },
  { categoryName: 'سلطات', name: 'سلطة شوندر', nameEn: 'Beetroot Salad', description: '', basePrice: 385, order: 11 },
  { categoryName: 'سلطات', name: 'سلطة جرجير', nameEn: 'Arugula Salad', description: '', basePrice: 385, order: 12 },
  { categoryName: 'سلطات', name: 'سلطة فطر', nameEn: 'Mushroom Salad', description: '', basePrice: 490, order: 13 },
  { categoryName: 'سلطات', name: 'سلطة زيتون', nameEn: 'Olive Salad', description: '', basePrice: 385, order: 14 },
  { categoryName: 'سلطات', name: 'سلطة بقلة', nameEn: 'Purslane Salad', description: '', basePrice: 385, order: 15 },
  { categoryName: 'سلطات', name: 'سلطة خرشوف', nameEn: 'Artichoke Salad', description: '', basePrice: 600, order: 16 },
  { categoryName: 'سلطات', name: 'سلطة تونا', nameEn: 'Tuna Salad', description: '', basePrice: 660, order: 17 },
  { categoryName: 'سلطات', name: 'فتوش و جبنة', nameEn: 'Fattoush & Cheese Plate', description: '', basePrice: 520, order: 18 },
  { categoryName: 'سلطات', name: 'سلطة يونانية', nameEn: 'Greek Salad', description: '', basePrice: 550, order: 19 },
  { categoryName: 'سلطات', name: 'سلطة روكفورد', nameEn: 'Roquefort Salad', description: '', basePrice: 720, order: 20 },
  { categoryName: 'سلطات', name: 'سلطة ملفوف', nameEn: 'Coleslaw Salad', description: '', basePrice: 420, order: 21 },
  { categoryName: 'سلطات', name: 'سلطة جرجير و فطر', nameEn: 'Arugula & Mushroom Salad', description: '', basePrice: 490, order: 22 },
  { categoryName: 'سلطات', name: 'سلطة ذرة', nameEn: 'Corn Salad', description: '', basePrice: 440, order: 23 },
  { categoryName: 'سلطات', name: 'سلطة باستا', nameEn: 'Pasta Salad', description: '', basePrice: 550, order: 24 },
  { categoryName: 'سلطات', name: 'سلطة مكسيكية', nameEn: 'Mexican Salad', description: '', basePrice: 770, order: 25 },
  { categoryName: 'سلطات', name: 'تبولة', nameEn: 'Tabouli', description: '', basePrice: 470, order: 26 },
  { categoryName: 'سلطات', name: 'سلطة ملفوف', nameEn: 'Cabbage Salad', description: '', basePrice: 385, order: 27 },

  // ---- Pasta ----
  { categoryName: 'باستا', name: 'باستا صوص أبيض', nameEn: 'White Sauce Pasta', description: '', basePrice: 440, order: 1 },
  { categoryName: 'باستا', name: 'باستا صوص أحمر', nameEn: 'Red Sauce Pasta', description: '', basePrice: 440, order: 2 },
  { categoryName: 'باستا', name: 'باستا بيني أراتبياتا', nameEn: 'Penne Arrabbiata Pasta', description: '', basePrice: 550, order: 3 },
  { categoryName: 'باستا', name: 'باستا دجاج', nameEn: 'Chicken Pasta', description: '', basePrice: 550, order: 4 },
  { categoryName: 'باستا', name: 'باستا لحم', nameEn: 'Beef Pasta', description: '', basePrice: 820, order: 5 },
  { categoryName: 'باستا', name: 'فيتوتشيني', nameEn: 'Fettuccine', description: '', basePrice: 700, order: 6 },

  // ---- Hookah ----
  { categoryName: 'اراكيل', name: 'اركيلة', nameEn: 'Shisha', description: '', basePrice: 300, order: 1, variants: [
    { label: 'عادي', labelEn: 'Regular', price: 300 },
    { label: 'اضافي', labelEn: 'Extra', price: 450 },
    { label: 'خرطوم معقم', labelEn: 'Sterile Hose', price: 100 },
  ]},
];

async function main() {
  console.log('Clearing existing data...');
  await prisma.menuItemTranslation.deleteMany();
  await prisma.menuItemVariant.deleteMany();
  await prisma.categoryTranslation.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tenant.deleteMany();

  console.log('Creating Valley Star tenant...');
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Valley Star',
      slug: 'valley-star',
      primaryColor: '#2E3B42',
      secondaryColor: '#6B7052',
      accentColor: '#B98F4E',
      backgroundColor: '#F6F3ED',
      surfaceColor: '#FFFFFF',
      textColor: '#2E3B42',
      textMuted: '#8A8578',
      headingFont: "'Playfair Display', 'Amiri', Georgia, serif",
      bodyFont: "'Jost', 'Noto Kufi Arabic', system-ui, sans-serif",
      borderRadiusSm: '6px',
      borderRadiusMd: '10px',
      borderRadiusLg: '12px',
      shadow: 'none',
      cardStyle: 'bordered',
      menuLayout: 'auto-fit',
      spacing: 'comfortable',
      description: 'Levantine & Western fusion',
      address: '',
      phone: '',
      instagram: '',
      defaultLocale: 'ar',
      availableLocales: ['ar', 'en'],
    },
  });

  console.log('Creating categories and items...');
  const categoryMap = new Map<string, { id: string }>();

  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: {
        tenantId: tenant.id,
        name: cat.nameAr,
        slug: cat.slug,
        description: cat.descriptionAr,
        displayOrder: cat.order,
      },
    });
    categoryMap.set(cat.nameAr, { id: created.id });
  }

  const categoryTranslationData: { categoryId: string; locale: string; name: string; description: string | null }[] = [];
  for (const cat of categoriesData) {
    const entry = categoryMap.get(cat.nameAr)!;
    categoryTranslationData.push({ categoryId: entry.id, locale: 'en', name: cat.nameEn, description: cat.descriptionEn });
    categoryTranslationData.push({ categoryId: entry.id, locale: 'ar', name: cat.nameAr, description: cat.descriptionAr });
  }
  await prisma.categoryTranslation.createMany({ data: categoryTranslationData });

  const itemTranslationData: { menuItemId: string; locale: string; name: string; description: string | null }[] = [];

  for (const item of itemsData) {
    const catEntry = categoryMap.get(item.categoryName);
    if (!catEntry) {
      console.warn(`Category "${item.categoryName}" not found for item "${item.name}"`);
      continue;
    }

    const created = await prisma.menuItem.create({
      data: {
        tenantId: tenant.id,
        categoryId: catEntry.id,
        name: item.name,
        basePrice: item.variants ? null : item.basePrice,
        displayOrder: item.order,
        isAvailable: item.isAvailable ?? true,
        dietaryTags: [],
        ...(item.variants
          ? {
              variants: {
                create: item.variants.map((v, i) => ({
                  label: v.label,
                  price: v.price,
                  sortOrder: i,
                })),
              },
            }
          : {}),
      },
    });

    // Arabic translation (name is already Arabic)
    itemTranslationData.push({ menuItemId: created.id, locale: 'ar', name: item.name, description: '' });
    // English translation
    const enName = item.variants
      ? item.nameEn
      : item.nameEn;
    itemTranslationData.push({ menuItemId: created.id, locale: 'en', name: enName, description: '' });
  }

  await prisma.menuItemTranslation.createMany({ data: itemTranslationData });

  const totalItems = itemsData.length;
  const totalVariants = itemsData.reduce((sum, i) => sum + (i.variants?.length ?? 0), 0);
  console.log(`Seeded 1 tenant, ${categoriesData.length} categories, ${totalItems} items, ${totalVariants} variants`);

  console.log('Creating super admin...');
  const existing = await prisma.user.findUnique({ where: { email: 'admin@valleystar.com' } });
  if (!existing) {
    const hashedPassword = await bcrypt.hash('admin123456', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'admin@valleystar.com',
        emailVerified: true,
        role: 'SUPER_ADMIN',
      },
    });
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: 'email',
        password: hashedPassword,
      },
    });
    console.log('Created super admin: admin@valleystar.com / admin123456');
  } else {
    console.log('Super admin already exists — skipping');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
