import { NextResponse } from "next/server";
import { db } from "@/db";
import { admins, categories, foods, settings } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    // Seed admin
    const existing = await db.select().from(admins).where(eq(admins.username, "Abhay"));
    if (existing.length === 0) {
      const hashed = await hashPassword("@Abhay95987");
      await db.insert(admins).values({ username: "Abhay", password: hashed });
    }

    // Seed categories
    const cats = [
      { name: "Pizza", slug: "pizza" },
      { name: "Burger", slug: "burger" },
      { name: "Chinese", slug: "chinese" },
      { name: "Drinks", slug: "drinks" },
      { name: "Desserts", slug: "desserts" },
      { name: "Indian", slug: "indian" },
      { name: "Combos", slug: "combos" },
      { name: "Special Offers", slug: "special-offers" },
    ];

    for (const cat of cats) {
      const ex = await db.select().from(categories).where(eq(categories.slug, cat.slug));
      if (ex.length === 0) {
        await db.insert(categories).values({ ...cat, isActive: true, sortOrder: 0 });
      }
    }

    // Seed sample foods
    const allCats = await db.select().from(categories);
    const catMap: Record<string, number> = {};
    for (const c of allCats) catMap[c.slug] = c.id;

    const sampleFoods = [
      { name: "Margherita Pizza", slug: "margherita-pizza", description: "Classic Italian pizza with fresh mozzarella, basil, and tomato sauce on a crispy thin crust.", price: 299, discountPrice: 249, categoryId: catMap["pizza"], isVeg: true, isBestseller: true, isNew: false, prepTime: "20 min", rating: 4.5, reviewCount: 128 },
      { name: "Pepperoni Feast", slug: "pepperoni-feast", description: "Loaded with double pepperoni, mozzarella cheese, and our signature marinara sauce.", price: 449, discountPrice: null, categoryId: catMap["pizza"], isVeg: false, isBestseller: true, isNew: false, prepTime: "25 min", rating: 4.7, reviewCount: 95 },
      { name: "Classic Cheese Burger", slug: "classic-cheese-burger", description: "Juicy beef patty with melted cheddar, lettuce, tomato, and our special sauce.", price: 199, discountPrice: 149, categoryId: catMap["burger"], isVeg: false, isBestseller: true, isNew: false, prepTime: "15 min", rating: 4.3, reviewCount: 210 },
      { name: "Veggie Supreme Burger", slug: "veggie-supreme-burger", description: "Crispy vegetable patty with fresh veggies and creamy mayo.", price: 179, discountPrice: null, categoryId: catMap["burger"], isVeg: true, isBestseller: false, isNew: true, prepTime: "15 min", rating: 4.1, reviewCount: 65 },
      { name: "Hakka Noodles", slug: "hakka-noodles", description: "Stir-fried noodles with fresh vegetables and Indo-Chinese spices.", price: 189, discountPrice: 159, categoryId: catMap["chinese"], isVeg: true, isBestseller: false, isNew: false, prepTime: "18 min", rating: 4.2, reviewCount: 87 },
      { name: "Chicken Manchurian", slug: "chicken-manchurian", description: "Crispy fried chicken in tangy Manchurian sauce with bell peppers.", price: 259, discountPrice: null, categoryId: catMap["chinese"], isVeg: false, isBestseller: true, isNew: false, prepTime: "20 min", rating: 4.6, reviewCount: 143 },
      { name: "Mango Lassi", slug: "mango-lassi", description: "Refreshing yogurt-based drink blended with fresh Alphonso mangoes.", price: 99, discountPrice: 79, categoryId: catMap["drinks"], isVeg: true, isBestseller: false, isNew: false, prepTime: "5 min", rating: 4.4, reviewCount: 56 },
      { name: "Cold Coffee", slug: "cold-coffee", description: "Rich and creamy iced coffee blended with premium coffee beans and cream.", price: 149, discountPrice: null, categoryId: catMap["drinks"], isVeg: true, isBestseller: false, isNew: true, prepTime: "5 min", rating: 4.5, reviewCount: 78 },
      { name: "Chocolate Lava Cake", slug: "chocolate-lava-cake", description: "Warm chocolate cake with a molten center, served with vanilla ice cream.", price: 199, discountPrice: 169, categoryId: catMap["desserts"], isVeg: true, isBestseller: true, isNew: false, prepTime: "15 min", rating: 4.8, reviewCount: 198 },
      { name: "Butter Chicken", slug: "butter-chicken", description: "Tender chicken in a rich, creamy tomato-based curry with aromatic spices.", price: 329, discountPrice: 289, categoryId: catMap["indian"], isVeg: false, isBestseller: true, isNew: false, prepTime: "30 min", rating: 4.7, reviewCount: 245 },
      { name: "Paneer Tikka", slug: "paneer-tikka", description: "Marinated cottage cheese cubes grilled to perfection with smoky flavors.", price: 249, discountPrice: null, categoryId: catMap["indian"], isVeg: true, isBestseller: false, isNew: false, prepTime: "20 min", rating: 4.4, reviewCount: 112 },
      { name: "Family Combo", slug: "family-combo", description: "2 Pizzas + 4 Burgers + 4 Drinks + 1 Dessert - Perfect for family gatherings.", price: 1499, discountPrice: 999, categoryId: catMap["combos"], isVeg: false, isBestseller: true, isNew: true, prepTime: "35 min", rating: 4.6, reviewCount: 67 },
    ];

    for (const food of sampleFoods) {
      if (!food.categoryId) continue;
      const ex = await db.select().from(foods).where(eq(foods.slug, food.slug));
      if (ex.length === 0) {
        await db.insert(foods).values({
          ...food,
          images: [],
          isOutOfStock: false,
          isActive: true,
        });
      }
    }

    // Seed settings
    const defaultSettings: Record<string, string> = {
      restaurant_name: "Flavour House",
      restaurant_tagline: "Where Every Bite Tells a Story",
      restaurant_phone: "+91 98765 43210",
      restaurant_email: "hello@flavourhouse.com",
      restaurant_address: "123 Gourmet Street, Food District, Mumbai 400001",
      opening_hours: "11:00 AM",
      closing_hours: "11:00 PM",
      delivery_charge: "40",
      min_order: "200",
      gst_percentage: "5",
      whatsapp_number: "919876543210",
      upi_id: "flavourhouse@upi",
      account_holder: "Flavour House Restaurant",
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      const ex = await db.select().from(settings).where(eq(settings.key, key));
      if (ex.length === 0) {
        await db.insert(settings).values({ key, value });
      }
    }

    return NextResponse.json({ success: true, message: "Seed completed" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Seed failed", details: String(error) },
      { status: 500 }
    );
  }
}
