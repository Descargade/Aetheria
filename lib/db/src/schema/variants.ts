import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { productsTable } from "./products";

export const variantsTable = pgTable("variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
  colorName: text("color_name").notNull(),
  colorHex: text("color_hex").notNull().default("#000000"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const variantImagesTable = pgTable("variant_images", {
  id: serial("id").primaryKey(),
  variantId: integer("variant_id").notNull().references(() => variantsTable.id, { onDelete: "cascade" }),
  objectPath: text("object_path").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const variantSizesTable = pgTable("variant_sizes", {
  id: serial("id").primaryKey(),
  variantId: integer("variant_id").notNull().references(() => variantsTable.id, { onDelete: "cascade" }),
  size: text("size").notNull(),
  stock: integer("stock").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVariantSchema = createInsertSchema(variantsTable).omit({ id: true, createdAt: true });
export const insertVariantImageSchema = createInsertSchema(variantImagesTable).omit({ id: true, createdAt: true });
export const insertVariantSizeSchema = createInsertSchema(variantSizesTable).omit({ id: true, createdAt: true });

export type Variant = typeof variantsTable.$inferSelect;
export type VariantImage = typeof variantImagesTable.$inferSelect;
export type VariantSize = typeof variantSizesTable.$inferSelect;
export type InsertVariant = z.infer<typeof insertVariantSchema>;
export type InsertVariantImage = z.infer<typeof insertVariantImageSchema>;
export type InsertVariantSize = z.infer<typeof insertVariantSizeSchema>;
