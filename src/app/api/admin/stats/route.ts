import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, users, products, sellers } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET() {
  try {
    const [
      totalOrdersResult,
      totalRevenueResult,
      totalUsersResult,
      totalProductsResult,
      pendingOrdersResult,
      pendingPaymentsResult,
      recentOrdersResult,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(orders),
      db.select({ sum: sql<string>`coalesce(sum(total), 0)` }).from(orders).where(eq(orders.paymentStatus, "verified")),
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.isActive, true)),
      db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending")),
      db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.paymentStatus, "pending_verification")),
      db.select().from(orders).orderBy(sql`${orders.createdAt} DESC`).limit(5),
    ]);

    return NextResponse.json({
      totalOrders: Number(totalOrdersResult[0]?.count ?? 0),
      totalRevenue: parseFloat(totalRevenueResult[0]?.sum ?? "0"),
      totalUsers: Number(totalUsersResult[0]?.count ?? 0),
      totalProducts: Number(totalProductsResult[0]?.count ?? 0),
      pendingOrders: Number(pendingOrdersResult[0]?.count ?? 0),
      pendingPayments: Number(pendingPaymentsResult[0]?.count ?? 0),
      recentOrders: recentOrdersResult,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
