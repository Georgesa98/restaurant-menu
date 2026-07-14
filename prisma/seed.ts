import 'dotenv/config';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

const categoriesData = [
  { nameAr: 'مشروبات ساخنة', nameEn: 'Hot Drinks', slug: 'hot-drinks', order: 1 },
  { nameAr: 'مشروبات باردة', nameEn: 'Cold Drinks', slug: 'cold-drinks', order: 2 },
  { nameAr: 'غربي', nameEn: 'Western', slug: 'western', order: 3 },
  { nameAr: 'كريبات', nameEn: 'Crepes', slug: 'crepes', order: 4 },
  { nameAr: 'شرقي', nameEn: 'Oriental', slug: 'oriental', order: 5 },
  { nameAr: 'مشروبات كحولية', nameEn: 'Alcoholic Drinks', slug: 'alcoholic-drinks', order: 6 },
  { nameAr: 'بيتزا', nameEn: 'Pizza', slug: 'pizza', order: 7 },
  { nameAr: 'باريستا', nameEn: 'Barista', slug: 'barista', order: 8 },
  { nameAr: 'مقبلات باردة', nameEn: 'Cold Appetizers', slug: 'cold-appetizers', order: 9 },
  { nameAr: 'مقبلات ساخنة', nameEn: 'Hot Appetizers', slug: 'hot-appetizers', order: 10 },
  { nameAr: 'سلطات', nameEn: 'Salads', slug: 'salads', order: 11 },
  { nameAr: 'باستا', nameEn: 'Pasta', slug: 'pasta', order: 12 },
  { nameAr: 'اراكيل', nameEn: 'Hookah', slug: 'hookah', order: 14 },
] as const;

type SeedItem = {
  categoryName: string;
  name: string;
  nameEn: string;
  description: string;
  consumerPrice: number;
  financialPrice: number;
  order: number;
  isAvailable: boolean;
};

