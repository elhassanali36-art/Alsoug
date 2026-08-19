"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  ShoppingCart, Heart, Search, Moon, Sun, Menu, X,
  User, Package, LogOut, ChevronDown, Globe, Bell, Store
} from "lucide-react";
import { cn } from "@/lib/utils";
import CartDrawer from "./CartDrawer";
import SearchModal from "./SearchModal";

const CATEGORY_ICONS: Record<string, string> = {
  "mens-fashion": "👔",
  "womens-fashion": "👗",
  "kids-clothing": "🧒",
  "shoes": "👟",
  "bags": "👜",
  "watches": "⌚",
  "perfumes": "🌸",
  "jewelry": "💍",
  "beauty": "💄",
  "sportswear": "🏃",
  "traditional": "🧕",
};

type Category = {
  id: number;
  slug: string;
  nameAr: string;
  nameEn: string;
  icon?: string;
};

export default function Navbar() {
  const { theme, toggleTheme, lang, toggleLang, user, setUser, cartCount, setCartOpen, setSearchOpen, setSidebarOpen, sidebarOpen } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const count = useStore((s) => s.cartCount());

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAr = lang === "ar";

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs py-1.5 px-4 text-center">
        {isAr ? "🎉 شحن مجاني للطلبات فوق 50,000 جنيه سوداني | تواصل معنا: 0912-345-678" : "🎉 Free shipping over 50,000 SDG | Contact: 0912-345-678"}
      </div>

      {/* Main Navbar */}
      <nav className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
          : "bg-white dark:bg-gray-900",
        "border-b border-gray-100 dark:border-gray-800"
      )} dir={isAr ? "rtl" : "ltr"}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 leading-tight">سوق الجملة</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">Souq Aljumla</div>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex flex-1 max-w-xl items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">{isAr ? "ابحث عن منتجات..." : "Search products..."}</span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {/* Search Mobile */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language */}
            <button
              onClick={toggleLang}
              className="hidden sm:flex p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors items-center gap-1"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">{isAr ? "EN" : "ع"}</span>
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-3 h-3 hidden sm:block" />
              </button>
              {userMenuOpen && (
                <div className={cn(
                  "absolute top-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl py-2 w-48 z-50",
                  isAr ? "left-0" : "right-0"
                )}>
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.role === "admin" ? "مدير" : user.role === "seller" ? "بائع" : "عميل"}</p>
                      </div>
                      <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300" onClick={() => setUserMenuOpen(false)}>
                        <Package className="w-4 h-4" /> {isAr ? "طلباتي" : "My Orders"}
                      </Link>
                      {(user.role === "admin" || user.role === "seller") && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-amber-600 dark:text-amber-400" onClick={() => setUserMenuOpen(false)}>
                          <Store className="w-4 h-4" /> {isAr ? "لوحة التحكم" : "Dashboard"}
                        </Link>
                      )}
                      <button
                        onClick={() => { setUser(null); setUserMenuOpen(false); }}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-red-500 w-full"
                      >
                        <LogOut className="w-4 h-4" /> {isAr ? "تسجيل الخروج" : "Logout"}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300" onClick={() => setUserMenuOpen(false)}>
                        <User className="w-4 h-4" /> {isAr ? "تسجيل الدخول" : "Login"}
                      </Link>
                      <Link href="/register" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-amber-600 dark:text-amber-400" onClick={() => setUserMenuOpen(false)}>
                        {isAr ? "إنشاء حساب" : "Register"}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Categories Bar - Desktop */}
        <div className="hidden md:block border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50" dir={isAr ? "rtl" : "ltr"}>
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
            <Link href="/products" className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/20 text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-400 whitespace-nowrap transition-colors">
              {isAr ? "كل المنتجات" : "All Products"}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/20 text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-400 whitespace-nowrap transition-colors flex items-center gap-1"
              >
                <span>{CATEGORY_ICONS[cat.slug] || "🛍️"}</span>
                {isAr ? cat.nameAr : cat.nameEn}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
            <div
              className={cn(
                "absolute top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto",
                isAr ? "right-0" : "left-0"
              )}
              onClick={(e) => e.stopPropagation()}
              dir={isAr ? "rtl" : "ltr"}
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="text-lg font-bold text-amber-600">سوق الجملة</div>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{isAr ? "التصنيفات" : "Categories"}</p>
                <Link href="/products" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-700 dark:text-gray-300 text-sm font-medium">
                  🛍️ {isAr ? "كل المنتجات" : "All Products"}
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-700 dark:text-gray-300 text-sm font-medium"
                  >
                    {CATEGORY_ICONS[cat.slug] || "🛍️"} {isAr ? cat.nameAr : cat.nameEn}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      <CartDrawer />
      <SearchModal />
    </>
  );
}
