import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSDG(amount: number | string | null | undefined): string {
  const num = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  return new Intl.NumberFormat("ar-SD", {
    style: "currency",
    currency: "SDG",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("ar").format(num);
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SJ-${timestamp}-${random}`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100) + "-" + Date.now().toString(36);
}

export function calculateDiscount(original: number, discount: number): number {
  return Math.round(((original - discount) / original) * 100);
}

export const SUDANESE_STATES = [
  { en: "Khartoum", ar: "الخرطوم" },
  { en: "Omdurman", ar: "أم درمان" },
  { en: "Bahri", ar: "بحري" },
  { en: "Kassala", ar: "كسلا" },
  { en: "Port Sudan", ar: "بورتسودان" },
  { en: "Gedaref", ar: "القضارف" },
  { en: "Wad Madani", ar: "ود مدني" },
  { en: "El Obeid", ar: "الأبيض" },
  { en: "Atbara", ar: "عطبرة" },
  { en: "Nyala", ar: "نيالا" },
  { en: "El Fasher", ar: "الفاشر" },
  { en: "Rabak", ar: "ربك" },
  { en: "Sennar", ar: "سنار" },
  { en: "Dongola", ar: "دنقلا" },
  { en: "Ed Daein", ar: "الضعين" },
  { en: "Kadugli", ar: "كادوقلي" },
];

export const CATEGORIES = [
  { nameAr: "أزياء رجالية", nameEn: "Men's Fashion", slug: "mens-fashion", icon: "👔" },
  { nameAr: "أزياء نسائية", nameEn: "Women's Fashion", slug: "womens-fashion", icon: "👗" },
  { nameAr: "ملابس أطفال", nameEn: "Kids' Clothing", slug: "kids-clothing", icon: "🧒" },
  { nameAr: "الأحذية", nameEn: "Shoes", slug: "shoes", icon: "👟" },
  { nameAr: "الحقائب", nameEn: "Bags", slug: "bags", icon: "👜" },
  { nameAr: "الساعات", nameEn: "Watches", slug: "watches", icon: "⌚" },
  { nameAr: "العطور", nameEn: "Perfumes", slug: "perfumes", icon: "🌸" },
  { nameAr: "المجوهرات والإكسسوارات", nameEn: "Jewelry & Accessories", slug: "jewelry", icon: "💍" },
  { nameAr: "منتجات التجميل", nameEn: "Beauty Products", slug: "beauty", icon: "💄" },
  { nameAr: "الملابس الرياضية", nameEn: "Sportswear", slug: "sportswear", icon: "🏃" },
  { nameAr: "الملابس السودانية التقليدية", nameEn: "Traditional Sudanese Clothing", slug: "traditional", icon: "🧕" },
];
