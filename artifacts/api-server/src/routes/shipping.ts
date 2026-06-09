import { Router } from "express";
import { db } from "@workspace/db";
import { shippingMethodsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function fmt(s: typeof shippingMethodsTable.$inferSelect) {
  return { ...s, price: Number(s.price) };
}

router.get("/", async (_req, res) => {
  const rows = await db.select().from(shippingMethodsTable).orderBy(shippingMethodsTable.name);
  res.json(rows.map(fmt));
});

router.post("/", async (req, res) => {
  const [row] = await db.insert(shippingMethodsTable).values(req.body).returning();
  res.status(201).json(fmt(row));
});

router.patch("/:id", async (req, res) => {
  const [row] = await db.update(shippingMethodsTable).set(req.body).where(eq(shippingMethodsTable.id, Number(req.params.id))).returning();
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(fmt(row));
});

router.delete("/:id", async (req, res) => {
  await db.delete(shippingMethodsTable).where(eq(shippingMethodsTable.id, Number(req.params.id)));
  res.status(204).send();
});

export default router;
