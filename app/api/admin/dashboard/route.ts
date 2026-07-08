import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, customers, foods } from "@/db/schema";
import { eq, sql, count } from "drizzle-orm";

export async function GET() {
  try {
    const allOrders = await db.select().from(orders);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today);
    const totalRevenue = allOrders.filter(o => o.status === "delivered").reduce((s, o) => s + o.total, 0);
    const pendingOrders = allOrders.filter(o => o.status === "pending").length;
    const completedOrders = allOrders.filter(o => o.status === "delivered").length;
    const cancelledOrders = allOrders.filter(o => o.status === "cancelled").length;

    const customerCount = await db.select({ c: count() }).from(customers);
    const foodCount = await db.select({ c: count() }).from(foods);

    // Monthly data for charts
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = months.map((m, i) => {
      const monthOrders = allOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === i && d.getFullYear() === today.getFullYear();
      });
      return {
        month: m,
        orders: monthOrders.length,
        revenue: monthOrders.filter(o => o.status === "delivered").reduce((s, o) => s + o.total, 0),
      };
    });

    return NextResponse.json({
      totalOrders: allOrders.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      activeCustomers: customerCount[0]?.c ?? 0,
      totalFoods: foodCount[0]?.c ?? 0,
      monthlyData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
