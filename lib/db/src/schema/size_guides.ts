import { pgTable, serial, text, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sizeGuidesTable = pgTable("size_guides", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  tableData: jsonb("table_data"),
  instructions: text("instructions"),
  imageObjectPath: text("image_object_path"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productSizeGuidesTable = pgTable("product_size_guides", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  sizeGuideId: integer("size_guide_id").notNull().references(() => sizeGuidesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSizeGuideSchema = createInsertSchema(sizeGuidesTable).omit({ id: true, createdAt: true });
export type SizeGuide = typeof sizeGuidesTable.$inferSelect;
export type InsertSizeGuide = z.infer<typeof insertSizeGuideSchema>;
