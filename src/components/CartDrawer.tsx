"use client";
import { useStore } from "@/lib/store";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { cn, formatSDG } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export default function CartDrawer() {
  const { cartOpen, setCartOpen, cart, removeFromCart, updateQuantity, cartTotal, lang } = useStore();
  const total = useStore((s) => s.cartTotal());
  const isAr = lang === "ar";

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50" dir={isAr ? "rtl" : "ltr"}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
      <div className={cn(
        "absolute top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl flex flex-col",
        isAr ? "right-0" : "left-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            {isAr ? "سلة التسوق" : "Shopping Cart"}
            {cart.length > 0 && (
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
          </h2>
          <button onClick={() => setCartOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{isAr ? "السلة فارغة" : "Your cart is empty"}</p>
              <Link
                href="/products"
                onClick={() => setCartOpen(false)}
                className="mt-4 inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {isAr ? "تسوق الآن" : "Shop Now"}
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                  <img
                    src={item.image}
                    alt={item.nameAr}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.jpg"; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{isAr ? item.nameAr : (item.nameEn || item.nameAr)}</p>
                  {(item.selectedSize || item.selectedColor) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.selectedSize && `${isAr ? "مقاس" : "Size"}: ${item.selectedSize}`}
                      {item.selectedSize && item.selectedColor && " | "}
                      {item.selectedColor && `${isAr ? "لون" : "Color"}: ${item.selectedColor}`}
                    </p>
                  )}
                  <p className="text-amber-600 dark:text-amber-400 font-bold text-sm mt-1">{formatSDG(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="mr-auto text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">{isAr ? "المجموع" : "Total"}</span>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{formatSDG(total)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setCartOpen(false)}
              className="block w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-center py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-amber-200 dark:hover:shadow-amber-900/30"
            >
              {isAr ? "إتمام الشراء" : "Checkout"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
