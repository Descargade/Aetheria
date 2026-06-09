import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, isNotNull, sql } from "drizzle-orm";

const router = Router();

function buildProduct(p: typeof productsTable.$inferSelect, categoryName?: string | null) {
  return {
    ...p,
    price: Number(p.price),
    salePrice: p.salePrice != null ? Number(p.salePrice) : null,
    categoryName: categoryName ?? null,
  };
}

router.get("/featured", async (req, res) => {
  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(eq(productsTable.featured, true), eq(productsTable.active, true)))
    .limit(12);
  res.json(rows.map((r) => buildProduct(r.product, r.categoryName)));
});

router.get("/new-arrivals", async (req, res) => {
  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(eq(productsTable.isNew, true), eq(productsTable.active, true)))
    .limit(12);
  res.json(rows.map((r) => buildProduct(r.product, r.categoryName)));
});

router.get("/on-sale", async (req, res) => {
  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(and(isNotNull(productsTable.salePrice), eq(productsTable.active, true)))
    .limit(20);
  res.json(rows.map((r) => buildProduct(r.product, r.categoryName)));
});

router.get("/", async (req, res) => {
  const { categoryId, search, minPrice, maxPrice, color, size, inStock, onSale, featured, isNew } = req.query;
  const conditions: ReturnType<typeof eq>[] = [eq(productsTable.active, true)];

  if (categoryId) conditions.push(eq(productsTable.categoryId, Number(categoryId)));
  if (minPrice) conditions.push(gte(productsTable.price, String(minPrice)));
  if (maxPrice) conditions.push(lte(productsTable.price, String(maxPrice)));
  if (inStock === "true") conditions.push(gte(productsTable.stock, 1));
  if (onSale === "true") conditions.push(isNotNull(productsTable.salePrice));
  if (featured === "true") conditions.push(eq(productsTable.featured, true));
  if (isNew === "true") conditions.push(eq(productsTable.isNew, true));
  if (search) conditions.push(ilike(productsTable.name, `%${String(search)}%`));

  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(productsTable.createdAt);

  let results = rows.map((r) => buildProduct(r.product, r.categoryName));

  if (color) {
    results = results.filter((p) => p.colors.includes(String(color)));
  }
  if (size) {
    results = results.filter((p) => p.sizes.includes(String(size)));
  }

  res.json(results);
});

router.post("/", async (req, res) => {
  const [row] = await db.insert(productsTable).values(req.body).returning();
  res.status(201).json(buildProduct(row));
});

router.get("/:id", async (req, res) => {
  const [row] = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, Number(req.params.id)));
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(buildProduct(row.product, row.categoryName));
});

router.patch("/:id", async (req, res) => {
  const [row] = await db.update(productsTable).set(req.body).where(eq(productsTable.id, Number(req.params.id))).returning();
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(buildProduct(row));
});

router.delete("/:id", async (req, res) => {
  await db.delete(productsTable).where(eq(productsTable.id, Number(req.params.id)));
  res.status(204).send();
});

export default router;
