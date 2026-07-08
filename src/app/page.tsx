import Link from "next/link";
import { db } from "@/db";
import { foods, categories, settings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const allFoods = await db.select().from(foods).where(eq(foods.isActive, true));
    const allCats = await db.select().from(categories).where(eq(categories.isActive, true));
    const allSettings = await db.select().from(settings);
    const settingsMap: Record<string, string> = {};
    for (const s of allSettings) settingsMap[s.key] = s.value;
    return { foods: allFoods, categories: allCats, settings: settingsMap };
  } catch {
    return { foods: [], categories: [], settings: {} };
  }
}

export default async function HomePage() {
  const data = await getData();
  return <HomeClient data={data} />;
}
