import { Router } from "express";
import { db } from "@workspace/db";
import { promotionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function fmt(p: typeof promotionsTable.$inferSelect) {
  return { ...p, discountValue: Number(p.discountValue) };
}

router.get("/active", async (_req, res) => {
  const now = new Date().toISOString().split("T")[0];
  const rows = await db.select().from(promotionsTable).where(eq(promotionsTable.active, true));
  const active = rows.filter((p) => {
    if (p.startDate && p.startDate > now) return false;
    if (p.endDate && p.endDate < now) return false;
    return true;
  });
  res.json(active.map(fmt));
});

router.get("/", async (_req, res) => {
  const rows = await db.select().from(promotionsTable).orderBy(promotionsTable.createdAt);
  res.json(rows.map(fmt));
});

router.post("/", async (req, res) => {
  const [row] = await db.insert(promotionsTable).values(req.body).returning();
  res.status(201).json(fmt(row));
});

router.patch("/:id", async (req, res) => {
  const [row] = await db.update(promotionsTable).set(req.body).where(eq(promotionsTable.id, Number(req.params.id))).returning();
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(fmt(row));
});

router.delete("/:id", async (req, res) => {
  await db.delete(promotionsTable).where(eq(promotionsTable.id, Number(req.params.id)));
  res.status(204).send();
});

export default router;