const itemsData: SeedItem[] = [
  { categoryName: 'مشروبات ساخنة', name: 'قهوة', nameEn: 'Coffee', description: '', consumerPrice: 150, financialPrice: 150, order: 1, isAvailable: true },
  { categoryName: 'مشروبات ساخنة', name: 'قهوة دبل', nameEn: 'Coffee double', description: '', consumerPrice: 220, financialPrice: 220, order: 2, isAvailable: true },
  { categoryName: 'مشروبات ساخنة', name: 'ركوة قهوة', nameEn: 'Coffee pot', description: '', consumerPrice: 440, financialPrice: 440, order: 3, isAvailable: true },
  { categoryName: 'مشروبات ساخنة', name: 'شاي', nameEn: 'Tea', description: '', consumerPrice: 145, financialPrice: 145, order: 4, isAvailable: true },
  { categoryName: 'مشروبات ساخنة', name: 'شاي مع قرفة', nameEn: 'Tea with cinnamon', description: '', consumerPrice: 165, financialPrice: 165, order: 5, isAvailable: true },
  { categoryName: 'مشروبات ساخنة', name: 'ابريق شاي', nameEn: 'Tea pot', description: '', consumerPrice: 330, financialPrice: 330, order: 6, isAvailable: true },
  { categoryName: 'مشروبات ساخنة', name: 'زهورات', nameEn: 'Zhourat', description: '', consumerPrice: 145, financialPrice: 145, order: 7, isAvailable: true },
  { categoryName: 'مشروبات ساخنة', name: 'ابريق زهورات', nameEn: 'Zhourat pot', description: '', consumerPrice: 330, financialPrice: 330, order: 8, isAvailable: true },
  { categoryName: 'مشروبات ساخنة', name: 'كمون و ليمون', nameEn: 'Cumin & Lemon', description: '', consumerPrice: 145, financialPrice: 145, order: 9, isAvailable: true },
  { categoryName: 'مشروبات ساخنة', name: 'هوت شوكليت', nameEn: 'Hot Chocolat', description: '', consumerPrice: 175, financialPrice: 175, order: 10, isAvailable: true },
  { categoryName: 'مشروبات باردة', name: 'مياه معدني', nameEn: 'Water', description: '', consumerPrice: 135, financialPrice: 135, order: 1, isAvailable: true },
  { categoryName: 'مشروبات باردة', name: 'كولا', nameEn: 'Cola', description: '', consumerPrice: 200, financialPrice: 200, order: 2, isAvailable: true },
  { categoryName: 'مشروبات باردة', name: 'سفن اب', nameEn: 'Seven Up', description: '', consumerPrice: 200, financialPrice: 200, order: 3, isAvailable: true },
  { categoryName: 'مشروبات باردة', name: 'سفن غراندين', nameEn: 'Seven Up Grenadine', description: '', consumerPrice: 200, financialPrice: 200, order: 4, isAvailable: true },
  { categoryName: 'مشروبات باردة', name: 'عصير', nameEn: 'Juice', description: '', consumerPrice: 220, financialPrice: 220, order: 5, isAvailable: true },
  { categoryName: 'مشروبات باردة', name: 'عصير فريش', nameEn: 'Fresh Juice', description: '', consumerPrice: 280, financialPrice: 280, order: 6, isAvailable: true },
  { categoryName: 'مشروبات باردة', name: 'عصير برتقال فريش', nameEn: 'Fresh Orange Juice', description: '', consumerPrice: 280, financialPrice: 280, order: 7, isAvailable: true },
  { categoryName: 'مشروبات باردة', name: 'ابريق عصير', nameEn: 'Jar of juice', description: '', consumerPrice: 400, financialPrice: 400, order: 8, isAvailable: true },
  { categoryName: 'مشروبات باردة', name: 'بوظة مشكلة', nameEn: 'Versatile Ice Cream', description: '', consumerPrice: 385, financialPrice: 385, order: 9, isAvailable: true },
  { categoryName: 'مشروبات باردة', name: 'بولو', nameEn: 'Polo', description: '', consumerPrice: 220, financialPrice: 220, order: 10, isAvailable: true },
  { categoryName: 'مشروبات باردة', name: 'ريد بول', nameEn: 'RedBull', description: '', consumerPrice: 330, financialPrice: 330, order: 11, isAvailable: true },
  { categoryName: 'مشروبات باردة', name: 'صودا', nameEn: 'Soda', description: '', consumerPrice: 280, financialPrice: 280, order: 12, isAvailable: true },
  { categoryName: 'مشروبات باردة', name: 'اينرجي', nameEn: 'Energy', description: '', consumerPrice: 250, financialPrice: 250, order: 13, isAvailable: true },
  { categoryName: 'غربي', name: 'سوبريم', nameEn: 'Supreme', description: '', consumerPrice: 750, financialPrice: 750, order: 1, isAvailable: true },
  { categoryName: 'غربي', name: 'ستروغانوف دجاج', nameEn: 'Chicken Stroganoff', description: '', consumerPrice: 800, financialPrice: 800, order: 2, isAvailable: true },
  { categoryName: 'غربي', name: 'بيف سترغانوف', nameEn: 'Beef Stroganoff', description: '', consumerPrice: 1200, financialPrice: 1200, order: 3, isAvailable: true },
  { categoryName: 'غربي', name: 'كريسبي', nameEn: 'Crispy', description: '', consumerPrice: 165, financialPrice: 165, order: 4, isAvailable: true },
  { categoryName: 'غربي', name: 'سبايسي', nameEn: 'Spicy', description: '', consumerPrice: 750, financialPrice: 750, order: 5, isAvailable: true },
  { categoryName: 'غربي', name: 'كرانشي', nameEn: 'Crunchy', description: '', consumerPrice: 750, financialPrice: 750, order: 6, isAvailable: true },
  { categoryName: 'غربي', name: 'كوردون بلو', nameEn: 'Cordon Blu', description: '', consumerPrice: 800, financialPrice: 800, order: 7, isAvailable: true },
  { categoryName: 'غربي', name: 'كوردون بلو جامبو', nameEn: 'Cordon Jumbo', description: '', consumerPrice: 850, financialPrice: 850, order: 8, isAvailable: true },
  { categoryName: 'غربي', name: 'تشيكن الاكيف', nameEn: 'Chicken a la Kiev', description: '', consumerPrice: 800, financialPrice: 800, order: 9, isAvailable: true },
  { categoryName: 'غربي', name: 'فاهيتا دجاج', nameEn: 'Chicken Fahita', description: '', consumerPrice: 800, financialPrice: 800, order: 10, isAvailable: true },
  { categoryName: 'غربي', name: 'فيلاديلفيا', nameEn: 'Philadelphia', description: '', consumerPrice: 1200, financialPrice: 1200, order: 11, isAvailable: true },
  { categoryName: 'غربي', name: 'مكسيكانو', nameEn: 'Mexicano', description: '', consumerPrice: 750, financialPrice: 750, order: 12, isAvailable: true },
  { categoryName: 'غربي', name: 'تشكن نغت', nameEn: 'Chicken Nugget', description: '', consumerPrice: 750, financialPrice: 750, order: 13, isAvailable: true },
  { categoryName: 'غربي', name: 'وجبة فالي ستار', nameEn: 'Valley Star Meal', description: '', consumerPrice: 850, financialPrice: 850, order: 14, isAvailable: true },
  { categoryName: 'غربي', name: 'صحن ميكس', nameEn: 'Mix Plate', description: '', consumerPrice: 2000, financialPrice: 2000, order: 15, isAvailable: true },
  { categoryName: 'غربي', name: 'سكالوب', nameEn: 'Escalope', description: '', consumerPrice: 700, financialPrice: 700, order: 16, isAvailable: true },
  { categoryName: 'غربي', name: 'سكالوب صوص', nameEn: 'Escalope Sauce', description: '', consumerPrice: 800, financialPrice: 800, order: 17, isAvailable: true },
  { categoryName: 'غربي', name: 'سكالوب مينانيز', nameEn: 'Escalope Milanaise', description: '', consumerPrice: 750, financialPrice: 750, order: 18, isAvailable: true },
  { categoryName: 'غربي', name: 'شرحات دجاج', nameEn: 'Chicken Cutlets', description: '', consumerPrice: 750, financialPrice: 750, order: 19, isAvailable: true },
  { categoryName: 'غربي', name: 'شرحات دجاج مطفاية', nameEn: 'Sauteed Chicken Cutlets', description: '', consumerPrice: 800, financialPrice: 800, order: 20, isAvailable: true },
  { categoryName: 'غربي', name: 'شرحات لحم صوص', nameEn: 'Sauce Beef Cutlets', description: '', consumerPrice: 1200, financialPrice: 1200, order: 21, isAvailable: true },
  { categoryName: 'غربي', name: 'تشيكن داينمت', nameEn: 'Chicken Dynamite', description: '', consumerPrice: 850, financialPrice: 850, order: 22, isAvailable: true },
  { categoryName: 'غربي', name: 'ستيك بوافر', nameEn: 'Poivre Steak', description: '', consumerPrice: 1200, financialPrice: 1200, order: 23, isAvailable: true },
  { categoryName: 'غربي', name: 'ستيك انتر كوت', nameEn: 'Entercote Steak', description: '', consumerPrice: 1200, financialPrice: 1200, order: 24, isAvailable: true },
  { categoryName: 'غربي', name: 'ستيك صوص مشروم', nameEn: 'Mushroom Sauce Steak', description: '', consumerPrice: 1200, financialPrice: 1200, order: 25, isAvailable: true },
  { categoryName: 'غربي', name: 'شاورما', nameEn: 'Shawarma', description: '', consumerPrice: 700, financialPrice: 700, order: 26, isAvailable: true },
  { categoryName: 'غربي', name: 'هبرغر جاج', nameEn: 'Chicken Burger', description: '', consumerPrice: 550, financialPrice: 550, order: 27, isAvailable: true },
  { categoryName: 'غربي', name: 'همبرغر لحمة', nameEn: 'Beef Burger', description: '', consumerPrice: 660, financialPrice: 660, order: 28, isAvailable: true },
  { categoryName: 'كريبات', name: 'كريب شوكولا', nameEn: 'Chocolate Crepe', description: '', consumerPrice: 385, financialPrice: 385, order: 1, isAvailable: true },
  { categoryName: 'كريبات', name: 'كريب موز', nameEn: 'Banana Crepe', description: '', consumerPrice: 490, financialPrice: 490, order: 2, isAvailable: true },
  { categoryName: 'كريبات', name: 'كريب فواكه', nameEn: 'Fruit Crepe', description: '', consumerPrice: 490, financialPrice: 490, order: 3, isAvailable: true },
  { categoryName: 'كريبات', name: 'كريب مكسرات', nameEn: 'Nuts Crepe', description: '', consumerPrice: 550, financialPrice: 550, order: 4, isAvailable: true },
  { categoryName: 'كريبات', name: 'كريب بوظة', nameEn: 'Ice Cream Crepe', description: '', consumerPrice: 550, financialPrice: 550, order: 5, isAvailable: true },
  { categoryName: 'شرقي', name: 'معجوقة', nameEn: 'Maajouka', description: '', consumerPrice: 1700, financialPrice: 1700, order: 1, isAvailable: true },
  { categoryName: 'شرقي', name: 'فخاد دجاج تندوري', nameEn: 'Tandoori Chicken Thighs', description: '', consumerPrice: 820, financialPrice: 820, order: 2, isAvailable: true },
  { categoryName: 'شرقي', name: 'فروج مشوي', nameEn: 'Grilled Chicken', description: '', consumerPrice: 1800, financialPrice: 1800, order: 3, isAvailable: true },
  { categoryName: 'شرقي', name: 'فروج بالصينية', nameEn: 'Grilled Chicken In A Tray', description: '', consumerPrice: 2600, financialPrice: 2600, order: 4, isAvailable: true },
  { categoryName: 'شرقي', name: 'طوشكا', nameEn: 'Toshka', description: '', consumerPrice: 1000, financialPrice: 1000, order: 5, isAvailable: true },
  { categoryName: 'شرقي', name: 'ماريا', nameEn: 'Maria', description: '', consumerPrice: 1000, financialPrice: 1000, order: 6, isAvailable: true },
  { categoryName: 'شرقي', name: 'جبنة كردية', nameEn: 'Kurdish Cheese', description: '', consumerPrice: 500, financialPrice: 500, order: 7, isAvailable: true },
  { categoryName: 'شرقي', name: 'سجق بالعجين', nameEn: 'Sausage in Dough', description: '', consumerPrice: 1320, financialPrice: 1320, order: 8, isAvailable: true },
  { categoryName: 'شرقي', name: 'كبة عالسيخ', nameEn: 'Kibbeh On Skewer', description: '', consumerPrice: 880, financialPrice: 880, order: 9, isAvailable: true },
  { categoryName: 'شرقي', name: 'كباب مشوي', nameEn: 'Grilled Kebab', description: '', consumerPrice: 3700, financialPrice: 3700, order: 10, isAvailable: true },
  { categoryName: 'شرقي', name: 'كباب مشوي نصف كيلو', nameEn: 'Grilled Kebab 1/2Kg', description: '', consumerPrice: 1900, financialPrice: 1900, order: 11, isAvailable: true },
  { categoryName: 'شرقي', name: 'وجبة كباب مشوي', nameEn: 'Grilled Kebab Meal', description: '', consumerPrice: 1040, financialPrice: 1040, order: 12, isAvailable: true },
  { categoryName: 'شرقي', name: 'كباب ازمرلي', nameEn: 'Kebab Izmirli', description: '', consumerPrice: 4000, financialPrice: 4000, order: 13, isAvailable: true },
  { categoryName: 'شرقي', name: 'كباب ازمرلي نصف كيلو', nameEn: 'Kebab Izmirli 1/2Kg', description: '', consumerPrice: 2000, financialPrice: 2000, order: 14, isAvailable: true },
  { categoryName: 'شرقي', name: 'وجبة كباب خشخاش', nameEn: 'Kebab Kheshkhash Meal', description: '', consumerPrice: 3800, financialPrice: 3800, order: 15, isAvailable: true },
  { categoryName: 'شرقي', name: 'كيلو شقف', nameEn: 'Shekaf 1Kg', description: '', consumerPrice: 3900, financialPrice: 3900, order: 16, isAvailable: true },
  { categoryName: 'شرقي', name: 'نصف كيلو شقف', nameEn: 'Shekaf 1/2Kg', description: '', consumerPrice: 1950, financialPrice: 1950, order: 17, isAvailable: true },
  { categoryName: 'شرقي', name: 'وجبة شقف', nameEn: 'Shekaf Meal', description: '', consumerPrice: 1050, financialPrice: 1050, order: 18, isAvailable: true },
  { categoryName: 'شرقي', name: 'كيلو مشاوي مشكل', nameEn: 'Varied Grills 1Kg', description: '', consumerPrice: 3300, financialPrice: 3300, order: 19, isAvailable: true },
  { categoryName: 'شرقي', name: 'نصف كيلو مشاوي مشكل', nameEn: 'Varied Grills 1/2Kg', description: '', consumerPrice: 1650, financialPrice: 1650, order: 20, isAvailable: true },
  { categoryName: 'شرقي', name: 'وجبة مشاوي مشكل', nameEn: 'Varied Grills Meal', description: '', consumerPrice: 990, financialPrice: 990, order: 21, isAvailable: true },
  { categoryName: 'شرقي', name: 'كيلو شيش طاووق', nameEn: 'Shish Tawook 1Kg', description: '', consumerPrice: 1700, financialPrice: 1700, order: 22, isAvailable: true },
  { categoryName: 'شرقي', name: 'نصف كيلو شيش طاووق', nameEn: 'Shish Tawook 1/2Kg', description: '', consumerPrice: 850, financialPrice: 850, order: 23, isAvailable: true },
  { categoryName: 'شرقي', name: 'وجبة شيش طاووق', nameEn: 'Shish Tawook Meal', description: '', consumerPrice: 700, financialPrice: 700, order: 24, isAvailable: true },
  { categoryName: 'شرقي', name: 'وجبة شيش بالفخار', nameEn: 'Shish Tawook Meal in Pot', description: '', consumerPrice: 850, financialPrice: 850, order: 25, isAvailable: true },
  { categoryName: 'شرقي', name: 'كيلو شيش بالفخار', nameEn: 'Shish Tawook Meal 1Kg in Pot', description: '', consumerPrice: 1900, financialPrice: 1900, order: 26, isAvailable: true },
  { categoryName: 'شرقي', name: 'نصف كيلو شيش بالفخار', nameEn: 'Shish Tawook Meal 1/2Kg in Pot', description: '', consumerPrice: 950, financialPrice: 950, order: 27, isAvailable: true },
  { categoryName: 'شرقي', name: 'كافتا مع خضار بالصينية', nameEn: 'Kofta With Veggies In a Tray', description: '', consumerPrice: 4000, financialPrice: 4000, order: 28, isAvailable: true },
  { categoryName: 'شرقي', name: 'كافتا مع طحينة بالصينية', nameEn: 'Kofta With Tahini in a Tray', description: '', consumerPrice: 4600, financialPrice: 4600, order: 29, isAvailable: true },
  { categoryName: 'شرقي', name: 'صحن ارز', nameEn: 'Rice Plate', description: '', consumerPrice: 440, financialPrice: 440, order: 30, isAvailable: true },
  { categoryName: 'شرقي', name: 'كيلو جوانح', nameEn: 'Wings 1Kg', description: '', consumerPrice: 1200, financialPrice: 1200, order: 31, isAvailable: true },
  { categoryName: 'شرقي', name: 'نصف كيلو جوانح', nameEn: 'Wings 1/2Kg', description: '', consumerPrice: 600, financialPrice: 600, order: 32, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'بيرة المازا', nameEn: 'Almaza Beer', description: '', consumerPrice: 500, financialPrice: 500, order: 1, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'بيرة بيروت', nameEn: 'Beirut Beer', description: '', consumerPrice: 420, financialPrice: 420, order: 2, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'بيرة كورونا', nameEn: 'Corona Beer', description: '', consumerPrice: 600, financialPrice: 600, order: 3, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'بيرة المازا مكسيكي', nameEn: 'Mexican Almaza Beer', description: '', consumerPrice: 550, financialPrice: 550, order: 4, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'بيرة بيروت مكسيكي', nameEn: 'Mexican Beirut Beer', description: '', consumerPrice: 450, financialPrice: 450, order: 5, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'بيرة كورونا مكسيكي', nameEn: 'Mexican Corona Beer', description: '', consumerPrice: 630, financialPrice: 630, order: 6, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'ربعية عرق', nameEn: 'Arak 1/4 liter', description: '', consumerPrice: 275, financialPrice: 275, order: 7, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'نصية عرق', nameEn: 'Arak 1/2 liter', description: '', consumerPrice: 550, financialPrice: 550, order: 8, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'ليتر عرق', nameEn: 'Arak 1 liter', description: '', consumerPrice: 1100, financialPrice: 1100, order: 9, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'سوداية عرق', nameEn: 'Arak Soudaya', description: '', consumerPrice: 770, financialPrice: 770, order: 10, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'كأس عرق', nameEn: 'Arak Glass', description: '', consumerPrice: 130, financialPrice: 130, order: 11, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'كأس فودكا', nameEn: 'Vodka Glass', description: '', consumerPrice: 330, financialPrice: 330, order: 12, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'كأس فودكا عصير', nameEn: 'Vodka Glass With Juice', description: '', consumerPrice: 330, financialPrice: 330, order: 13, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'كأس فودكا اينرجي', nameEn: 'Vodka Glass With Energy', description: '', consumerPrice: 420, financialPrice: 420, order: 14, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'كأس فودكا ريد بول', nameEn: 'Vodka Glass With Redbull', description: '', consumerPrice: 500, financialPrice: 500, order: 15, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'كأس فودكا سفن و ليمون', nameEn: 'Vodka Glass With Seven & Lemon', description: '', consumerPrice: 390, financialPrice: 390, order: 16, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'كأس ويسكي ريد', nameEn: 'Whiskey Glass Red', description: '', consumerPrice: 440, financialPrice: 440, order: 17, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'كأس ويسكي بلاك', nameEn: 'Whiskey Glass Black', description: '', consumerPrice: 550, financialPrice: 550, order: 18, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'كأس ويسكي شيفاز', nameEn: 'Whiskey Glass Chivas', description: '', consumerPrice: 850, financialPrice: 850, order: 19, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'ليتر نبيذ', nameEn: 'Wine Liter', description: '', consumerPrice: 2600, financialPrice: 2600, order: 20, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'كأس نبيذ', nameEn: 'Wine Glass', description: '', consumerPrice: 220, financialPrice: 220, order: 21, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'ليتر نبيذ سلاف', nameEn: 'Wine Liter Solaf', description: '', consumerPrice: 1200, financialPrice: 1200, order: 22, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'ليتر نبيذ كفريا', nameEn: 'Wine Liter Kifryah', description: '', consumerPrice: 830, financialPrice: 830, order: 23, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'جمايكا كحول', nameEn: 'Alcoholic Jamaica', description: '', consumerPrice: 350, financialPrice: 350, order: 24, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'كوكتيل كحولي', nameEn: 'Alcoholic Cocktail', description: '', consumerPrice: 385, financialPrice: 385, order: 25, isAvailable: true },
  { categoryName: 'مشروبات كحولية', name: 'كأس تاكيلا', nameEn: 'Tequila Glass', description: '', consumerPrice: 275, financialPrice: 275, order: 26, isAvailable: true },
  { categoryName: 'بيتزا', name: 'بيتزا فالي ستار', nameEn: 'Valley Star Pizza', description: '', consumerPrice: 1100, financialPrice: 1100, order: 1, isAvailable: true },
  { categoryName: 'بيتزا', name: 'بيتزا سجق', nameEn: 'Sausage Pizza', description: '', consumerPrice: 940, financialPrice: 940, order: 2, isAvailable: true },
  { categoryName: 'بيتزا', name: 'بيتزا مارغريتا', nameEn: 'Margerita Pizza', description: '', consumerPrice: 770, financialPrice: 770, order: 3, isAvailable: true },
  { categoryName: 'بيتزا', name: 'بيتزا الفصول الأربعة', nameEn: 'Four Seasons Pizza', description: '', consumerPrice: 880, financialPrice: 880, order: 4, isAvailable: true },
  { categoryName: 'بيتزا', name: 'بيتزا سلامة', nameEn: 'Salami Pizza', description: '', consumerPrice: 940, financialPrice: 940, order: 5, isAvailable: true },
  { categoryName: 'بيتزا', name: 'بيتزا فطر', nameEn: 'Mushroom Pizza', description: '', consumerPrice: 830, financialPrice: 830, order: 6, isAvailable: true },
  { categoryName: 'بيتزا', name: 'بيتزا بيبيروني', nameEn: 'Pepperoni Pizza', description: '', consumerPrice: 990, financialPrice: 990, order: 7, isAvailable: true },
  { categoryName: 'بيتزا', name: 'بيتزا خضار', nameEn: 'Veggies Pizza', description: '', consumerPrice: 880, financialPrice: 880, order: 8, isAvailable: true },
  { categoryName: 'بيتزا', name: 'بيتزا طلياني', nameEn: 'Mortadella Pizza', description: '', consumerPrice: 940, financialPrice: 940, order: 9, isAvailable: true },
  { categoryName: 'بيتزا', name: 'بيتزا طلياني و خضار', nameEn: 'Mortadella Pizza With Veggies', description: '', consumerPrice: 990, financialPrice: 990, order: 10, isAvailable: true },
  { categoryName: 'بيتزا', name: 'بيتزا لحومات', nameEn: 'Meats Pizza', description: '', consumerPrice: 1050, financialPrice: 1050, order: 11, isAvailable: true },
  { categoryName: 'بيتزا', name: 'بيتزا لحومات و خضار', nameEn: 'Meats Pizza With Veggies', description: '', consumerPrice: 1040, financialPrice: 1040, order: 12, isAvailable: true },
  { categoryName: 'باريستا', name: 'كابوتشينو', nameEn: 'Cappuccino', description: '', consumerPrice: 165, financialPrice: 165, order: 1, isAvailable: true },
  { categoryName: 'باريستا', name: 'ميلو', nameEn: 'Milo', description: '', consumerPrice: 165, financialPrice: 165, order: 2, isAvailable: true },
  { categoryName: 'باريستا', name: 'ميلو بحليب', nameEn: 'Milo With Milk', description: '', consumerPrice: 220, financialPrice: 220, order: 3, isAvailable: true },
  { categoryName: 'باريستا', name: 'نسكافيه 3 ب1', nameEn: 'Nescafe 3 in 1', description: '', consumerPrice: 165, financialPrice: 165, order: 4, isAvailable: true },
  { categoryName: 'باريستا', name: 'نسكافيه بالحليب', nameEn: 'Nescafe With Milk', description: '', consumerPrice: 220, financialPrice: 220, order: 5, isAvailable: true },
  { categoryName: 'باريستا', name: 'نسكافيه بلاك', nameEn: 'Nescafe Black', description: '', consumerPrice: 120, financialPrice: 120, order: 6, isAvailable: true },
  { categoryName: 'باريستا', name: 'جمايكا بدون كحول', nameEn: 'Virgin Jamaica', description: '', consumerPrice: 300, financialPrice: 300, order: 7, isAvailable: true },
  { categoryName: 'باريستا', name: 'ايس كافيه', nameEn: 'Ice Coffee', description: '', consumerPrice: 190, financialPrice: 190, order: 8, isAvailable: true },
  { categoryName: 'باريستا', name: 'ايس تي', nameEn: 'Ice Tea', description: '', consumerPrice: 180, financialPrice: 180, order: 9, isAvailable: true },
  { categoryName: 'باريستا', name: 'كوكتيل حليب و شوكولا', nameEn: 'Milk & Chocolate Cocktail', description: '', consumerPrice: 385, financialPrice: 385, order: 10, isAvailable: true },
  { categoryName: 'باريستا', name: 'كوكتيل حليب و فريز', nameEn: 'Milk & Strawberry Cocktail', description: '', consumerPrice: 385, financialPrice: 385, order: 11, isAvailable: true },
  { categoryName: 'باريستا', name: 'كوكتيل حليب و موز', nameEn: 'Milk & Banana Cocktail', description: '', consumerPrice: 385, financialPrice: 385, order: 12, isAvailable: true },
  { categoryName: 'باريستا', name: 'كوكتيل فواكه', nameEn: 'Fruit Cocktail', description: '', consumerPrice: 440, financialPrice: 440, order: 13, isAvailable: true },
  { categoryName: 'باريستا', name: 'ميلك شيك شوكولا', nameEn: 'Chocolate Milkshake', description: '', consumerPrice: 385, financialPrice: 385, order: 14, isAvailable: true },
  { categoryName: 'باريستا', name: 'ميلك شيك فانيليا', nameEn: 'Vanilla Milkshake', description: '', consumerPrice: 385, financialPrice: 385, order: 15, isAvailable: true },
  { categoryName: 'باريستا', name: 'ميلك شيك فريز', nameEn: 'Strawberry Milkshake', description: '', consumerPrice: 385, financialPrice: 385, order: 16, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'سوركة مع زبدة', nameEn: 'Soorka With Butter', description: '', consumerPrice: 440, financialPrice: 440, order: 1, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'كشكة مع جوز', nameEn: 'Kishka With Walnuts', description: '', consumerPrice: 385, financialPrice: 385, order: 2, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'حمص', nameEn: 'Hummus', description: '', consumerPrice: 270, financialPrice: 270, order: 3, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'حمص بيروتي', nameEn: 'Hummus Beiruti', description: '', consumerPrice: 295, financialPrice: 295, order: 4, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'حمص باللحمة', nameEn: 'Hummus With Meat', description: '', consumerPrice: 600, financialPrice: 600, order: 5, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'متبل', nameEn: 'Mutabbal', description: '', consumerPrice: 275, financialPrice: 275, order: 6, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'متبل بالشوندر', nameEn: 'Mutabbal With Beetroot', description: '', consumerPrice: 295, financialPrice: 295, order: 7, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'محمرة', nameEn: 'Muhammara', description: '', consumerPrice: 275, financialPrice: 275, order: 8, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'سوركة', nameEn: 'Soorka', description: '', consumerPrice: 385, financialPrice: 385, order: 9, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'يالنجي', nameEn: 'Yalangi', description: '', consumerPrice: 275, financialPrice: 275, order: 10, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'مايونيز', nameEn: 'Mayonnaise', description: '', consumerPrice: 275, financialPrice: 275, order: 11, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'كريم ثوم', nameEn: 'Garlic Cream', description: '', consumerPrice: 275, financialPrice: 275, order: 12, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'لبنة', nameEn: 'Labneh', description: '', consumerPrice: 275, financialPrice: 275, order: 13, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'لبنة متومة', nameEn: 'Labneh With Garlic', description: '', consumerPrice: 330, financialPrice: 330, order: 14, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'لبنة مع خيار', nameEn: 'Labneh With Cucumber', description: '', consumerPrice: 330, financialPrice: 330, order: 15, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'صحن بسطرما', nameEn: 'Pastrami Plate', description: '', consumerPrice: 770, financialPrice: 770, order: 16, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'كبة نية', nameEn: 'Kibbeh Nayeh', description: '', consumerPrice: 880, financialPrice: 880, order: 17, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'كبة نية مخضرة', nameEn: 'Kibbeh Nayeh With Veggies', description: '', consumerPrice: 930, financialPrice: 930, order: 18, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'هبرة نية', nameEn: 'Habra Nayeh', description: '', consumerPrice: 880, financialPrice: 880, order: 19, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'دجاج طرطور', nameEn: 'Chicken With Tarator', description: '', consumerPrice: 440, financialPrice: 440, order: 20, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'طرطور', nameEn: 'Tarator', description: '', consumerPrice: 220, financialPrice: 220, order: 21, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'بابا غنوج', nameEn: 'Baba Ghannouj', description: '', consumerPrice: 330, financialPrice: 330, order: 22, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'مرتديلا حلبي', nameEn: 'Mortadella Halabi', description: '', consumerPrice: 440, financialPrice: 440, order: 23, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'جبنة فيتا', nameEn: 'Feta Cheese', description: '', consumerPrice: 385, financialPrice: 385, order: 24, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'سيت مقبلات', nameEn: 'Appetizers Set', description: '', consumerPrice: 390, financialPrice: 390, order: 25, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'دبس فليفلة', nameEn: 'Chili Sauce', description: '', consumerPrice: 200, financialPrice: 200, order: 26, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'صحن طلياني', nameEn: 'Mortadella Plate', description: '', consumerPrice: 550, financialPrice: 550, order: 27, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'دبس رمان', nameEn: 'Pomegranate Molasses', description: '', consumerPrice: 110, financialPrice: 110, order: 28, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'صحن اجبان', nameEn: 'Cheese Plate', description: '', consumerPrice: 990, financialPrice: 990, order: 29, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'كبيس', nameEn: 'Pickles', description: '', consumerPrice: 110, financialPrice: 110, order: 30, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'صحن اجبان و لحومات', nameEn: 'Cheese & Meat Plate', description: '', consumerPrice: 1320, financialPrice: 1320, order: 31, isAvailable: true },
  { categoryName: 'مقبلات باردة', name: 'جاط اجبان و لحومات', nameEn: 'Cheese & Meat Bowl', description: '', consumerPrice: 2200, financialPrice: 2200, order: 32, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا بروفنسال', nameEn: 'Provencal Potato', description: '', consumerPrice: 440, financialPrice: 440, order: 1, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا ويدجز', nameEn: 'Potato Wedges', description: '', consumerPrice: 330, financialPrice: 330, order: 2, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا حارة', nameEn: 'Spicy Potato', description: '', consumerPrice: 330, financialPrice: 330, order: 3, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'برك جبنة', nameEn: 'Cheese Borek', description: '', consumerPrice: 80, financialPrice: 80, order: 4, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'كبة صاجية', nameEn: 'Kibbeh Sajieh', description: '', consumerPrice: 330, financialPrice: 330, order: 5, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'سجق رول', nameEn: 'Sausage Roll', description: '', consumerPrice: 120, financialPrice: 120, order: 6, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'خبز بالثوم', nameEn: 'Garlic Bread', description: '', consumerPrice: 90, financialPrice: 90, order: 7, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا مطفاية', nameEn: 'Sauteed Potato', description: '', consumerPrice: 360, financialPrice: 360, order: 8, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا مقلية', nameEn: 'Fries', description: '', consumerPrice: 275, financialPrice: 275, order: 9, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا مشوية و جبنة', nameEn: 'Grilled Potato With Cheese', description: '', consumerPrice: 360, financialPrice: 360, order: 10, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا مشوية', nameEn: 'Grilled Potato', description: '', consumerPrice: 300, financialPrice: 300, order: 11, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا بشاميل', nameEn: 'Potato With Bechamel', description: '', consumerPrice: 385, financialPrice: 385, order: 12, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'نقانق', nameEn: 'Sausage', description: '', consumerPrice: 820, financialPrice: 820, order: 13, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'جوانح مشوية', nameEn: 'Grilled Wings', description: '', consumerPrice: 350, financialPrice: 350, order: 14, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'مفركة بالفطر', nameEn: 'Mushroom Mufarake', description: '', consumerPrice: 880, financialPrice: 880, order: 15, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'باذنجان مشوي', nameEn: 'Grilled Eggplant', description: '', consumerPrice: 330, financialPrice: 330, order: 16, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'كبة حميص', nameEn: 'Kibbeh Hamis', description: '', consumerPrice: 130, financialPrice: 130, order: 17, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'جبنة مقلي - مشوي', nameEn: 'Cheese Fried - Grilled', description: '', consumerPrice: 390, financialPrice: 390, order: 18, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'موزاريلا بانيه', nameEn: 'Paneed Mozzarella', description: '', consumerPrice: 120, financialPrice: 120, order: 19, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'جوانح بروفنسال', nameEn: 'Provencal Wings', description: '', consumerPrice: 400, financialPrice: 400, order: 20, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'كبدة دجاج', nameEn: 'Chicken Liver', description: '', consumerPrice: 450, financialPrice: 450, order: 21, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'سبرينغ رول', nameEn: 'Spring Rolls', description: '', consumerPrice: 165, financialPrice: 165, order: 22, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'جوانح صوص بافلو', nameEn: 'Buffalo Sauce Wings', description: '', consumerPrice: 550, financialPrice: 550, order: 23, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'شوربة', nameEn: 'Soup', description: '', consumerPrice: 275, financialPrice: 275, order: 24, isAvailable: true },
  { categoryName: 'مقبلات ساخنة', name: 'بطاطا بوت', nameEn: 'Potato Boats', description: '', consumerPrice: 385, financialPrice: 385, order: 25, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة باذنجان عراقية', nameEn: 'Iraqi Eggplant Salad', description: '', consumerPrice: 490, financialPrice: 490, order: 1, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة فليفلة', nameEn: 'Pepper Salad', description: '', consumerPrice: 330, financialPrice: 330, order: 2, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة دجاج', nameEn: 'Chicken Salad', description: '', consumerPrice: 660, financialPrice: 660, order: 3, isAvailable: true },
  { categoryName: 'سلطات', name: 'فتوش', nameEn: 'Fattoush', description: '', consumerPrice: 480, financialPrice: 480, order: 4, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة شرقية', nameEn: 'Eastern Salad', description: '', consumerPrice: 440, financialPrice: 440, order: 5, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة شرقية مقشرة', nameEn: 'Peeled Eastern Salad', description: '', consumerPrice: 470, financialPrice: 470, order: 6, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة أرمنية', nameEn: 'Armenian Salad', description: '', consumerPrice: 440, financialPrice: 440, order: 7, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة فرنسية', nameEn: 'French Salad', description: '', consumerPrice: 3500, financialPrice: 3500, order: 8, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة زعتر', nameEn: 'Thyme Salad', description: '', consumerPrice: 490, financialPrice: 490, order: 9, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة سيزر', nameEn: 'Caesar Salad', description: '', consumerPrice: 600, financialPrice: 600, order: 10, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة شوندر', nameEn: 'Beetroot Salad', description: '', consumerPrice: 385, financialPrice: 385, order: 11, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة جرجير', nameEn: 'Arugula Salad', description: '', consumerPrice: 385, financialPrice: 385, order: 12, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة فطر', nameEn: 'Mushroom Salad', description: '', consumerPrice: 490, financialPrice: 490, order: 13, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة زيتون', nameEn: 'Olive Salad', description: '', consumerPrice: 385, financialPrice: 385, order: 14, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة بقلة', nameEn: 'Purslane Salad', description: '', consumerPrice: 385, financialPrice: 385, order: 15, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة خرشوف', nameEn: 'Artichoke Salad', description: '', consumerPrice: 600, financialPrice: 600, order: 16, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة تونا', nameEn: 'Tuna Salad', description: '', consumerPrice: 660, financialPrice: 660, order: 17, isAvailable: true },
  { categoryName: 'سلطات', name: 'فتوش و جبنة', nameEn: 'Fattoush & Cheese Plate', description: '', consumerPrice: 520, financialPrice: 520, order: 18, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة يونانية', nameEn: 'Greek Salad', description: '', consumerPrice: 550, financialPrice: 550, order: 19, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة روكفورد', nameEn: 'Roquefort Salad', description: '', consumerPrice: 720, financialPrice: 720, order: 20, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة ملفوف', nameEn: 'Coleslaw Salad', description: '', consumerPrice: 420, financialPrice: 420, order: 21, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة جرجير و فطر', nameEn: 'Arugula & Mushroom Salad', description: '', consumerPrice: 490, financialPrice: 490, order: 22, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة ذرة', nameEn: 'Corn Salad', description: '', consumerPrice: 440, financialPrice: 440, order: 23, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة باستا', nameEn: 'Pasta Salad', description: '', consumerPrice: 550, financialPrice: 550, order: 24, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة مكسيكية', nameEn: 'Mexican Salad', description: '', consumerPrice: 770, financialPrice: 770, order: 25, isAvailable: true },
  { categoryName: 'سلطات', name: 'تبولة', nameEn: 'Tabouli', description: '', consumerPrice: 470, financialPrice: 470, order: 26, isAvailable: true },
  { categoryName: 'سلطات', name: 'سلطة ملفوف', nameEn: 'Cabbage Salad', description: '', consumerPrice: 385, financialPrice: 385, order: 27, isAvailable: true },
  { categoryName: 'باستا', name: 'باستا صوص أبيض', nameEn: 'White Sauce Pasta', description: '', consumerPrice: 440, financialPrice: 440, order: 1, isAvailable: true },
  { categoryName: 'باستا', name: 'باستا صوص أحمر', nameEn: 'Red Sauce Pasta', description: '', consumerPrice: 440, financialPrice: 440, order: 2, isAvailable: true },
  { categoryName: 'باستا', name: 'باستا بيني أراتبياتا', nameEn: 'Penne Arrabbiata Pasta', description: '', consumerPrice: 550, financialPrice: 550, order: 3, isAvailable: true },
  { categoryName: 'باستا', name: 'باستا دجاج', nameEn: 'Chicken Pasta', description: '', consumerPrice: 550, financialPrice: 550, order: 4, isAvailable: true },
  { categoryName: 'باستا', name: 'باستا لحم', nameEn: 'Beef Pasta', description: '', consumerPrice: 820, financialPrice: 820, order: 5, isAvailable: true },
  { categoryName: 'باستا', name: 'فيتوتشيني', nameEn: 'Fettuccine', description: '', consumerPrice: 700, financialPrice: 700, order: 6, isAvailable: true },
  { categoryName: 'اراكيل', name: 'اركيلة', nameEn: 'Shisha', description: '', consumerPrice: 300, financialPrice: 300, order: 1, isAvailable: true },
  { categoryName: 'اراكيل', name: 'اركيلة اضافي', nameEn: 'Shisha Extra', description: '', consumerPrice: 450, financialPrice: 450, order: 2, isAvailable: true },
  { categoryName: 'اراكيل', name: 'خرطوم معقم', nameEn: 'Sterilized Hose', description: '', consumerPrice: 100, financialPrice: 100, order: 3, isAvailable: true },
];

async function main() {
  console.log('Clearing existing data...');
  await prisma.menuItemTranslation.deleteMany();
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
  const categoryMap = new Map<string, { id: string; items: { id: string; name: string }[] }>();

  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: {
        tenantId: tenant.id,
        name: cat.nameAr,
        slug: cat.slug,
        displayOrder: cat.order,
      },
    });
    categoryMap.set(cat.nameAr, { id: created.id, items: [] });
  }

  const categoryTranslationData: { categoryId: string; locale: string; name: string; description: string | null }[] = [];
  for (const cat of categoriesData) {
    const entry = categoryMap.get(cat.nameAr)!;
    categoryTranslationData.push({ categoryId: entry.id, locale: 'en', name: cat.nameEn, description: '' });
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
        price: item.consumerPrice,
        financialPrice: item.financialPrice,
        displayOrder: item.order,
        isAvailable: item.isAvailable,
        dietaryTags: [],
      },
    });

    itemTranslationData.push({ menuItemId: created.id, locale: 'en', name: item.nameEn, description: '' });
    catEntry.items.push({ id: created.id, name: created.name });
  }

  await prisma.menuItemTranslation.createMany({ data: itemTranslationData });

  const totalItems = itemsData.length;
  console.log(`Seeded 1 tenant, ${categoriesData.length} categories, ${totalItems} items`);

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
