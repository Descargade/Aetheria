import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const cancellationsTable = pgTable("cancellations", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull(),
  telefono: text("telefono"),
  numeroPedido: text("numero_pedido").notNull(),
  motivo: text("motivo").notNull(),
  estado: text("estado").default("pendiente").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
