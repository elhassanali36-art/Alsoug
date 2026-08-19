import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["customer", "seller", "admin"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "pending_verification",
  "verified",
  "failed",
  "refunded",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "bankak",
  "ocash",
  "fawry",
  "mycashi",
  "bank_transfer",
  "cash_on_delivery",
]);
export const deliveryTypeEnum = pgEnum("delivery_type", ["home_delivery", "pickup"]);
export const sellerStatusEnum = pgEnum("seller_status", ["pending", "approved", "suspended"]);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").default("customer").notNull(),
  avatar: text("avatar"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sellers
export const sellers = pgTable("sellers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  storeName: varchar("store_name", { length: 255 }).notNull(),
  storeNameAr: varchar("store_name_ar", { length: 255 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  logo: text("logo"),
  banner: text("banner"),
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  status: sellerStatusEnum("status").default("pending").notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalSales: integer("total_sales").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  icon: text("icon"),
  image: text("image"),
  parentId: integer("parent_id"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Brands
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  logo: text("logo"),
  isActive: boolean("is_active").default(true).notNull(),
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").references(() => sellers.id),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  brandId: integer("brand_id").references(() => brands.id),
  nameAr: varchar("name_ar", { length: 500 }).notNull(),
  nameEn: varchar("name_en", { length: 500 }),
  slug: varchar("slug", { length: 500 }).unique().notNull(),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  sku: varchar("sku", { length: 100 }),
  images: jsonb("images").$type<string[]>().default([]),
  videoUrl: text("video_url"),
  originalPrice: decimal("original_price", { precision: 12, scale: 2 }).notNull(),
  discountPrice: decimal("discount_price", { precision: 12, scale: 2 }),
  wholesalePrice: decimal("wholesale_price", { precision: 12, scale: 2 }),
  retailPrice: decimal("retail_price", { precision: 12, scale: 2 }),
  stock: integer("stock").default(0).notNull(),
  material: varchar("material", { length: 255 }),
  sizes: jsonb("sizes").$type<string[]>().default([]),
  colors: jsonb("colors").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false),
  isFlashDeal: boolean("is_flash_deal").default(false),
  isBestSeller: boolean("is_best_seller").default(false),
  isNewArrival: boolean("is_new_arrival").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  viewCount: integer("view_count").default(0),
  soldCount: integer("sold_count").default(0),
  weight: decimal("weight", { precision: 8, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  images: jsonb("images").$type<string[]>().default([]),
  sellerReply: text("seller_reply"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Wishlists
export const wishlists = pgTable("wishlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cart Items
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  selectedSize: varchar("selected_size", { length: 50 }),
  selectedColor: varchar("selected_color", { length: 50 }),
  savedForLater: boolean("saved_for_later").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Addresses
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  alternativePhone: varchar("alternative_phone", { length: 20 }),
  state: varchar("state", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  detailedAddress: text("detailed_address").notNull(),
  notes: text("notes"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Coupons
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  discountType: varchar("discount_type", { length: 20 }).notNull(), // percentage | fixed
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shipping Fees by State
export const shippingFees = pgTable("shipping_fees", {
  id: serial("id").primaryKey(),
  state: varchar("state", { length: 100 }).notNull(),
  stateAr: varchar("state_ar", { length: 100 }).notNull(),
  fee: decimal("fee", { precision: 10, scale: 2 }).notNull(),
  estimatedDays: integer("estimated_days").default(3),
  isActive: boolean("is_active").default(true),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).unique().notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  addressId: integer("address_id").references(() => addresses.id),
  status: orderStatusEnum("status").default("pending").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").default("pending").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  deliveryType: deliveryTypeEnum("delivery_type").default("home_delivery").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  couponId: integer("coupon_id").references(() => coupons.id),
  couponCode: varchar("coupon_code", { length: 50 }),
  notes: text("notes"),
  transactionNumber: varchar("transaction_number", { length: 255 }),
  paymentScreenshot: text("payment_screenshot"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  sellerId: integer("seller_id").references(() => sellers.id),
  productName: varchar("product_name", { length: 500 }).notNull(),
  productImage: text("product_image"),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  selectedSize: varchar("selected_size", { length: 50 }),
  selectedColor: varchar("selected_color", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payment Methods Configuration
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  icon: text("icon"),
  accountNumber: varchar("account_number", { length: 255 }),
  accountName: varchar("account_name", { length: 255 }),
  instructions: text("instructions"),
  instructionsAr: text("instructions_ar"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});

// Banners/Sliders
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  titleAr: varchar("title_ar", { length: 255 }),
  titleEn: varchar("title_en", { length: 255 }),
  subtitleAr: text("subtitle_ar"),
  image: text("image").notNull(),
  link: text("link"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  titleAr: varchar("title_ar", { length: 255 }).notNull(),
  titleEn: varchar("title_en", { length: 255 }),
  messageAr: text("message_ar").notNull(),
  messageEn: text("message_en"),
  type: varchar("type", { length: 50 }).default("general"),
  isRead: boolean("is_read").default(false),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Exchange Rate Settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).unique().notNull(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Recently Viewed
export const recentlyViewed = pgTable("recently_viewed", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  seller: one(sellers, { fields: [users.id], references: [sellers.userId] }),
  reviews: many(reviews),
  wishlists: many(wishlists),
  cartItems: many(cartItems),
  addresses: many(addresses),
  orders: many(orders),
  notifications: many(notifications),
}));

export const sellersRelations = relations(sellers, ({ one, many }) => ({
  user: one(users, { fields: [sellers.userId], references: [users.id] }),
  products: many(products),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(sellers, { fields: [products.sellerId], references: [sellers.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  reviews: many(reviews),
  wishlists: many(wishlists),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  address: one(addresses, { fields: [orders.addressId], references: [addresses.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));
