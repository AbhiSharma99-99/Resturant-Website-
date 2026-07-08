import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  real,
  serial,
  jsonb,
} from "drizzle-orm/pg-core";

// Admin users table
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  image: text("image"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Food items table
export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  price: real("price").notNull(),
  discountPrice: real("discount_price"),
  categoryId: integer("category_id").notNull(),
  images: jsonb("images").$type<string[]>().default([]),
  isVeg: boolean("is_veg").default(true).notNull(),
  isBestseller: boolean("is_bestseller").default(false).notNull(),
  isNew: boolean("is_new").default(false).notNull(),
  isOutOfStock: boolean("is_out_of_stock").default(false).notNull(),
  prepTime: varchar("prep_time", { length: 50 }),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  phone: varchar("phone", { length: 20 }),
  isBlocked: boolean("is_blocked").default(false).notNull(),
  loyaltyPoints: integer("loyalty_points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Customer addresses
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  pinCode: varchar("pin_code", { length: 10 }).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 20 }).notNull().unique(),
  customerId: integer("customer_id").notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }),
  address: text("address").notNull(),
  items: jsonb("items").$type<Array<{
    foodId: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>>().notNull(),
  subtotal: real("subtotal").notNull(),
  deliveryCharge: real("delivery_charge").default(0).notNull(),
  gst: real("gst").default(0).notNull(),
  discount: real("discount").default(0).notNull(),
  total: real("total").notNull(),
  couponCode: varchar("coupon_code", { length: 50 }),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentScreenshot: text("payment_screenshot"),
  transactionId: varchar("transaction_id", { length: 100 }),
  status: varchar("status", { length: 30 }).default("pending").notNull(),
  deliveryInstructions: text("delivery_instructions"),
  estimatedDelivery: varchar("estimated_delivery", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Coupons table
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  type: varchar("type", { length: 20 }).notNull(), // percentage, flat
  value: real("value").notNull(),
  minOrder: real("min_order").default(0).notNull(),
  maxDiscount: real("max_discount"),
  usageLimit: integer("usage_limit").default(100).notNull(),
  usedCount: integer("used_count").default(0).notNull(),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  foodId: integer("food_id").notNull(),
  customerId: integer("customer_id").notNull(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isApproved: boolean("is_approved").default(false).notNull(),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Banners table
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  subtitle: text("subtitle"),
  image: text("image").notNull(),
  link: text("link"),
  type: varchar("type", { length: 30 }).default("homepage").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Wishlist
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  foodId: integer("food_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
