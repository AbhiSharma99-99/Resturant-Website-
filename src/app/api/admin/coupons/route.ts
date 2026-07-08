import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
    return NextResponse.json(all);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(coupons).values({
      code: body.code.toUpperCase(),
      type: body.type,
      value: body.value,
      minOrder: body.minOrder || 0,
      maxDiscount: body.maxDiscount || null,
      usageLimit: body.usageLimit || 100,
      usedCount: 0,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      isActive: true,
    }).returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (data.expiryDate) data.expiryDate = new Date(data.expiryDate);
    await db.update(coupons).set(data).where(eq(coupons.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.delete(coupons).where(eq(coupons.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
