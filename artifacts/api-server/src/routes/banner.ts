import { Router } from "express";
import { db } from "@workspace/db";
import { bannerItemsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const items = await db.select().from(bannerItemsTable).orderBy(asc(bannerItemsTable.sortOrder));
  res.json(items);
});

router.get("/active", async (_req, res) => {
  const items = await db.select().from(bannerItemsTable).where(eq(bannerItemsTable.active, true)).orderBy(asc(bannerItemsTable.sortOrder));
  res.json(items);
});

router.post("/", async (req, res) => {
  const { text, sortOrder, active } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Texto es requerido" });
  }
  const [item] = await db.insert(bannerItemsTable).values({
    text,
    sortOrder: sortOrder ?? 0,
    active: active ?? true,
  }).returning();
  res.status(201).json(item);
});

router.patch("/:id", async (req, res) => {
  const { text, sortOrder, active } = req.body;
  const [item] = await db.update(bannerItemsTable).set({
    text: text ?? undefined,
    sortOrder: sortOrder ?? undefined,
    active: active ?? undefined,
  }).where(eq(bannerItemsTable.id, Number(req.params.id))).returning();
  if (!item) return res.status(404).json({ error: "No encontrado" });
  res.json(item);
});

router.delete("/:id", async (req, res) => {
  await db.delete(bannerItemsTable).where(eq(bannerItemsTable.id, Number(req.params.id)));
  res.status(204).send();
});

export default router;