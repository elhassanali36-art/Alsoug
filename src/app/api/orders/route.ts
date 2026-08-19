import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, cartItems, products, coupons, shippingFees, addresses } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      address,
      paymentMethod,
      deliveryType,
      couponCode,
      cartItemIds,
      items,
      notes,
      transactionNumber,
    } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Calculate subtotal
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }

    // Get shipping fee
    let shippingFee = 0;
    if (deliveryType === "home_delivery" && address?.state) {
      const fee = await db
        .select()
        .from(shippingFees)
        .where(eq(shippingFees.state, address.state))
        .limit(1);
      shippingFee = fee[0] ? parseFloat(fee[0].fee) : 1500;
      if (subtotal >= 50000) shippingFee = 0; // Free shipping
    }

    // Apply coupon
    let discount = 0;
    let couponId = null;
    if (couponCode) {
      const coupon = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, couponCode.toUpperCase()))
        .limit(1);
      if (coupon[0] && coupon[0].isActive) {
        couponId = coupon[0].id;
        if (coupon[0].discountType === "percentage") {
          discount = (subtotal * parseFloat(coupon[0].discountValue)) / 100;
          if (coupon[0].maxDiscount) {
            discount = Math.min(discount, parseFloat(coupon[0].maxDiscount));
          }
        } else {
          discount = parseFloat(coupon[0].discountValue);
        }
        // Increment usage
        await db
          .update(coupons)
          .set({ usedCount: sql`${coupons.usedCount} + 1` })
          .where(eq(coupons.id, coupon[0].id));
      }
    }

    const total = subtotal + shippingFee - discount;

    // Save address if provided
    let addressId = null;
    if (address && userId) {
      const savedAddr = await db
        .insert(addresses)
        .values({
          userId,
          fullName: address.fullName,
          phone: address.phone,
          alternativePhone: address.alternativePhone,
          state: address.state,
          city: address.city,
          detailedAddress: address.detailedAddress,
          notes: address.deliveryNotes,
        })
        .returning();
      addressId = savedAddr[0]?.id;
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const newOrder = await db
      .insert(orders)
      .values({
        orderNumber,
        userId,
        addressId,
        status: "pending",
        paymentStatus: paymentMethod === "cash_on_delivery" ? "pending" : "pending_verification",
        paymentMethod,
        deliveryType: deliveryType || "home_delivery",
        subtotal: subtotal.toString(),
        shippingFee: shippingFee.toString(),
        discount: discount.toString(),
        total: total.toString(),
        couponId,
        couponCode: couponCode || null,
        notes,
        transactionNumber,
      })
      .returning();

    // Create order items
    await db.insert(orderItems).values(
      items.map((item: { productId: number; sellerId?: number; productName: string; productImage?: string; quantity: number; price: number; selectedSize?: string; selectedColor?: string }) => ({
        orderId: newOrder[0].id,
        productId: item.productId,
        sellerId: item.sellerId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        price: item.price.toString(),
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      }))
    );

    // Update product sold counts and stock
    for (const item of items) {
      await db
        .update(products)
        .set({
          soldCount: sql`${products.soldCount} + ${item.quantity}`,
          stock: sql`${products.stock} - ${item.quantity}`,
        })
        .where(eq(products.id, item.productId));
    }

    return NextResponse.json({
      success: true,
      order: newOrder[0],
      orderNumber,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, parseInt(userId)))
      .orderBy(sql`${orders.createdAt} DESC`);

    return NextResponse.json({ orders: userOrders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
