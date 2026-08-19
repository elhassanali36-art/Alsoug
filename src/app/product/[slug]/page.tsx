"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import {
  ShoppingCart, Heart, Star, Truck, Shield, RotateCcw,
  ChevronLeft, Share2, MessageCircle, Phone, Loader2, Zap, Package
} from "lucide-react";
import { cn, formatSDG, calculateDiscount } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

type ReviewUser = { id: number; name: string; avatar?: string };
type Review = {
  id: number; rating: number; comment?: string; images?: string[];
  sellerReply?: string; isVerified?: boolean; createdAt: string;
  userName?: string; userAvatar?: string;
};
type ProductData = {
  products: {
    id: number; nameAr: string; nameEn?: string | null; slug: string; descriptionAr?: string | null;
    descriptionEn?: string | null; sku?: string | null; images: string[] | null; videoUrl?: string | null;
    originalPrice: string; discountPrice?: string | null; wholesalePrice?: string | null; retailPrice?: string | null;
    stock: number; material?: string | null; sizes: string[] | null; colors: string[] | null;
    rating?: string | null; reviewCount?: number | null; soldCount?: number | null;
    isFeatured?: boolean | null; isFlashDeal?: boolean | null; isBestSeller?: boolean | null; isNewArrival?: boolean | null;
  };
  categories: { nameAr: string; nameEn: string; slug: string } | null;
  brands: { nameAr: string; nameEn: string } | null;
  sellers: { storeName: string; storeNameAr?: string | null; whatsapp?: string | null; rating?: string | null } | null;
};

