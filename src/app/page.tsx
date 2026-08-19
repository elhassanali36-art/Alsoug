"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import {
  ChevronLeft, ChevronRight, Zap, TrendingUp, Sparkles,
  Star, Shield, Truck, CreditCard, RotateCcw, ArrowRight, Award
} from "lucide-react";
import { cn, formatSDG } from "@/lib/utils";

type Banner = { id: number; titleAr?: string | null; titleEn?: string | null; subtitleAr?: string | null; image: string; link?: string | null };
type Product = {
  id: number; nameAr: string; nameEn?: string | null; slug: string; images: string[] | null;
  originalPrice: string; discountPrice?: string | null; wholesalePrice?: string | null;
  rating?: string | null; reviewCount?: number | null; stock?: number;
  isFeatured?: boolean | null; isFlashDeal?: boolean | null; isBestSeller?: boolean | null;
  isNewArrival?: boolean | null; soldCount?: number | null; sizes?: string[] | null;
  colors?: string[] | null; categoryNameAr?: string | null; brandNameEn?: string | null; brandNameAr?: string | null;
};
type Category = { id: number; slug: string; nameAr: string; nameEn: string; icon?: string | null };

const CATEGORY_ICONS: Record<string, string> = {
  "mens-fashion": "👔", "womens-fashion": "👗", "kids-clothing": "🧒",
  "shoes": "👟", "bags": "👜", "watches": "⌚", "perfumes": "🌸",
  "jewelry": "💍", "beauty": "💄", "sportswear": "🏃", "traditional": "🧕",
};

const FEATURES = [
  { icon: <Truck className="w-6 h-6" />, titleAr: "شحن سريع", titleEn: "Fast Delivery", descAr: "توصيل لجميع ولايات السودان", descEn: "Delivery across Sudan" },
  { icon: <Shield className="w-6 h-6" />, titleAr: "دفع آمن", titleEn: "Secure Payment", descAr: "جميع طرق الدفع السودانية", descEn: "All Sudanese payment methods" },
  { icon: <RotateCcw className="w-6 h-6" />, titleAr: "إرجاع سهل", titleEn: "Easy Returns", descAr: "إرجاع مجاني خلال 7 أيام", descEn: "Free returns within 7 days" },
  { icon: <Award className="w-6 h-6" />, titleAr: "منتجات أصلية", titleEn: "Original Products", descAr: "ضمان الجودة والأصالة", descEn: "Quality & authenticity guaranteed" },
];

