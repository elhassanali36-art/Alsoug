import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || (!email && !phone) || !password) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
    }

    if (email) {
      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing[0]) {
        return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
      }
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = await db
      .insert(users)
      .values({ name, email, phone, passwordHash: hash, role: "customer" })
      .returning();

    return NextResponse.json({
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        phone: newUser[0].phone,
        role: newUser[0].role,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل إنشاء الحساب" }, { status: 500 });
  }
}
