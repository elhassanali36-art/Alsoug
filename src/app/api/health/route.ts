import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { seedDatabase } from "@/lib/seed";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    await seedDatabase();
    return NextResponse.json({ status: "ok", db: "connected", app: "سوق الجملة" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "error", error: String(error) }, { status: 500 });
  }
}
