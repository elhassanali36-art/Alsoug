import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories, brands } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { generateSlug } from "@/lib/utils";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: products.id,
        nameAr: products.nameAr,
        nameEn: products.nameEn,
        slug: products.slug,
        originalPrice: products.originalPrice,
        discountPrice: products.discountPrice,
        stock: products.stock,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        isFlashDeal: products.isFlashDeal,
        rating: products.rating,
        reviewCount: products.reviewCount,
        soldCount: products.soldCount,
        images: products.images,
        categoryNameAr: categories.nameAr,
        brandNameEn: brands.nameEn,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .orderBy(desc(products.createdAt));
    return NextResponse.json({ products: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = generateSlug(body.nameEn || body.nameAr);
    const newProduct = await db
      .insert(products)
      .values({ ...body, slug })
      .returning();
    return NextResponse.json({ product: newProduct[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;
    await db.update(products).set({ ...rest, updatedAt: new Date() }).where(eq(products.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.update(products).set({ isActive: false }).where(eq(products.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
