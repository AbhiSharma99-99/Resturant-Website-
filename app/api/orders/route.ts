import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = "FH" + Date.now().toString(36).toUpperCase() + uuidv4().slice(0, 4).toUpperCase();

    const result = await db.insert(orders).values({
      orderId,
      customerId: body.customerId || 0,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail || "",
      address: body.address,
      items: body.items,
      subtotal: body.subtotal,
      deliveryCharge: body.deliveryCharge || 0,
      gst: body.gst || 0,
      discount: body.discount || 0,
      total: body.total,
      couponCode: body.couponCode || null,
      paymentMethod: body.paymentMethod,
      paymentScreenshot: body.paymentScreenshot || null,
      transactionId: body.transactionId || null,
      status: "pending",
      deliveryInstructions: body.deliveryInstructions || null,
      estimatedDelivery: "30-45 min",
    }).returning();

    return NextResponse.json({ success: true, order: result[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Order failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const orderId = searchParams.get("orderId");

    if (orderId) {
      const result = await db.select().from(orders).where(eq(orders.orderId, orderId));
      return NextResponse.json(result[0] || null);
    }

    if (customerId) {
      const result = await db.select().from(orders)
        .where(eq(orders.customerId, parseInt(customerId)))
        .orderBy(desc(orders.createdAt));
      return NextResponse.json(result);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
