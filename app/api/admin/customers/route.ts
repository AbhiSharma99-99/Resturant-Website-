import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      phone: customers.phone,
      isBlocked: customers.isBlocked,
      loyaltyPoints: customers.loyaltyPoints,
      createdAt: customers.createdAt,
    }).from(customers).orderBy(desc(customers.createdAt));
    return NextResponse.json(all);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    await db.update(customers).set(data).where(eq(customers.id, id));
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
    await db.delete(customers).where(eq(customers.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
