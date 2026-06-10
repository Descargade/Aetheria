import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  sizeGuidesTable, productSizeGuidesTable, insertSizeGuideSchema
} from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const guides = await db
    .select()
    .from(sizeGuidesTable)
    .orderBy(sizeGuidesTable.name);
  res.json(guides);
});

router.post("/", async (req: Request, res: Response) => {
  const parsed = insertSizeGuideSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }
  const [guide] = await db.insert(sizeGuidesTable).values(parsed.data).returning();
  res.status(201).json(guide);
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const guide = await db.query.sizeGuidesTable.findFirst({ where: eq(sizeGuidesTable.id, id) });
  if (!guide) { res.status(404).json({ error: "Not found" }); return; }
  res.json(guide);
});

router.put("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = insertSizeGuideSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error }); return; }

  const [guide] = await db
    .update(sizeGuidesTable)
    .set(parsed.data)
    .where(eq(sizeGuidesTable.id, id))
    .returning();
  if (!guide) { res.status(404).json({ error: "Not found" }); return; }
  res.json(guide);
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(sizeGuidesTable).where(eq(sizeGuidesTable.id, id));
  res.json({ success: true });
});

router.get("/product/:productId", async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);
  if (isNaN(productId)) { res.status(400).json({ error: "Invalid productId" }); return; }

  const rows = await db
    .select({ guide: sizeGuidesTable })
    .from(productSizeGuidesTable)
    .innerJoin(sizeGuidesTable, eq(productSizeGuidesTable.sizeGuideId, sizeGuidesTable.id))
    .where(eq(productSizeGuidesTable.productId, productId));

  res.json(rows.map(r => r.guide));
});

router.post("/product/:productId/assign/:guideId", async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);
  const sizeGuideId = Number(req.params.guideId);
  if (isNaN(productId) || isNaN(sizeGuideId)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db
    .delete(productSizeGuidesTable)
    .where(eq(productSizeGuidesTable.productId, productId));

  if (sizeGuideId > 0) {
    await db.insert(productSizeGuidesTable).values({ productId, sizeGuideId });
  }
  res.json({ success: true });
});

export default router;