export default function HomePage() {
  const { lang } = useStore();
  const isAr = lang === "ar";
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [flashTime, setFlashTime] = useState({ h: 5, m: 59, s: 30 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/banners").then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
      fetch("/api/products?featured=true&limit=8").then(r => r.json()),
      fetch("/api/products?flash_deal=true&limit=6").then(r => r.json()),
      fetch("/api/products?best_seller=true&limit=8").then(r => r.json()),
      fetch("/api/products?new_arrival=true&limit=8").then(r => r.json()),
    ]).then(([b, c, f, fd, bs, na]) => {
      setBanners(b.banners || []);
      setCategories(c.categories || []);
      setFeatured(f.products || []);
      setFlashDeals(fd.products || []);
      setBestSellers(bs.products || []);
      setNewArrivals(na.products || []);
    });
  }, []);

  // Auto-slide banners
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  // Flash deal timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setFlashTime((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
      {/* Hero Slider */}
      <section className="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-br from-amber-900 to-gray-900">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === currentBanner ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            <img
              src={banner.image}
              alt={banner.titleAr || ""}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-8 start-8 text-white max-w-lg">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-shadow-lg">{isAr ? banner.titleAr : banner.titleEn}</h1>
              {banner.subtitleAr && <p className="text-sm sm:text-base text-white/80 mb-4">{banner.subtitleAr}</p>}
              {banner.link && (
                <Link href={banner.link} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all text-sm shadow-lg">
                  {isAr ? "تسوق الآن" : "Shop Now"}
                  <ChevronLeft className={cn("w-4 h-4", !isAr && "rotate-180")} />
                </Link>
              )}
            </div>
          </div>
        ))}

        {/* Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentBanner ? "bg-amber-400 w-6" : "bg-white/50"
                )}
              />
            ))}
          </div>
        )}

        {/* Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute top-1/2 start-4 -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
              className="absolute top-1/2 end-4 -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur-sm hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}
      </section>

      {/* Features Bar */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors">
                <div className="text-amber-500 flex-shrink-0">{f.icon}</div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{isAr ? f.titleAr : f.titleEn}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{isAr ? f.descAr : f.descEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🛍️ {isAr ? "تصفح حسب الفئة" : "Browse by Category"}
          </h2>
          <Link href="/products" className="text-amber-600 dark:text-amber-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
            {isAr ? "الكل" : "See All"} <ChevronLeft className={cn("w-4 h-4", !isAr && "rotate-180")} />
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-lg hover:shadow-amber-50 dark:hover:shadow-amber-900/10 transition-all group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 transition-transform">
                {CATEGORY_ICONS[cat.slug] || "🛍️"}
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                {isAr ? cat.nameAr : cat.nameEn}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Deals */}
      {flashDeals.length > 0 && (
        <section className="py-6 max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-xl p-2">
                  <Zap className="w-5 h-5 text-white" fill="white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{isAr ? "عروض فلاش" : "Flash Deals"}</h2>
                  <p className="text-red-100 text-xs">{isAr ? "عروض محدودة الوقت" : "Limited time offers"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-white">
                {[pad(flashTime.h), pad(flashTime.m), pad(flashTime.s)].map((t, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="bg-white/20 rounded-lg px-2 py-1 font-mono font-bold text-sm">{t}</span>
                    {i < 2 && <span className="font-bold">:</span>}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {flashDeals.map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-6 max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {isAr ? "منتجات مميزة" : "Featured Products"}
            </h2>
            <Link href="/products?featured=true" className="text-amber-600 dark:text-amber-400 text-sm font-medium flex items-center gap-1">
              {isAr ? "الكل" : "See All"} <ChevronLeft className={cn("w-4 h-4", !isAr && "rotate-180")} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 p-8 flex flex-col justify-between h-48">
            <div>
              <p className="text-amber-100 text-sm mb-1">{isAr ? "عرض الجملة" : "Wholesale Offer"}</p>
              <h3 className="text-2xl font-bold text-white">{isAr ? "خصم 30% على الجملة" : "30% Off Wholesale"}</h3>
              <p className="text-amber-100 text-sm mt-1">{isAr ? "للطلبات أكثر من 10 قطع" : "For orders over 10 pieces"}</p>
            </div>
            <Link href="/products?type=wholesale" className="self-start bg-white text-amber-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-amber-50 transition-colors">
              {isAr ? "تسوق الآن" : "Shop Now"}
            </Link>
            <div className="absolute -end-6 -bottom-6 text-8xl opacity-20">🛍️</div>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 to-blue-600 p-8 flex flex-col justify-between h-48">
            <div>
              <p className="text-purple-200 text-sm mb-1">{isAr ? "الملابس التقليدية" : "Traditional Wear"}</p>
              <h3 className="text-2xl font-bold text-white">{isAr ? "جلابيات سودانية" : "Sudanese Jalabiya"}</h3>
              <p className="text-purple-100 text-sm mt-1">{isAr ? "أجود الأقمشة السودانية الأصيلة" : "Finest authentic Sudanese fabrics"}</p>
            </div>
            <Link href="/category/traditional" className="self-start bg-white text-purple-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-purple-50 transition-colors">
              {isAr ? "استكشف" : "Explore"}
            </Link>
            <div className="absolute -end-6 -bottom-6 text-8xl opacity-20">🧕</div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-6 max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              {isAr ? "الأكثر مبيعاً" : "Best Sellers"}
            </h2>
            <Link href="/products?best_seller=true" className="text-amber-600 dark:text-amber-400 text-sm font-medium flex items-center gap-1">
              {isAr ? "الكل" : "See All"} <ChevronLeft className={cn("w-4 h-4", !isAr && "rotate-180")} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-6 max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              🆕 {isAr ? "وصل حديثاً" : "New Arrivals"}
            </h2>
            <Link href="/products?new_arrival=true" className="text-amber-600 dark:text-amber-400 text-sm font-medium flex items-center gap-1">
              {isAr ? "الكل" : "See All"} <ChevronLeft className={cn("w-4 h-4", !isAr && "rotate-180")} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white mt-12" dir={isAr ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold text-amber-400 mb-2">سوق الجملة</div>
              <p className="text-gray-400 text-sm leading-relaxed">{isAr ? "أفضل سوق إلكتروني في السودان للجملة والتجزئة" : "Sudan's best wholesale & retail marketplace"}</p>
              <div className="flex gap-3 mt-4">
                {["📘", "📷", "🐦", "💬"].map((icon, i) => (
                  <div key={i} className="w-9 h-9 bg-gray-800 hover:bg-amber-600 rounded-xl flex items-center justify-center cursor-pointer transition-colors text-base">
                    {icon}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-amber-400">{isAr ? "روابط سريعة" : "Quick Links"}</h3>
              {[
                { ar: "الرئيسية", en: "Home", href: "/" },
                { ar: "المنتجات", en: "Products", href: "/products" },
                { ar: "العروض", en: "Deals", href: "/products?flash_deal=true" },
                { ar: "تواصل معنا", en: "Contact", href: "/contact" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="block text-sm text-gray-400 hover:text-amber-400 mb-2 transition-colors">
                  {isAr ? l.ar : l.en}
                </Link>
              ))}
            </div>
            <div>
              <h3 className="font-bold mb-3 text-amber-400">{isAr ? "دعم العملاء" : "Customer Support"}</h3>
              {[
                { ar: "كيفية الطلب", en: "How to Order" },
                { ar: "سياسة الإرجاع", en: "Return Policy" },
                { ar: "تتبع الطلب", en: "Track Order" },
                { ar: "الشحن والتوصيل", en: "Shipping & Delivery" },
              ].map((l) => (
                <p key={l.ar} className="text-sm text-gray-400 hover:text-amber-400 mb-2 cursor-pointer transition-colors">
                  {isAr ? l.ar : l.en}
                </p>
              ))}
            </div>
            <div>
              <h3 className="font-bold mb-3 text-amber-400">{isAr ? "طرق الدفع" : "Payment Methods"}</h3>
              <div className="grid grid-cols-2 gap-2">
                {["بنكك", "أوكاش", "فوري", "ماي كاش", "تحويل بنكي", "الدفع عند الاستلام"].map((m) => (
                  <div key={m} className="bg-gray-800 rounded-lg px-2 py-1.5 text-xs text-gray-300 text-center">{m}</div>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">{isAr ? "تواصل معنا" : "Contact us"}</p>
                <p className="text-sm text-amber-400 font-mono">0912-345-678</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">© 2025 سوق الجملة. {isAr ? "جميع الحقوق محفوظة" : "All rights reserved"}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>🇸🇩 {isAr ? "صُنع في السودان" : "Made in Sudan"}</span>
              <span>•</span>
              <span>{isAr ? "أسعار بالجنيه السوداني" : "Prices in SDG"}</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
