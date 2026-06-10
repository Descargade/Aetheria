import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  variantsTable, variantImagesTable, variantSizesTable,
  insertVariantSchema, insertVariantImageSchema, insertVariantSizeSchema,
} from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

async function getVariantWithDetails(variantId: number) {
  const variant = await db.query.variantsTable.findFirst({
    where: eq(variantsTable.id, variantId),
  });
  if (!variant) return null;

  const images = await db
    .select()
    .from(variantImagesTable)
    .where(eq(variantImagesTable.variantId, variantId))
    .orderBy(asc(variantImagesTable.sortOrder));

  const sizes = await db
    .select()
    .from(variantSizesTable)
    .where(eq(variantSizesTable.variantId, variantId))
    .orderBy(asc(variantSizesTable.size));

  return { ...variant, images, sizes };
}

router.get("/:productId/all", async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid productId" }); return; }

  const variants = await db
    .select()
    .from(variantsTable)
    .where(eq(variantsTable.productId, productId))
    .orderBy(asc(variantsTable.sortOrder));

  const result = await Promise.all(variants.map(v => getVariantWithDetails(v.id)));
  res.json(result.filter(Boolean));
});

router.post("/:productId", async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid productId" }); return; }

  const parsed = insertVariantSchema.safeParse({ ...req.body, productId });
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }

  const [variant] = await db.insert(variantsTable).values(parsed.data).returning();
  res.status(201).json({ ...variant, images: [], sizes: [] });
});

router.put("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { colorName, colorHex, sortOrder, active } = req.body;
  const update: Partial<typeof variantsTable.$inferInsert> = {};
  if (colorName !== undefined) update.colorName = colorName;
  if (colorHex !== undefined) update.colorHex = colorHex;
  if (sortOrder !== undefined) update.sortOrder = sortOrder;
  if (active !== undefined) update.active = active;

  await db.update(variantsTable).set(update).where(eq(variantsTable.id, id));
  const variant = await getVariantWithDetails(id);
  if (!variant) { res.status(404).json({ error: "Not found" }); return; }
  res.json(variant);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(variantsTable).where(eq(variantsTable.id, id));
  res.json({ success: true });
});

router.post("/:id/images", async (req: Request, res: Response) => {
  const variantId = Number(req.params.id);
  if (isNaN(variantId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = insertVariantImageSchema.safeParse({ ...req.body, variantId });
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }

  const [image] = await db.insert(variantImagesTable).values(parsed.data).returning();
  res.status(201).json(image);
});

router.delete("/:id/images/:imageId", async (req: Request, res: Response) => {
  const imageId = Number(req.params.imageId);
  if (isNaN(imageId)) { res.status(400).json({ error: "Invalid imageId" }); return; }
  await db.delete(variantImagesTable).where(eq(variantImagesTable.id, imageId));
  res.json({ success: true });
});

router.put("/:id/sizes", async (req: Request, res: Response) => {
  const variantId = Number(req.params.id);
  if (isNaN(variantId)) { res.status(400).json({ error: "Invalid id" }); return; }

  if (!Array.isArray(req.body)) { res.status(400).json({ error: "Expected array" }); return; }
  const items = req.body as Array<{ size: string; stock: number; active?: boolean }>;

  await db.delete(variantSizesTable).where(eq(variantSizesTable.variantId, variantId));

  if (items.length > 0) {
    await db.insert(variantSizesTable).values(
      items.filter(s => s.size?.trim()).map(s => ({ variantId, size: s.size, stock: Number(s.stock) || 0, active: s.active ?? true }))
    );
  }

  const sizes = await db
    .select()
    .from(variantSizesTable)
    .where(eq(variantSizesTable.variantId, variantId))
    .orderBy(asc(variantSizesTable.size));
  res.json(sizes);
});

export default router;
