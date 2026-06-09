import { Router } from "express";
import { db } from "@workspace/db";
import { favoritesTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });

  const rows = await db
    .select({ fav: favoritesTable, product: productsTable, categoryName: categoriesTable.name })
    .from(favoritesTable)
    .leftJoin(productsTable, eq(favoritesTable.productId, productsTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(favoritesTable.sessionId, String(sessionId)));

  res.json(rows.map((r) => ({
    ...r.fav,
    product: r.product ? { ...r.product, price: Number(r.product.price), salePrice: r.product.salePrice != null ? Number(r.product.salePrice) : null, categoryName: r.categoryName ?? null } : null,
  })));
});

router.post("/", async (req, res) => {
  const { productId, sessionId } = req.body;
  const existing = await db.select().from(favoritesTable).where(and(eq(favoritesTable.productId, productId), eq(favoritesTable.sessionId, sessionId)));
  if (existing.length > 0) return res.status(201).json(existing[0]);
  const [row] = await db.insert(favoritesTable).values({ productId, sessionId }).returning();
  res.status(201).json(row);
});

router.delete("/:id", async (req, res) => {
  await db.delete(favoritesTable).where(eq(favoritesTable.id, Number(req.params.id)));
  res.status(204).send();
});

export default router;
