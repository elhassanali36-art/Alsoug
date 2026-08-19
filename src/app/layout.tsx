import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "سوق الجملة | Souq Aljumla - أفضل سوق إلكتروني في السودان",
  description: "سوق الجملة - تسوق أزياء رجالية ونسائية وأطفال، أحذية، حقائب، ساعات، عطور، مجوهرات وأكثر. أسعار الجملة والتجزئة بالجنيه السوداني.",
  keywords: "سوق الجملة, تسوق سوداني, ملابس, أزياء, أحذية, حقائب, جنيه سوداني, souq aljumla, sudan shopping",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white antialiased min-h-screen transition-colors duration-300" style={{ fontFamily: "'Cairo', 'Segoe UI', Arial, sans-serif" }}>
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
