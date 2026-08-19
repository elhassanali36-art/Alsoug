import { NextResponse } from "next/server";
import { db } from "@/db";
import { paymentMethods } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const methods = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.isActive, true))
      .orderBy(asc(paymentMethods.sortOrder));
    return NextResponse.json({ methods });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 });
  }
}
