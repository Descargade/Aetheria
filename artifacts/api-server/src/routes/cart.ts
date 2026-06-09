import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable, couponsTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

async function buildCart(sessionId: string, couponCode?: string | null) {
  const items = await db
    .select({ item: cartItemsTable, product: productsTable, categoryName: categoriesTable.name })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  const cartItems = items.map((r) => ({
    ...r.item,
    price: Number(r.item.price),
    product: r.product ? { ...r.product, price: Number(r.product.price), salePrice: r.product.salePrice != null ? Number(r.product.salePrice) : null, categoryName: r.categoryName ?? null } : null,
  }));

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  let discount = 0;

  if (couponCode) {
    const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, couponCode));
    if (coupon && coupon.active) {
      if (coupon.discountType === "percentage") {
        discount = subtotal * (Number(coupon.discountValue) / 100);
      } else {
        discount = Number(coupon.discountValue);
      }
    }
  }

  const total = Math.max(0, subtotal - discount);
  return { sessionId, items: cartItems, subtotal, discount, shippingCost: 0, total, couponCode: couponCode ?? null };
}

router.get("/", async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  res.json(await buildCart(String(sessionId)));
});

router.post("/", async (req, res) => {
  const { sessionId, productId, quantity, selectedSize, selectedColor } = req.body;
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) return res.status(404).json({ error: "Product not found" });

  const price = product.salePrice != null ? Number(product.salePrice) : Number(product.price);

  const existing = await db.select().from(cartItemsTable).where(
    and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId))
  );

  if (existing.length > 0) {
    await db.update(cartItemsTable).set({ quantity: existing[0].quantity + quantity }).where(eq(cartItemsTable.id, existing[0].id));
  } else {
    await db.insert(cartItemsTable).values({ sessionId, productId, quantity, selectedSize, selectedColor, price: String(price) });
  }

  res.json(await buildCart(sessionId));
});

router.patch("/:itemId", async (req, res) => {
  const { quantity } = req.body;
  const [item] = await db.select().from(cartItemsTable).where(eq(cartItemsTable.id, Number(req.params.itemId)));
  if (!item) return res.status(404).json({ error: "Not found" });
  if (quantity <= 0) {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, item.id));
  } else {
    await db.update(cartItemsTable).set({ quantity }).where(eq(cartItemsTable.id, item.id));
  }
  res.json(await buildCart(item.sessionId));
});

router.delete("/:itemId", async (req, res) => {
  const [item] = await db.select().from(cartItemsTable).where(eq(cartItemsTable.id, Number(req.params.itemId)));
  if (!item) return res.status(404).json({ error: "Not found" });
  await db.delete(cartItemsTable).where(eq(cartItemsTable.id, item.id));
  res.json(await buildCart(item.sessionId));
});

router.delete("/clear", async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, String(sessionId)));
  res.status(204).send();
});

router.post("/apply-coupon", async (req, res) => {
  const { sessionId, code } = req.body;
  const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, code));
  if (!coupon || !coupon.active) {
    return res.json({ valid: false, coupon: null, message: "Cupón inválido o expirado" });
  }
  res.json({ valid: true, coupon: { ...coupon, discountValue: Number(coupon.discountValue), minPurchase: coupon.minPurchase != null ? Number(coupon.minPurchase) : null }, message: "Cupón aplicado" });
});

export default router;
