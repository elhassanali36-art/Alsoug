"use client";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Zap, Eye } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatSDG, calculateDiscount } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Product = {
  id: number;
  nameAr: string;
  nameEn?: string | null;
  slug: string;
  images: string[] | null;
  originalPrice: string;
  discountPrice?: string | null;
  wholesalePrice?: string | null;
  rating?: string | null;
  reviewCount?: number | null;
  stock?: number;
  isFeatured?: boolean | null;
  isFlashDeal?: boolean | null;
  isBestSeller?: boolean | null;
  isNewArrival?: boolean | null;
  soldCount?: number | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  categoryNameAr?: string | null;
  brandNameEn?: string | null;
  brandNameAr?: string | null;
};

export default function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { lang, toggleWishlist, isWishlisted, addToCart, setCartOpen } = useStore();
  const isAr = lang === "ar";
  const wishlisted = isWishlisted(product.id);

  const price = parseFloat(product.discountPrice || product.originalPrice);
  const originalPrice = parseFloat(product.originalPrice);
  const discount = product.discountPrice ? calculateDiscount(originalPrice, parseFloat(product.discountPrice)) : 0;
  const image = product.images?.[0] || "";
  const name = isAr ? product.nameAr : (product.nameEn || product.nameAr);
  const rating = parseFloat(product.rating || "0");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id: Date.now(),
      productId: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn || undefined,
      image,
      price,
      originalPrice,
      quantity: 1,
      stock: product.stock || 10,
    });
    setCartOpen(true);
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className={cn(
        "bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-700 transition-all duration-300 hover:shadow-xl hover:shadow-amber-50 dark:hover:shadow-amber-900/10 hover:-translate-y-0.5",
        compact ? "" : "h-full"
      )}>
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800" style={{ aspectRatio: "1/1" }}>
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=400"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
          )}

          {/* Badges */}
          <div className="absolute top-2 start-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                -{discount}%
              </span>
            )}
            {product.isFlashDeal && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" />
                {isAr ? "فلاش" : "Flash"}
              </span>
            )}
            {product.isNewArrival && !product.isFlashDeal && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                {isAr ? "جديد" : "New"}
              </span>
            )}
            {product.isBestSeller && !product.isNewArrival && !product.isFlashDeal && (
              <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                {isAr ? "الأكثر مبيعاً" : "Best Seller"}
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
            className={cn(
              "absolute top-2 end-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg",
              wishlisted
                ? "bg-red-500 text-white"
                : "bg-white/90 dark:bg-gray-800/90 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
            )}
          >
            <Heart className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} />
          </button>

          {/* Add to Cart Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {isAr ? "أضف للسلة" : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3" dir={isAr ? "rtl" : "ltr"}>
          {product.brandNameAr && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
              {isAr ? product.brandNameAr : (product.brandNameEn || product.brandNameAr)}
            </p>
          )}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1.5 leading-snug">
            {name}
          </h3>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-3 h-3"
                    fill={star <= Math.round(rating) ? "#F59E0B" : "none"}
                    color={star <= Math.round(rating) ? "#F59E0B" : "#D1D5DB"}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">({product.reviewCount || 0})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-amber-600 dark:text-amber-400">{formatSDG(price)}</span>
            {product.discountPrice && parseFloat(product.discountPrice) < parseFloat(product.originalPrice) && (
              <span className="text-xs text-gray-400 line-through">{formatSDG(originalPrice)}</span>
            )}
          </div>

          {/* Wholesale Price */}
          {product.wholesalePrice && (
            <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-2 py-1">
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {isAr ? "سعر الجملة: " : "Wholesale: "}{formatSDG(parseFloat(product.wholesalePrice))}
              </span>
            </div>
          )}

          {/* Sizes preview */}
          {product.sizes && product.sizes.length > 0 && !compact && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.sizes.slice(0, 4).map((size) => (
                <span key={size} className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
                  {size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-400">+{product.sizes.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
