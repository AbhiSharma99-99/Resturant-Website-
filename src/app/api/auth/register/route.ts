import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { hashPassword, createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const existing = await db.select().from(customers).where(eq(customers.email, email));
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    const result = await db.insert(customers).values({
      name,
      email,
      password: hashed,
      isBlocked: false,
      loyaltyPoints: 0,
    }).returning();

    const token = await createToken({ id: result[0].id, email, role: "customer" });

    return NextResponse.json({
      success: true,
      token,
      user: { id: result[0].id, name, email },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
