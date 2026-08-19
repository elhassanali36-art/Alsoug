"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/utils";

type Product = {
  id: number; nameAr: string; nameEn?: string | null; slug: string; images: string[] | null;
  originalPrice: string; discountPrice?: string | null; wholesalePrice?: string | null;
  rating?: string | null; reviewCount?: number | null; stock?: number;
  isFeatured?: boolean | null; isFlashDeal?: boolean | null; isBestSeller?: boolean | null;
  isNewArrival?: boolean | null; soldCount?: number | null; sizes?: string[] | null;
  colors?: string[] | null; categoryNameAr?: string | null; brandNameEn?: string | null; brandNameAr?: string | null;
};

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { lang } = useStore();
  const isAr = lang === "ar";
  const [slug, setSlug] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ slug: s }) => {
      setSlug(s);
      fetch(`/api/products?category=${s}&limit=24`)
        .then(r => r.json())
        .then(d => { setProducts(d.products || []); setLoading(false); });
    });
  }, [params]);

  const cat = CATEGORIES.find(c => c.slug === slug);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {cat ? (isAr ? cat.nameAr : cat.nameEn) : slug}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isAr ? `${products.length} منتج` : `${products.length} products`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500">{isAr ? "لا توجد منتجات في هذا التصنيف" : "No products in this category"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
