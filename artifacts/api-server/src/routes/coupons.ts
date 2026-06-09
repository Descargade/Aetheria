import { Router } from "express";
import { db } from "@workspace/db";
import { couponsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function fmt(c: typeof couponsTable.$inferSelect) {
  return { ...c, discountValue: Number(c.discountValue), minPurchase: c.minPurchase != null ? Number(c.minPurchase) : null };
}

router.get("/", async (_req, res) => {
  const rows = await db.select().from(couponsTable).orderBy(couponsTable.createdAt);
  res.json(rows.map(fmt));
});

router.post("/", async (req, res) => {
  const [row] = await db.insert(couponsTable).values(req.body).returning();
  res.status(201).json(fmt(row));
});

router.patch("/:id", async (req, res) => {
  const [row] = await db.update(couponsTable).set(req.body).where(eq(couponsTable.id, Number(req.params.id))).returning();
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(fmt(row));
});

router.delete("/:id", async (req, res) => {
  await db.delete(couponsTable).where(eq(couponsTable.id, Number(req.params.id)));
  res.status(204).send();
});

export default router;
