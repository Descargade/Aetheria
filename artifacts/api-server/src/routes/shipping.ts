import { Router } from "express";
import { db, shippingMethodsTable, shippingProvidersTable, storePickupConfigTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function fmt(s: typeof shippingMethodsTable.$inferSelect) {
  return { ...s, price: Number(s.price) };
}

// ── Shipping Methods (existing) ──────────────────────────────

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

// ── Quote (returns static price set by admin) ────────────────

router.post("/quote", async (req, res) => {
  const { shippingMethodId } = req.body as { shippingMethodId: number };

  if (!shippingMethodId) {
    return res.status(400).json({ error: "shippingMethodId is required" });
  }

  const [method] = await db.select().from(shippingMethodsTable).where(eq(shippingMethodsTable.id, shippingMethodId));
  if (!method) return res.status(404).json({ error: "Shipping method not found" });

  res.json({ price: Number(method.price), estimatedDays: method.estimatedDays ?? "", methodName: method.name });
});

// ── Shipping Providers (admin) ───────────────────────────────

router.get("/providers", async (_req, res) => {
  const rows = await db.select().from(shippingProvidersTable).orderBy(shippingProvidersTable.name);
  res.json(rows);
});

router.post("/providers", async (req, res) => {
  const [row] = await db.insert(shippingProvidersTable).values(req.body).returning();
  res.status(201).json(row);
});

router.put("/providers/:id", async (req, res) => {
  const [row] = await db.update(shippingProvidersTable).set(req.body).where(eq(shippingProvidersTable.id, Number(req.params.id))).returning();
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

router.delete("/providers/:id", async (req, res) => {
  await db.delete(shippingProvidersTable).where(eq(shippingProvidersTable.id, Number(req.params.id)));
  res.status(204).send();
});

router.get("/providers/available", (_req, res) => {
  res.json([]);
});

// ── Store Pickup Config (admin) ──────────────────────────────

router.get("/pickup-config", async (_req, res) => {
  const [config] = await db.select().from(storePickupConfigTable);
  res.json(config ?? { id: null, enabled: true, address: "", city: "", province: "", phone: "", hours: "", instructions: "" });
});

router.put("/pickup-config", async (req, res) => {
  const [existing] = await db.select().from(storePickupConfigTable);
  if (existing) {
    const [row] = await db.update(storePickupConfigTable).set({ ...req.body, updatedAt: new Date() }).where(eq(storePickupConfigTable.id, existing.id)).returning();
    res.json(row);
  } else {
    const [row] = await db.insert(storePickupConfigTable).values(req.body).returning();
    res.status(201).json(row);
  }
});

export default router;
