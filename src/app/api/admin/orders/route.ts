import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, users, addresses } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        paymentMethod: orders.paymentMethod,
        total: orders.total,
        subtotal: orders.subtotal,
        shippingFee: orders.shippingFee,
        discount: orders.discount,
        deliveryType: orders.deliveryType,
        transactionNumber: orders.transactionNumber,
        notes: orders.notes,
        adminNotes: orders.adminNotes,
        createdAt: orders.createdAt,
        userName: users.name,
        userPhone: users.phone,
        userEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(100);

    return NextResponse.json({ orders: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, status, paymentStatus, adminNotes } = await req.json();
    await db
      .update(orders)
      .set({
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(adminNotes !== undefined && { adminNotes }),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
