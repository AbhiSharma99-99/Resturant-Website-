import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();
    if (!code) return NextResponse.json({ error: "Coupon code required" }, { status: 400 });

    const coupon = await db.select().from(coupons).where(
      and(eq(coupons.code, code.toUpperCase()), eq(coupons.isActive, true))
    );

    if (coupon.length === 0) {
      return NextResponse.json({ error: "Invalid coupon" }, { status: 400 });
    }

    const c = coupon[0];
    if (c.expiryDate && new Date(c.expiryDate) < new Date()) {
      return NextResponse.json({ error: "Coupon expired" }, { status: 400 });
    }
    if (c.usedCount >= c.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }
    if (subtotal < c.minOrder) {
      return NextResponse.json({ error: `Minimum order ₹${c.minOrder} required` }, { status: 400 });
    }

    let discount = c.type === "percentage" ? (subtotal * c.value) / 100 : c.value;
    if (c.maxDiscount && discount > c.maxDiscount) discount = c.maxDiscount;

    return NextResponse.json({ success: true, discount, type: c.type, value: c.value });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
