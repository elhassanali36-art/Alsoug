"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, ChevronDown, X, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

type Product = {
  id: number; nameAr: string; nameEn?: string | null; slug: string; images: string[] | null;
  originalPrice: string; discountPrice?: string | null; wholesalePrice?: string | null;
  rating?: string | null; reviewCount?: number | null; stock?: number;
  isFeatured?: boolean | null; isFlashDeal?: boolean | null; isBestSeller?: boolean | null;
  isNewArrival?: boolean | null; soldCount?: number | null; sizes?: string[] | null;
  colors?: string[] | null; categoryNameAr?: string | null; brandNameEn?: string | null; brandNameAr?: string | null;
};

function ProductsContent() {
  const { lang } = useStore();
  const isAr = lang === "ar";
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt_desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  const search = searchParams.get("search") || "";
  const featured = searchParams.get("featured") || "";
  const flashDeal = searchParams.get("flash_deal") || "";
  const bestSeller = searchParams.get("best_seller") || "";
  const newArrival = searchParams.get("new_arrival") || "";

  const fetchProducts = async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: "12",
        sort: sortBy,
        ...(search && { search }),
        ...(featured && { featured }),
        ...(flashDeal && { flash_deal: flashDeal }),
        ...(bestSeller && { best_seller: bestSeller }),
        ...(newArrival && { new_arrival: newArrival }),
        ...(priceRange.min && { min_price: priceRange.min }),
        ...(priceRange.max && { max_price: priceRange.max }),
      });
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [search, featured, flashDeal, bestSeller, newArrival, sortBy]);

  const SORTS = [
    { value: "createdAt_desc", labelAr: "الأحدث", labelEn: "Newest" },
    { value: "price_asc", labelAr: "السعر: الأقل", labelEn: "Price: Low to High" },
    { value: "price_desc", labelAr: "السعر: الأعلى", labelEn: "Price: High to Low" },
    { value: "rating_desc", labelAr: "التقييم", labelEn: "Top Rated" },
    { value: "sold_desc", labelAr: "الأكثر مبيعاً", labelEn: "Best Selling" },
  ];

  const title = search ? `${isAr ? "نتائج البحث عن" : "Results for"}: "${search}"`
    : featured ? (isAr ? "المنتجات المميزة" : "Featured Products")
    : flashDeal ? (isAr ? "عروض فلاش" : "Flash Deals")
    : bestSeller ? (isAr ? "الأكثر مبيعاً" : "Best Sellers")
    : newArrival ? (isAr ? "وصل حديثاً" : "New Arrivals")
    : (isAr ? "جميع المنتجات" : "All Products");

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {isAr ? `${total} منتج` : `${total} products`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-700 dark:text-gray-300 pr-8 cursor-pointer focus:outline-none focus:border-amber-400"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{isAr ? s.labelAr : s.labelEn}</option>
                ))}
              </select>
              <ChevronDown className="absolute top-1/2 end-2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {isAr ? "لا توجد منتجات" : "No products found"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {isAr ? "جرب البحث بكلمات مختلفة" : "Try different search terms"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Pagination */}
            {total > 12 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: Math.ceil(total / 12) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPage(p); fetchProducts(p); window.scrollTo(0, 0); }}
                    className={cn(
                      "w-9 h-9 rounded-xl text-sm font-medium transition-colors",
                      p === page
                        ? "bg-amber-500 text-white"
                        : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-gray-200 dark:border-gray-700"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-amber-500 animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
