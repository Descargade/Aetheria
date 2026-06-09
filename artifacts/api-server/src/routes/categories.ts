import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const rows = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  res.json(rows);
});

router.post("/", async (req, res) => {
  const [row] = await db.insert(categoriesTable).values(req.body).returning();
  res.status(201).json(row);
});

router.get("/:id", async (req, res) => {
  const [row] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, Number(req.params.id)));
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

router.patch("/:id", async (req, res) => {
  const [row] = await db.update(categoriesTable).set(req.body).where(eq(categoriesTable.id, Number(req.params.id))).returning();
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

router.delete("/:id", async (req, res) => {
  await db.delete(categoriesTable).where(eq(categoriesTable.id, Number(req.params.id)));
  res.status(204).send();
});

export default router;
