"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: number;
  productId: number;
  nameAr: string;
  nameEn?: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  stock: number;
};

export type User = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: "customer" | "seller" | "admin";
  avatar?: string;
};

type StoreState = {
  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;

  // Language
  lang: "ar" | "en";
  toggleLang: () => void;

  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  clearCart: () => void;
  cartCount: () => number;
  cartTotal: () => number;

  // Wishlist
  wishlist: number[];
  toggleWishlist: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      theme: "light",
      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),

      lang: "ar",
      toggleLang: () => set((s) => ({ lang: s.lang === "ar" ? "en" : "ar" })),

      user: null,
      setUser: (user) => set({ user }),

      cart: [],
      addToCart: (item) => {
        const cart = get().cart;
        const existing = cart.find(
          (c) => c.productId === item.productId && c.selectedSize === item.selectedSize && c.selectedColor === item.selectedColor
        );
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.productId === item.productId && c.selectedSize === item.selectedSize && c.selectedColor === item.selectedColor
                ? { ...c, quantity: Math.min(c.quantity + item.quantity, item.stock) }
                : c
            ),
          });
        } else {
          set({ cart: [...cart, item] });
        }
      },
      removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((c) => c.id !== id) })),
      updateQuantity: (id, qty) =>
        set((s) => ({
          cart: s.cart.map((c) => (c.id === id ? { ...c, quantity: Math.max(1, qty) } : c)),
        })),
      clearCart: () => set({ cart: [] }),
      cartCount: () => get().cart.reduce((sum, c) => sum + c.quantity, 0),
      cartTotal: () => get().cart.reduce((sum, c) => sum + c.price * c.quantity, 0),

      wishlist: [],
      toggleWishlist: (productId) => {
        const wl = get().wishlist;
        set({ wishlist: wl.includes(productId) ? wl.filter((id) => id !== productId) : [...wl, productId] });
      },
      isWishlisted: (productId) => get().wishlist.includes(productId),

      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      cartOpen: false,
      setCartOpen: (open) => set({ cartOpen: open }),
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),
    }),
    {
      name: "souq-aljumla-store",
      partialize: (state) => ({
        theme: state.theme,
        lang: state.lang,
        cart: state.cart,
        wishlist: state.wishlist,
        user: state.user,
      }),
    }
  )
);
