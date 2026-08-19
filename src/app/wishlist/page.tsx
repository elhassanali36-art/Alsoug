"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";

type Product = {
  id: number; nameAr: string; nameEn?: string | null; slug: string; images: string[] | null;
  originalPrice: string; discountPrice?: string | null; wholesalePrice?: string | null;
  rating?: string | null; reviewCount?: number | null; stock?: number;
  isFeatured?: boolean | null; isFlashDeal?: boolean | null; isBestSeller?: boolean | null;
  isNewArrival?: boolean | null; soldCount?: number | null; sizes?: string[] | null;
  colors?: string[] | null; categoryNameAr?: string | null; brandNameEn?: string | null; brandNameAr?: string | null;
};

export default function WishlistPage() {
  const { lang, wishlist } = useStore();
  const isAr = lang === "ar";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlist.length === 0) { setLoading(false); return; }
    Promise.all(
      wishlist.slice(0, 20).map(id =>
        fetch(`/api/products?limit=100`).then(r => r.json())
      )
    ).then(async () => {
      const res = await fetch(`/api/products?limit=100`);
      const data = await res.json();
      const filtered = (data.products || []).filter((p: Product) => wishlist.includes(p.id));
      setProducts(filtered);
      setLoading(false);
    });
  }, [wishlist]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500" fill="currentColor" />
          {isAr ? "قائمة المفضلة" : "Wishlist"}
          <span className="text-base text-gray-400">({wishlist.length})</span>
        </h1>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-amber-500 animate-spin" /></div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{isAr ? "قائمة المفضلة فارغة" : "Your wishlist is empty"}</h3>
            <Link href="/products" className="mt-4 inline-block bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold">
              {isAr ? "تسوق الآن" : "Shop Now"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </main>
  );
}
