import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories, brands } from "@/db/schema";
import { eq, desc, asc, ilike, and, or, lte, gte, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const flashDeal = searchParams.get("flash_deal");
    const bestSeller = searchParams.get("best_seller");
    const newArrival = searchParams.get("new_arrival");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const sort = searchParams.get("sort") || "createdAt_desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    const conditions = [eq(products.isActive, true)];

    if (category) {
      const cat = await db.select().from(categories).where(eq(categories.slug, category)).limit(1);
      if (cat[0]) conditions.push(eq(products.categoryId, cat[0].id));
    }
    if (brand) conditions.push(eq(products.brandId, parseInt(brand)));
    if (search) {
      conditions.push(
        or(
          ilike(products.nameAr, `%${search}%`),
          ilike(products.nameEn, `%${search}%`),
          ilike(products.descriptionAr, `%${search}%`)
        )!
      );
    }
    if (featured === "true") conditions.push(eq(products.isFeatured, true));
    if (flashDeal === "true") conditions.push(eq(products.isFlashDeal, true));
    if (bestSeller === "true") conditions.push(eq(products.isBestSeller, true));
    if (newArrival === "true") conditions.push(eq(products.isNewArrival, true));
    if (minPrice) conditions.push(gte(products.originalPrice, minPrice));
    if (maxPrice) conditions.push(lte(products.originalPrice, maxPrice));

    const [sortField, sortDir] = sort.split("_");
    const orderBy =
      sortField === "price"
        ? sortDir === "asc"
          ? asc(products.originalPrice)
          : desc(products.originalPrice)
        : sortField === "rating"
        ? desc(products.rating)
        : sortField === "sold"
        ? desc(products.soldCount)
        : desc(products.createdAt);

    const whereClause = and(...conditions);
    const [rows, countResult] = await Promise.all([
      db
        .select({
          id: products.id,
          nameAr: products.nameAr,
          nameEn: products.nameEn,
          slug: products.slug,
          images: products.images,
          originalPrice: products.originalPrice,
          discountPrice: products.discountPrice,
          wholesalePrice: products.wholesalePrice,
          rating: products.rating,
          reviewCount: products.reviewCount,
          stock: products.stock,
          isFeatured: products.isFeatured,
          isFlashDeal: products.isFlashDeal,
          isBestSeller: products.isBestSeller,
          isNewArrival: products.isNewArrival,
          soldCount: products.soldCount,
          sizes: products.sizes,
          colors: products.colors,
          categoryId: products.categoryId,
          categoryNameAr: categories.nameAr,
          brandNameEn: brands.nameEn,
          brandNameAr: brands.nameAr,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(whereClause),
    ]);

    return NextResponse.json({
      products: rows,
      total: Number(countResult[0]?.count ?? 0),
      page,
      limit,
      totalPages: Math.ceil(Number(countResult[0]?.count ?? 0) / limit),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
