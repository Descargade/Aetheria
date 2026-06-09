import { Router } from "express";
import { db } from "@workspace/db";
import { paymentMethodsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function fmt(p: typeof paymentMethodsTable.$inferSelect) {
  return { ...p, discount: Number(p.discount) };
}

router.get("/", async (_req, res) => {
  const rows = await db.select().from(paymentMethodsTable).orderBy(paymentMethodsTable.name);
  res.json(rows.map(fmt));
});

router.post("/", async (req, res) => {
  const [row] = await db.insert(paymentMethodsTable).values(req.body).returning();
  res.status(201).json(fmt(row));
});

router.patch("/:id", async (req, res) => {
  const [row] = await db.update(paymentMethodsTable).set(req.body).where(eq(paymentMethodsTable.id, Number(req.params.id))).returning();
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(fmt(row));
});

router.delete("/:id", async (req, res) => {
  await db.delete(paymentMethodsTable).where(eq(paymentMethodsTable.id, Number(req.params.id)));
  res.status(204).send();
});

export default router;
