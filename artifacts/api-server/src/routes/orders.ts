import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, cartItemsTable, productsTable, shippingMethodsTable, paymentMethodsTable, couponsTable } from "@workspace/db";
import { eq, ilike, desc, or } from "drizzle-orm";

const router = Router();

function buildOrder(order: typeof ordersTable.$inferSelect, items: typeof orderItemsTable.$inferSelect[], paymentName?: string | null, shippingName?: string | null) {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shippingCost: Number(order.shippingCost),
    total: Number(order.total),
    paymentMethodName: paymentName ?? null,
    shippingMethodName: shippingName ?? null,
    items: items.map((i) => ({ ...i, price: Number(i.price) })),
    createdAt: order.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { status, search } = req.query;
  const rows = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
  let filtered = rows;
  if (status) filtered = filtered.filter((o) => o.status === String(status));
  if (search) {
    const s = String(search).toLowerCase();
    filtered = filtered.filter((o) =>
      o.firstName.toLowerCase().includes(s) ||
      o.lastName.toLowerCase().includes(s) ||
      o.email.toLowerCase().includes(s) ||
      String(o.id).includes(s)
    );
  }

  const result = await Promise.all(filtered.map(async (order) => {
    const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
    const [pm] = order.paymentMethodId ? await db.select().from(paymentMethodsTable).where(eq(paymentMethodsTable.id, order.paymentMethodId)) : [null];
    const [sm] = order.shippingMethodId ? await db.select().from(shippingMethodsTable).where(eq(shippingMethodsTable.id, order.shippingMethodId)) : [null];
    return buildOrder(order, items, pm?.name, sm?.name);
  }));

  res.json(result);
});

router.post("/", async (req, res) => {
  const { sessionId, firstName, lastName, email, phone, address, city, province, postalCode, paymentMethodId, shippingMethodId, couponCode, notes } = req.body;

  const cartItems = await db.select({ item: cartItemsTable, product: productsTable }).from(cartItemsTable).leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id)).where(eq(cartItemsTable.sessionId, sessionId));
  if (cartItems.length === 0) return res.status(400).json({ error: "Cart is empty" });

  const subtotal = cartItems.reduce((s, r) => s + Number(r.item.price) * r.item.quantity, 0);
  let discount = 0;

  if (couponCode) {
    const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, couponCode));
    if (coupon && coupon.active) {
      discount = coupon.discountType === "percentage"
        ? subtotal * (Number(coupon.discountValue) / 100)
        : Number(coupon.discountValue);
      await db.update(couponsTable).set({ usageCount: coupon.usageCount + 1 }).where(eq(couponsTable.id, coupon.id));
    }
  }

  let shippingCost = 0;
  if (shippingMethodId) {
    const [sm] = await db.select().from(shippingMethodsTable).where(eq(shippingMethodsTable.id, shippingMethodId));
    if (sm) shippingCost = Number(sm.price);
  }

  let paymentDiscount = 0;
  if (paymentMethodId) {
    const [pm] = await db.select().from(paymentMethodsTable).where(eq(paymentMethodsTable.id, paymentMethodId));
    if (pm) paymentDiscount = subtotal * (Number(pm.discount) / 100);
  }

  const total = Math.max(0, subtotal - discount - paymentDiscount + shippingCost);

  const [order] = await db.insert(ordersTable).values({
    status: "pendiente",
    firstName, lastName, email, phone, address, city, province, postalCode,
    subtotal: String(subtotal),
    discount: String(discount + paymentDiscount),
    shippingCost: String(shippingCost),
    total: String(total),
    couponCode: couponCode ?? null,
    shippingMethodId: shippingMethodId ?? null,
    paymentMethodId: paymentMethodId ?? null,
    notes: notes ?? null,
    sessionId,
  }).returning();

  const itemsToInsert = cartItems.map((r) => ({
    orderId: order.id,
    productId: r.item.productId,
    productName: r.product?.name ?? "Producto",
    quantity: r.item.quantity,
    selectedSize: r.item.selectedSize ?? null,
    selectedColor: r.item.selectedColor ?? null,
    price: r.item.price,
  }));
  await db.insert(orderItemsTable).values(itemsToInsert);

  await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));

  const orderItems = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  const [pm] = paymentMethodId ? await db.select().from(paymentMethodsTable).where(eq(paymentMethodsTable.id, paymentMethodId)) : [null];
  const [sm] = shippingMethodId ? await db.select().from(shippingMethodsTable).where(eq(shippingMethodsTable.id, shippingMethodId)) : [null];

  res.status(201).json(buildOrder(order, orderItems, pm?.name, sm?.name));
});

router.get("/:id", async (req, res) => {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, Number(req.params.id)));
  if (!order) return res.status(404).json({ error: "Not found" });
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  const [pm] = order.paymentMethodId ? await db.select().from(paymentMethodsTable).where(eq(paymentMethodsTable.id, order.paymentMethodId)) : [null];
  const [sm] = order.shippingMethodId ? await db.select().from(shippingMethodsTable).where(eq(shippingMethodsTable.id, order.shippingMethodId)) : [null];
  res.json(buildOrder(order, items, pm?.name, sm?.name));
});

router.patch("/:id", async (req, res) => {
  const [order] = await db.update(ordersTable).set({ status: req.body.status }).where(eq(ordersTable.id, Number(req.params.id))).returning();
  if (!order) return res.status(404).json({ error: "Not found" });
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  const [pm] = order.paymentMethodId ? await db.select().from(paymentMethodsTable).where(eq(paymentMethodsTable.id, order.paymentMethodId)) : [null];
  const [sm] = order.shippingMethodId ? await db.select().from(shippingMethodsTable).where(eq(shippingMethodsTable.id, order.shippingMethodId)) : [null];
  res.json(buildOrder(order, items, pm?.name, sm?.name));
});

export default router;
