import { pgTable, serial, text, boolean, timestamp, numeric, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shippingMethodsTable = pgTable("shipping_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  estimatedDays: text("estimated_days"),
  active: boolean("active").notNull().default(true),
  provider: text("provider").default("custom"),
  config: jsonb("config"),
  originZip: text("origin_zip"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shippingProvidersTable = pgTable("shipping_providers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  config: jsonb("config"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shipmentsTable = pgTable("shipments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  shippingMethodId: integer("shipping_method_id"),
  carrier: text("carrier"),
  trackingCode: text("tracking_code"),
  status: text("status").notNull().default("pending"),
  estimatedDays: text("estimated_days"),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull().default("0"),
  originZip: text("origin_zip"),
  destinationZip: text("destination_zip"),
  weight: numeric("weight", { precision: 10, scale: 2 }),
  carrierData: jsonb("carrier_data"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const storePickupConfigTable = pgTable("store_pickup_config", {
  id: serial("id").primaryKey(),
  enabled: boolean("enabled").notNull().default(true),
  address: text("address"),
  city: text("city"),
  province: text("province"),
  phone: text("phone"),
  hours: text("hours"),
  instructions: text("instructions"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertShippingMethodSchema = createInsertSchema(shippingMethodsTable).omit({ id: true, createdAt: true });
export const insertShippingProviderSchema = createInsertSchema(shippingProvidersTable).omit({ id: true, createdAt: true });
export const insertShipmentSchema = createInsertSchema(shipmentsTable).omit({ id: true, createdAt: true });
export const insertStorePickupConfigSchema = createInsertSchema(storePickupConfigTable).omit({ id: true, updatedAt: true });

export type InsertShippingMethod = z.infer<typeof insertShippingMethodSchema>;
export type ShippingMethod = typeof shippingMethodsTable.$inferSelect;
export type ShippingProvider = typeof shippingProvidersTable.$inferSelect;
export type Shipment = typeof shipmentsTable.$inferSelect;
export type StorePickupConfig = typeof storePickupConfigTable.$inferSelect;