type RelatedProduct = {
  id: number; nameAr: string; slug: string; images: string[] | null;
  originalPrice: string; discountPrice?: string | null; rating?: string | null;
};

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { lang, addToCart, setCartOpen, toggleWishlist, isWishlisted } = useStore();
  const isAr = lang === "ar";
  const [data, setData] = useState<{ product: ProductData; reviews: Review[]; related: RelatedProduct[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "reviews">("desc");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    params.then(({ slug: s }) => {
      setSlug(s);
      fetch(`/api/products/${s}`)
        .then(r => r.json())
        .then(d => {
          setData(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [params]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
    </div>
  );

  if (!data?.product?.products) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-5xl mb-4">📦</div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{isAr ? "المنتج غير موجود" : "Product not found"}</h1>
      <Link href="/products" className="mt-4 text-amber-600 hover:underline">{isAr ? "العودة للمنتجات" : "Back to products"}</Link>
    </div>
  );

  const p = data.product.products;
  const images = p.images || [];
  const price = parseFloat(p.discountPrice || p.originalPrice);
  const originalPrice = parseFloat(p.originalPrice);
  const discount = p.discountPrice ? calculateDiscount(originalPrice, parseFloat(p.discountPrice)) : 0;
  const rating = parseFloat(p.rating || "0");
  const wishlisted = isWishlisted(p.id);

  const handleAddToCart = () => {
    addToCart({
      id: Date.now(),
      productId: p.id,
      nameAr: p.nameAr,
      nameEn: p.nameEn || undefined,
      image: images[0] || "",
      price,
      originalPrice,
      quantity,
      selectedSize,
      selectedColor,
      stock: p.stock,
    });
    setCartOpen(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-amber-600">{isAr ? "الرئيسية" : "Home"}</Link>
          <ChevronLeft className={cn("w-3.5 h-3.5", !isAr && "rotate-180")} />
          <Link href="/products" className="hover:text-amber-600">{isAr ? "المنتجات" : "Products"}</Link>
          {data.product.categories && (
            <>
              <ChevronLeft className={cn("w-3.5 h-3.5", !isAr && "rotate-180")} />
              <Link href={`/category/${data.product.categories.slug}`} className="hover:text-amber-600">
                {isAr ? data.product.categories.nameAr : data.product.categories.nameEn}
              </Link>
            </>
          )}
          <ChevronLeft className={cn("w-3.5 h-3.5", !isAr && "rotate-180")} />
          <span className="text-gray-900 dark:text-white truncate max-w-32">{isAr ? p.nameAr : (p.nameEn || p.nameAr)}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 aspect-square">
              {images[selectedImage] ? (
                <img src={images[selectedImage]} alt={p.nameAr} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🛍️</div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 start-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-xl">
                  -{discount}%
                </div>
              )}
              <button
                onClick={() => toggleWishlist(p.id)}
                className={cn(
                  "absolute top-4 end-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all",
                  wishlisted ? "bg-red-500 text-white" : "bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500"
                )}
              >
                <Heart className="w-5 h-5" fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
                      i === selectedImage ? "border-amber-500" : "border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            {data.product.brands && (
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                {isAr ? data.product.brands.nameAr : data.product.brands.nameEn}
              </p>
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isAr ? p.nameAr : (p.nameEn || p.nameAr)}
            </h1>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4" fill={s <= Math.round(rating) ? "#F59E0B" : "none"} color={s <= Math.round(rating) ? "#F59E0B" : "#D1D5DB"} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({p.reviewCount || 0} {isAr ? "تقييم" : "reviews"})</span>
                <span className="text-sm font-bold text-amber-600">{rating.toFixed(1)}</span>
              </div>
            )}

            {/* Price */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">{formatSDG(price)}</span>
                {p.discountPrice && parseFloat(p.discountPrice) < parseFloat(p.originalPrice) && (
                  <span className="text-lg text-gray-400 line-through">{formatSDG(originalPrice)}</span>
                )}
                {discount > 0 && (
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold px-2 py-0.5 rounded-lg">
                    {isAr ? `وفر ${discount}%` : `Save ${discount}%`}
                  </span>
                )}
              </div>
              {p.wholesalePrice && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{isAr ? "سعر الجملة:" : "Wholesale:"}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{formatSDG(parseFloat(p.wholesalePrice))}</span>
                </div>
              )}
            </div>

            {/* Sizes */}
            {p.sizes && p.sizes.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  {isAr ? "المقاس" : "Size"}: {selectedSize && <span className="text-amber-600">{selectedSize}</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {p.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(selectedSize === size ? "" : size)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl border text-sm font-medium transition-all",
                        selectedSize === size
                          ? "bg-amber-500 border-amber-500 text-white"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-amber-400"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {p.colors && p.colors.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  {isAr ? "اللون" : "Color"}: {selectedColor && <span className="text-amber-600">{selectedColor}</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {p.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(selectedColor === color ? "" : color)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl border text-sm font-medium transition-all",
                        selectedColor === color
                          ? "bg-amber-500 border-amber-500 text-white"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-amber-400"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                {isAr ? "الكمية" : "Quantity"}
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-amber-600 text-lg font-bold">-</button>
                  <span className="w-10 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(p.stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-amber-600 text-lg font-bold">+</button>
                </div>
                <span className={cn("text-sm", p.stock < 10 ? "text-red-500" : "text-green-600 dark:text-green-400")}>
                  {p.stock > 0 ? (isAr ? `متاح: ${p.stock} قطعة` : `${p.stock} in stock`) : (isAr ? "غير متوفر" : "Out of stock")}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={p.stock === 0}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-amber-200 dark:hover:shadow-amber-900/30"
              >
                <ShoppingCart className="w-5 h-5" />
                {isAr ? "أضف للسلة" : "Add to Cart"}
              </button>
              <Link
                href="/checkout"
                onClick={() => {
                  addToCart({ id: Date.now(), productId: p.id, nameAr: p.nameAr, nameEn: p.nameEn || undefined, image: images[0] || "", price, originalPrice, quantity, selectedSize, selectedColor, stock: p.stock });
                }}
                className="flex-1 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-5 h-5" />
                {isAr ? "اشتري الآن" : "Buy Now"}
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <Truck className="w-4 h-4" />, ar: "شحن سريع", en: "Fast Shipping" },
                { icon: <Shield className="w-4 h-4" />, ar: "دفع آمن", en: "Secure Pay" },
                { icon: <RotateCcw className="w-4 h-4" />, ar: "إرجاع 7 أيام", en: "7 Days Return" },
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs text-gray-600 dark:text-gray-400">
                  <span className="text-amber-500">{f.icon}</span>
                  {isAr ? f.ar : f.en}
                </div>
              ))}
            </div>

            {/* Seller WhatsApp */}
            {data.product.sellers?.whatsapp && (
              <a
                href={`https://wa.me/${data.product.sellers.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors w-fit"
              >
                <MessageCircle className="w-4 h-4" />
                {isAr ? "تواصل عبر واتساب" : "Contact via WhatsApp"}
              </a>
            )}

            {/* Product Details */}
            {(p.sku || p.material) && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {p.sku && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-gray-400 text-xs mb-1">{isAr ? "رمز المنتج" : "SKU"}</p>
                    <p className="font-medium text-gray-900 dark:text-white font-mono">{p.sku}</p>
                  </div>
                )}
                {p.material && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-gray-400 text-xs mb-1">{isAr ? "المادة" : "Material"}</p>
                    <p className="font-medium text-gray-900 dark:text-white">{p.material}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-8">
          <div className="flex border-b border-gray-100 dark:border-gray-800">
            {(["desc", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-4 text-sm font-semibold transition-colors",
                  activeTab === tab
                    ? "text-amber-600 dark:text-amber-400 border-b-2 border-amber-500"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                {tab === "desc" ? (isAr ? "وصف المنتج" : "Description") : `${isAr ? "التقييمات" : "Reviews"} (${p.reviewCount || 0})`}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === "desc" && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {isAr ? (p.descriptionAr || "لا يوجد وصف متاح") : (p.descriptionEn || p.descriptionAr || "No description available")}
                </p>
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                {data.reviews.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">{isAr ? "لا توجد تقييمات بعد" : "No reviews yet"}</p>
                ) : (
                  data.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {(review.userName || "م").charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.userName || (isAr ? "مستخدم" : "User")}</p>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3 h-3" fill={s <= review.rating ? "#F59E0B" : "none"} color={s <= review.rating ? "#F59E0B" : "#D1D5DB"} />
                            ))}
                          </div>
                        </div>
                        {review.isVerified && (
                          <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                            ✓ {isAr ? "مشتري موثق" : "Verified"}
                          </span>
                        )}
                      </div>
                      {review.comment && <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {data.related.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">{isAr ? "منتجات مشابهة" : "Related Products"}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {data.related.filter(r => r.id !== p.id).slice(0, 6).map((r) => (
                <ProductCard key={r.id} product={{ ...r, nameEn: null, wholesalePrice: null, rating: r.rating, reviewCount: null, stock: 10, isFeatured: null, isFlashDeal: null, isBestSeller: null, isNewArrival: null, soldCount: null, sizes: null, colors: null, categoryNameAr: null, brandNameEn: null, brandNameAr: null }} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
