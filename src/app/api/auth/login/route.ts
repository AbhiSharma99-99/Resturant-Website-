import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { verifyPassword, createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await db.select().from(customers).where(eq(customers.email, email));
    if (user.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user[0].isBlocked) {
      return NextResponse.json({ error: "Account blocked" }, { status: 403 });
    }

    const valid = await verifyPassword(password, user[0].password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createToken({ id: user[0].id, email, role: "customer" });

    return NextResponse.json({
      success: true,
      token,
      user: { id: user[0].id, name: user[0].name, email: user[0].email, phone: user[0].phone },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
