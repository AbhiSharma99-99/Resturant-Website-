import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { foods } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const allFoods = await db.select().from(foods).orderBy(desc(foods.createdAt));
    return NextResponse.json(allFoods);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch foods" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const result = await db.insert(foods).values({
      name: body.name,
      slug,
      description: body.description || "",
      price: body.price,
      discountPrice: body.discountPrice || null,
      categoryId: body.categoryId,
      images: body.images || [],
      isVeg: body.isVeg ?? true,
      isBestseller: body.isBestseller ?? false,
      isNew: body.isNew ?? false,
      isOutOfStock: body.isOutOfStock ?? false,
      prepTime: body.prepTime || "20 min",
      rating: 0,
      reviewCount: 0,
      isActive: true,
    }).returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create food" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    await db.update(foods).set(data).where(eq(foods.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update food" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.delete(foods).where(eq(foods.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete food" }, { status: 500 });
  }
}
