import { Router } from "express";
import { db, shippingMethodsTable } from "@workspace/db";
import { cartItemsTable, productsTable, couponsTable, categoriesTable, variantsTable, variantSizesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getProvider } from "../shipping";

const router = Router();

interface ShippingParams {
  shippingMethodId?: number;
  postalCode?: string;
  province?: string;
}

async function getAvailableStock(productId: number, selectedColor?: string | null, selectedSize?: string | null): Promise<number> {
  if (selectedColor && selectedSize) {
    const [variant] = await db.select().from(variantsTable).where(
      and(eq(variantsTable.productId, productId), eq(variantsTable.colorName, selectedColor))
    );
    if (variant) {
      const [size] = await db.select().from(variantSizesTable).where(
        and(eq(variantSizesTable.variantId, variant.id), eq(variantSizesTable.size, selectedSize))
      );
      if (size) return size.stock;
    }
  }
  const [product] = await db.select({ stock: productsTable.stock }).from(productsTable).where(eq(productsTable.id, productId));
  return product?.stock ?? 0;
}

async function buildCart(sessionId: string, couponCode?: string | null, shipping?: ShippingParams) {
  const items = await db
    .select({ item: cartItemsTable, product: productsTable, categoryName: categoriesTable.name })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  const cartItems = await Promise.all(items.map(async (r) => {
    const availableStock = await getAvailableStock(r.item.productId, r.item.selectedColor, r.item.selectedSize);
    return {
      ...r.item,
      price: Number(r.item.price),
      availableStock,
      product: r.product ? { ...r.product, price: Number(r.product.price), salePrice: r.product.salePrice != null ? Number(r.product.salePrice) : null, categoryName: r.categoryName ?? null } : null,
    };
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

  let shippingCost = 0;
  if (shipping?.shippingMethodId && shipping?.postalCode && shipping?.province) {
    const [method] = await db.select().from(shippingMethodsTable).where(eq(shippingMethodsTable.id, shipping.shippingMethodId));
    if (method) {
      const provider = getProvider(method.provider ?? "custom");
      if (provider) {
        const quote = await provider.quote({
          shippingMethodId: method.id,
          postalCode: shipping.postalCode,
          province: shipping.province,
          weight: cartItems.reduce((sum, i) => sum + i.quantity, 0),
          subtotal,
        }, method.config ?? undefined);
        shippingCost = quote.price;
      } else {
        shippingCost = Number(method.price);
      }
    }
  }

  const total = Math.max(0, subtotal - discount + shippingCost);
  return { sessionId, items: cartItems, subtotal, discount, shippingCost, total, couponCode: couponCode ?? null };
}

router.get("/", async (req, res) => {
  const { sessionId, shippingMethodId, postalCode, province } = req.query;
  if (!sessionId) return res.status(400).json({ error: "sessionId required" });
  const shipping = shippingMethodId ? { shippingMethodId: Number(shippingMethodId), postalCode: String(postalCode ?? ""), province: String(province ?? "") } : undefined;
  res.json(await buildCart(String(sessionId), undefined, shipping));
});

router.post("/", async (req, res) => {
  const { sessionId, productId, quantity, selectedSize, selectedColor } = req.body;
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  if (!product) return res.status(404).json({ error: "Product not found" });

  const availableStock = await getAvailableStock(productId, selectedColor, selectedSize);
  if (availableStock <= 0) {
    return res.status(400).json({ error: "Sin stock disponible", outOfStock: true });
  }

  const existing = await db.select().from(cartItemsTable).where(
    and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId))
  );

  const totalQty = existing.length > 0 ? existing[0].quantity + quantity : quantity;
  if (totalQty > availableStock) {
    return res.status(400).json({
      error: `Stock insuficiente. Disponible: ${availableStock}`,
      availableStock,
      maxQuantity: availableStock,
    });
  }

  const price = product.salePrice != null ? Number(product.salePrice) : Number(product.price);

  if (existing.length > 0) {
    await db.update(cartItemsTable).set({ quantity: totalQty }).where(eq(cartItemsTable.id, existing[0].id));
  } else {
    await db.insert(cartItemsTable).values({ sessionId, productId, quantity, selectedSize, selectedColor, price: String(price) });
  }

  res.json(await buildCart(sessionId));
});

router.patch("/:itemId", async (req, res) => {
  const { quantity } = req.body;
  const [item] = await db.select().from(cartItemsTable).where(eq(cartItemsTable.id, Number(req.params.itemId)));
  if (!item) return res.status(404).json({ error: "Not found" });

  if (quantity > 0) {
    const availableStock = await getAvailableStock(item.productId, item.selectedColor, item.selectedSize);
    if (quantity > availableStock) {
      return res.status(400).json({
        error: `Stock insuficiente. Disponible: ${availableStock}`,
        availableStock,
        maxQuantity: availableStock,
      });
    }
  }

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
  await db.delete(cartItemsTable).where(eq(cartItemsTable.id, String(sessionId)));
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