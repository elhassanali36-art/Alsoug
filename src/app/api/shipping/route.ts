import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shippingFees } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get("state");

    if (state) {
      const fee = await db
        .select()
        .from(shippingFees)
        .where(eq(shippingFees.state, state))
        .limit(1);
      return NextResponse.json({ fee: fee[0] ?? null });
    }

    const all = await db.select().from(shippingFees).where(eq(shippingFees.isActive, true));
    return NextResponse.json({ fees: all });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch shipping fees" }, { status: 500 });
  }
}
