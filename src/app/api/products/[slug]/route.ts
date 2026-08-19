import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories, brands, sellers, reviews, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(sellers, eq(products.sellerId, sellers.id))
      .where(eq(products.slug, slug))
      .limit(1);

    if (!product[0]) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Increment view count
    await db
      .update(products)
      .set({ viewCount: sql`${products.viewCount} + 1` })
      .where(eq(products.slug, slug));

    // Get reviews
    const productReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        images: reviews.images,
        sellerReply: reviews.sellerReply,
        isVerified: reviews.isVerified,
        createdAt: reviews.createdAt,
        userName: users.name,
        userAvatar: users.avatar,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, product[0].products.id))
      .orderBy(desc(reviews.createdAt))
      .limit(20);

    // Get related products
    const related = await db
      .select({
        id: products.id,
        nameAr: products.nameAr,
        slug: products.slug,
        images: products.images,
        originalPrice: products.originalPrice,
        discountPrice: products.discountPrice,
        rating: products.rating,
      })
      .from(products)
      .where(eq(products.categoryId, product[0].products.categoryId))
      .limit(6);

    return NextResponse.json({
      product: product[0],
      reviews: productReviews,
      related,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
