import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { code, orderAmount } = await req.json();
    if (!code) return NextResponse.json({ error: "الكود مطلوب" }, { status: 400 });

    const coupon = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code.toUpperCase()))
      .limit(1);

    if (!coupon[0]) return NextResponse.json({ error: "الكود غير صحيح" }, { status: 404 });
    if (!coupon[0].isActive) return NextResponse.json({ error: "الكود غير فعال" }, { status: 400 });
    if (coupon[0].expiresAt && new Date(coupon[0].expiresAt) < new Date()) {
      return NextResponse.json({ error: "انتهت صلاحية الكود" }, { status: 400 });
    }
    if (coupon[0].usageLimit && (coupon[0].usedCount ?? 0) >= coupon[0].usageLimit) {
      return NextResponse.json({ error: "تم استخدام الكود بالحد الأقصى" }, { status: 400 });
    }
    if (coupon[0].minOrderAmount && orderAmount < parseFloat(coupon[0].minOrderAmount)) {
      return NextResponse.json({ error: `الحد الأدنى للطلب ${coupon[0].minOrderAmount} جنيه` }, { status: 400 });
    }

    let discount = 0;
    if (coupon[0].discountType === "percentage") {
      discount = (orderAmount * parseFloat(coupon[0].discountValue)) / 100;
      if (coupon[0].maxDiscount) discount = Math.min(discount, parseFloat(coupon[0].maxDiscount));
    } else {
      discount = parseFloat(coupon[0].discountValue);
    }

    return NextResponse.json({ valid: true, discount, coupon: coupon[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
