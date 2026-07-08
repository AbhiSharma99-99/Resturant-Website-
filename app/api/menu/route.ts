import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { foods, categories } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const allCats = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder));

    let foodQuery = db.select().from(foods).where(eq(foods.isActive, true));

    const allFoods = await foodQuery;

    let filtered = allFoods;
    if (category && category !== "all") {
      const cat = allCats.find(c => c.slug === category);
      if (cat) filtered = filtered.filter(f => f.categoryId === cat.id);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(f => f.name.toLowerCase().includes(s) || (f.description && f.description.toLowerCase().includes(s)));
    }

    return NextResponse.json({ foods: filtered, categories: allCats });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
