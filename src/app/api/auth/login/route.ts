import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user[0] || !user[0].passwordHash) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user[0].passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    if (!user[0].isActive) {
      return NextResponse.json({ error: "الحساب موقوف" }, { status: 403 });
    }

    return NextResponse.json({
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        phone: user[0].phone,
        role: user[0].role,
        avatar: user[0].avatar,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل تسجيل الدخول" }, { status: 500 });
  }
}
