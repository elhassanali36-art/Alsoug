"use client";
import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { Search, X, Mic, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatSDG } from "@/lib/utils";

type Product = {
  id: number;
  nameAr: string;
  nameEn?: string;
  slug: string;
  images: string[];
  originalPrice: string;
  discountPrice?: string;
};

const TRENDING = ["جلابية سودانية", "عطر عود", "حذاء نايك", "فستان نسائي", "ساعة رجالية"];

export default function SearchModal() {
  const { searchOpen, setSearchOpen, lang } = useStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isAr = lang === "ar";

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        setResults(data.products || []);
      } catch {}
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    setSearchOpen(false);
    setQuery("");
  };

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50" dir={isAr ? "rtl" : "ltr"}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
      <div className="absolute top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-2xl">
        <div className="max-w-3xl mx-auto p-4">
          <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
            <Search className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={isAr ? "ابحث عن منتجات، ماركات، أصناف..." : "Search products, brands, categories..."}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-base"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="mt-3 max-h-96 overflow-y-auto">
            {loading && (
              <div className="text-center py-6 text-gray-500">{isAr ? "جاري البحث..." : "Searching..."}</div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="text-center py-6 text-gray-500">{isAr ? "لا توجد نتائج" : "No results found"}</div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-1">
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { router.push(`/product/${p.slug}`); setSearchOpen(false); setQuery(""); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-start"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt={p.nameAr} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {isAr ? p.nameAr : (p.nameEn || p.nameAr)}
                      </p>
                      <p className="text-amber-600 dark:text-amber-400 text-sm font-bold">
                        {formatSDG(parseFloat(p.discountPrice || p.originalPrice))}
                      </p>
                    </div>
                  </button>
                ))}
                {results.length >= 6 && (
                  <button
                    onClick={() => handleSearch()}
                    className="w-full text-center py-3 text-amber-600 dark:text-amber-400 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl"
                  >
                    {isAr ? "عرض جميع النتائج" : "View all results"}
                  </button>
                )}
              </div>
            )}

            {!query && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" /> {isAr ? "الأكثر بحثاً" : "Trending Searches"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setQuery(t); handleSearch(t); }}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-400 rounded-xl text-sm transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
