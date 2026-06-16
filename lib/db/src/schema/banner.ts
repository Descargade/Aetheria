import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bannerItemsTable = pgTable("banner_items", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBannerItemSchema = createInsertSchema(bannerItemsTable).omit({ id: true, createdAt: true });
export type InsertBannerItem = z.infer<typeof insertBannerItemSchema>;
export type BannerItem = typeof bannerItemsTable.$inferSelect;