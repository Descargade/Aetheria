import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const storeConfigTable = pgTable("store_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
