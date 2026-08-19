import { db } from "@/db";
import { categories, brands, products, banners, settings, shippingFees, paymentMethods, users, sellers } from "@/db/schema";
import { CATEGORIES, SUDANESE_STATES, generateSlug } from "./utils";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  // Check if already seeded
  const existingCats = await db.select().from(categories).limit(1);
  if (existingCats.length > 0) return;

  // Seed settings
  await db.insert(settings).values([
    { key: "exchange_rate_usd", value: "550", description: "USD to SDG exchange rate" },
    { key: "exchange_rate_sar", value: "147", description: "SAR to SDG exchange rate" },
    { key: "site_name", value: "سوق الجملة", description: "Site name" },
    { key: "min_wholesale_qty", value: "10", description: "Minimum wholesale quantity" },
    { key: "free_shipping_threshold", value: "50000", description: "Free shipping threshold in SDG" },
  ]).onConflictDoNothing();

  // Seed categories
  const insertedCats = await db.insert(categories).values(
    CATEGORIES.map((c, i) => ({ ...c, sortOrder: i }))
  ).returning();

  // Seed brands
  const brandData = [
    { nameAr: "نايك", nameEn: "Nike" },
    { nameAr: "أديداس", nameEn: "Adidas" },
    { nameAr: "زارا", nameEn: "Zara" },
    { nameAr: "إتش آند إم", nameEn: "H&M" },
    { nameAr: "بوما", nameEn: "Puma" },
    { nameAr: "ليفايز", nameEn: "Levi's" },
    { nameAr: "غوتشي", nameEn: "Gucci" },
    { nameAr: "كالفن كلاين", nameEn: "Calvin Klein" },
    { nameAr: "سامسونج", nameEn: "Samsung" },
    { nameAr: "محلي سوداني", nameEn: "Sudanese Local" },
  ];
  const insertedBrands = await db.insert(brands).values(brandData).returning();

  // Seed shipping fees
  await db.insert(shippingFees).values(
    SUDANESE_STATES.map((s) => ({
      state: s.en,
      stateAr: s.ar,
      fee: s.en === "Khartoum" || s.en === "Omdurman" || s.en === "Bahri" ? "500" : "1500",
      estimatedDays: s.en === "Khartoum" || s.en === "Omdurman" || s.en === "Bahri" ? 1 : 3,
    }))
  ).onConflictDoNothing();

  // Seed payment methods
  await db.insert(paymentMethods).values([
    { name: "Bankak", nameAr: "بنكك", code: "bankak", accountNumber: "0912345678", accountName: "سوق الجملة", instructions: "Transfer to Bankak number and upload screenshot", instructionsAr: "حول إلى رقم بنكك وارفع صورة التحويل", sortOrder: 1 },
    { name: "O-Cash", nameAr: "أوكاش", code: "ocash", accountNumber: "0923456789", accountName: "سوق الجملة", instructions: "Transfer to O-Cash number and upload screenshot", instructionsAr: "حول إلى رقم أوكاش وارفع صورة التحويل", sortOrder: 2 },
    { name: "Fawry", nameAr: "فوري", code: "fawry", accountNumber: "0934567890", accountName: "سوق الجملة", instructions: "Pay via Fawry and upload receipt", instructionsAr: "ادفع عبر فوري وارفع الإيصال", sortOrder: 3 },
    { name: "MyCashi", nameAr: "ماي كاش", code: "mycashi", accountNumber: "0945678901", accountName: "سوق الجملة", instructions: "Transfer to MyCashi number and upload screenshot", instructionsAr: "حول إلى رقم ماي كاش وارفع صورة التحويل", sortOrder: 4 },
    { name: "Bank Transfer", nameAr: "تحويل بنكي", code: "bank_transfer", accountNumber: "SD12-3456-7890-1234", accountName: "سوق الجملة", instructions: "Transfer to bank account and upload transfer confirmation", instructionsAr: "حول إلى الحساب البنكي وارفع صورة التحويل", sortOrder: 5 },
    { name: "Cash on Delivery", nameAr: "الدفع عند الاستلام", code: "cash_on_delivery", instructions: "Pay cash when order is delivered", instructionsAr: "ادفع نقداً عند استلام الطلب", sortOrder: 6 },
  ]).onConflictDoNothing();

  // Seed banners
  await db.insert(banners).values([
    { titleAr: "تخفيضات نهاية الموسم", titleEn: "End of Season Sale", subtitleAr: "خصومات تصل إلى 70% على جميع المنتجات", image: "https://images.pexels.com/photos/9811655/pexels-photo-9811655.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", link: "/products", sortOrder: 1 },
    { titleAr: "أزياء سودانية أصيلة", titleEn: "Authentic Sudanese Fashion", subtitleAr: "اكتشف أجمل الملابس السودانية التقليدية", image: "https://images.pexels.com/photos/30722459/pexels-photo-30722459.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", link: "/category/traditional", sortOrder: 2 },
    { titleAr: "عروض الجملة", titleEn: "Wholesale Deals", subtitleAr: "أسعار الجملة للكميات الكبيرة", image: "https://images.pexels.com/photos/19295116/pexels-photo-19295116.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", link: "/products?type=wholesale", sortOrder: 3 },
  ]).onConflictDoNothing();

  // Seed admin user
  const adminHash = await bcrypt.hash("admin123", 10);
  const adminUsers = await db.insert(users).values([
    { name: "المدير", email: "admin@souqaljumla.sd", passwordHash: adminHash, role: "admin" },
  ]).returning().onConflictDoNothing();

  // Seed demo products
  const menCat = insertedCats.find(c => c.slug === "mens-fashion");
  const womenCat = insertedCats.find(c => c.slug === "womens-fashion");
  const kidsCat = insertedCats.find(c => c.slug === "kids-clothing");
  const shoesCat = insertedCats.find(c => c.slug === "shoes");
  const bagsCat = insertedCats.find(c => c.slug === "bags");
  const watchesCat = insertedCats.find(c => c.slug === "watches");
  const perfumesCat = insertedCats.find(c => c.slug === "perfumes");
  const jewelryCat = insertedCats.find(c => c.slug === "jewelry");
  const beautyCat = insertedCats.find(c => c.slug === "beauty");
  const sportsCat = insertedCats.find(c => c.slug === "sportswear");
  const tradCat = insertedCats.find(c => c.slug === "traditional");

  const nikeBrand = insertedBrands.find(b => b.nameEn === "Nike");
  const zarraBrand = insertedBrands.find(b => b.nameEn === "Zara");
  const localBrand = insertedBrands.find(b => b.nameEn === "Sudanese Local");

  const demoProducts = [
    {
      categoryId: menCat?.id ?? 1,
      brandId: zarraBrand?.id ?? 1,
      nameAr: "قميص رجالي أنيق",
      nameEn: "Men's Elegant Shirt",
      slug: generateSlug("mens-elegant-shirt"),
      descriptionAr: "قميص رجالي أنيق من قماش القطن الفاخر، مناسب للمناسبات الرسمية والعمل",
      originalPrice: "15000",
      discountPrice: "12000",
      wholesalePrice: "8000",
      retailPrice: "15000",
      stock: 50,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["أبيض", "أزرق", "رمادي"],
      material: "قطن 100%",
      images: ["https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=400"],
      isFeatured: true,
      isBestSeller: true,
      isFlashDeal: true,
      rating: "4.8",
      reviewCount: 124,
    },
    {
      categoryId: womenCat?.id ?? 2,
      brandId: zarraBrand?.id ?? 1,
      nameAr: "فستان نسائي فاخر",
      nameEn: "Women's Luxury Dress",
      slug: generateSlug("womens-luxury-dress"),
      descriptionAr: "فستان نسائي فاخر بتصميم عصري وأقمشة راقية",
      originalPrice: "25000",
      discountPrice: "19000",
      wholesalePrice: "13000",
      retailPrice: "25000",
      stock: 30,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["أحمر", "أسود", "ذهبي"],
      material: "حرير مخلوط",
      images: ["https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=400"],
      isFeatured: true,
      isBestSeller: true,
      rating: "4.9",
      reviewCount: 89,
    },
    {
      categoryId: kidsCat?.id ?? 3,
      nameAr: "طقم أطفال كاجوال",
      nameEn: "Kids Casual Set",
      slug: generateSlug("kids-casual-set"),
      descriptionAr: "طقم ملابس أطفال مريح وجميل للمناسبات اليومية",
      originalPrice: "8000",
      discountPrice: "6500",
      wholesalePrice: "4000",
      retailPrice: "8000",
      stock: 100,
      sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"],
      colors: ["أزرق", "أخضر", "أصفر"],
      material: "قطن",
      images: ["https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=400"],
      isNewArrival: true,
      rating: "4.7",
      reviewCount: 56,
    },
    {
      categoryId: shoesCat?.id ?? 4,
      brandId: nikeBrand?.id ?? 1,
      nameAr: "حذاء رياضي نايك",
      nameEn: "Nike Sports Shoes",
      slug: generateSlug("nike-sports-shoes"),
      descriptionAr: "حذاء رياضي نايك الأصلي للجري والتمارين الرياضية",
      originalPrice: "35000",
      discountPrice: "28000",
      wholesalePrice: "20000",
      retailPrice: "35000",
      stock: 40,
      sizes: ["40", "41", "42", "43", "44", "45"],
      colors: ["أسود/أبيض", "أزرق/أبيض", "أحمر/أسود"],
      material: "مطاط وشبكة",
      images: ["https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400"],
      isBestSeller: true,
      isFeatured: true,
      rating: "4.9",
      reviewCount: 203,
    },
    {
      categoryId: bagsCat?.id ?? 5,
      nameAr: "حقيبة يد نسائية فاخرة",
      nameEn: "Women's Luxury Handbag",
      slug: generateSlug("womens-luxury-handbag"),
      descriptionAr: "حقيبة يد نسائية من الجلد الطبيعي الفاخر",
      originalPrice: "45000",
      discountPrice: "38000",
      wholesalePrice: "25000",
      retailPrice: "45000",
      stock: 20,
      colors: ["بني", "أسود", "بيج"],
      material: "جلد طبيعي",
      images: ["https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=400"],
      isFeatured: true,
      rating: "4.8",
      reviewCount: 67,
    },
    {
      categoryId: watchesCat?.id ?? 6,
      nameAr: "ساعة رجالية كلاسيكية",
      nameEn: "Men's Classic Watch",
      slug: generateSlug("mens-classic-watch"),
      descriptionAr: "ساعة رجالية كلاسيكية بتصميم أنيق وميزانيكا دقيقة",
      originalPrice: "120000",
      discountPrice: "95000",
      wholesalePrice: "65000",
      retailPrice: "120000",
      stock: 15,
      colors: ["ذهبي", "فضي", "أسود"],
      material: "ستانلس ستيل",
      images: ["https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400"],
      isFeatured: true,
      isFlashDeal: true,
      rating: "4.7",
      reviewCount: 45,
    },
    {
      categoryId: perfumesCat?.id ?? 7,
      nameAr: "عطر عود سوداني فاخر",
      nameEn: "Luxury Sudanese Oud Perfume",
      slug: generateSlug("luxury-sudanese-oud"),
      descriptionAr: "عطر عود سوداني أصيل من أجود أنواع العود الطبيعي",
      originalPrice: "55000",
      discountPrice: "45000",
      wholesalePrice: "30000",
      retailPrice: "55000",
      stock: 25,
      material: "عود طبيعي",
      images: ["https://images.pexels.com/photos/3387574/pexels-photo-3387574.jpeg?auto=compress&cs=tinysrgb&w=400"],
      isBestSeller: true,
      isFeatured: true,
      rating: "5.0",
      reviewCount: 178,
    },
    {
      categoryId: jewelryCat?.id ?? 8,
      nameAr: "طقم مجوهرات ذهبي",
      nameEn: "Gold Jewelry Set",
      slug: generateSlug("gold-jewelry-set"),
      descriptionAr: "طقم مجوهرات ذهبي فاخر يشمل عقد وأسورة وأقراط",
      originalPrice: "200000",
      discountPrice: "175000",
      wholesalePrice: "120000",
      retailPrice: "200000",
      stock: 10,
      material: "ذهب 18 قيراط",
      images: ["https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=400"],
      isFeatured: true,
      rating: "4.9",
      reviewCount: 34,
    },
    {
      categoryId: beautyCat?.id ?? 9,
      nameAr: "كريم ترطيب فاخر",
      nameEn: "Luxury Moisturizing Cream",
      slug: generateSlug("luxury-moisturizing-cream"),
      descriptionAr: "كريم ترطيب فاخر للبشرة الجافة والعادية",
      originalPrice: "12000",
      discountPrice: "9500",
      wholesalePrice: "5000",
      retailPrice: "12000",
      stock: 80,
      images: ["https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=400"],
      isNewArrival: true,
      isFlashDeal: true,
      rating: "4.6",
      reviewCount: 92,
    },
    {
      categoryId: sportsCat?.id ?? 10,
      brandId: nikeBrand?.id ?? 1,
      nameAr: "طقم رياضي نايك",
      nameEn: "Nike Sports Set",
      slug: generateSlug("nike-sports-set"),
      descriptionAr: "طقم رياضي نايك الأصلي للتمارين والجري",
      originalPrice: "42000",
      discountPrice: "35000",
      wholesalePrice: "22000",
      retailPrice: "42000",
      stock: 35,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["أسود", "رمادي", "أزرق"],
      images: ["https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400"],
      isBestSeller: true,
      rating: "4.8",
      reviewCount: 156,
    },
    {
      categoryId: tradCat?.id ?? 11,
      brandId: localBrand?.id,
      nameAr: "جلابية سودانية تقليدية",
      nameEn: "Traditional Sudanese Jalabiya",
      slug: generateSlug("traditional-sudanese-jalabiya"),
      descriptionAr: "جلابية سودانية تقليدية مصنوعة من أجود أنواع القماش السوداني",
      originalPrice: "18000",
      discountPrice: "15000",
      wholesalePrice: "10000",
      retailPrice: "18000",
      stock: 60,
      sizes: ["M", "L", "XL", "XXL", "XXXL"],
      colors: ["أبيض", "كريمي", "بيج"],
      material: "قطن سوداني",
      images: ["https://images.pexels.com/photos/9765822/pexels-photo-9765822.jpeg?auto=compress&cs=tinysrgb&w=400"],
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      rating: "4.9",
      reviewCount: 234,
    },
    {
      categoryId: womenCat?.id ?? 2,
      brandId: localBrand?.id,
      nameAr: "توب نسائي سوداني",
      nameEn: "Sudanese Women's Top",
      slug: generateSlug("sudanese-womens-top"),
      descriptionAr: "توب نسائي بتصميم سوداني عصري وألوان زاهية",
      originalPrice: "10000",
      discountPrice: "8000",
      wholesalePrice: "5500",
      retailPrice: "10000",
      stock: 75,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["زهري", "بنفسجي", "أزرق سماوي"],
      images: ["https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400"],
      isNewArrival: true,
      isFlashDeal: true,
      rating: "4.7",
      reviewCount: 88,
    },
  ];

  await db.insert(products).values(demoProducts).onConflictDoNothing();
}
