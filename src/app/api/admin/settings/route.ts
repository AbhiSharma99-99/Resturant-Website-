import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select().from(settings);
    const obj: Record<string, string> = {};
    for (const s of all) obj[s.key] = s.value;
    return NextResponse.json(obj);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: Record<string, string> = await request.json();
    for (const [key, value] of Object.entries(body)) {
      const ex = await db.select().from(settings).where(eq(settings.key, key));
      if (ex.length > 0) {
        await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ key, value });
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
