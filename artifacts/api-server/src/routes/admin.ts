import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, gte, desc, sql } from "drizzle-orm";

const router = Router();

const ADMIN_USER = "admin";
const ADMIN_PASS = "aetheria2024";
const ADMIN_TOKEN = "aetheria-admin-token-secret";

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true, token: ADMIN_TOKEN, username: ADMIN_USER });
  }
  res.status(401).json({ success: false, token: "", message: "Credenciales inválidas" });
});

router.get("/dashboard", async (_req, res) => {
  const allOrders = await db.select().from(ordersTable);
  const allProducts = await db.select().from(productsTable);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const todayOrders = allOrders.filter((o) => o.createdAt.toISOString().startsWith(todayStr));
  const monthOrders = allOrders.filter((o) => o.createdAt >= new Date(startOfMonth));
  const paidOrders = allOrders.filter((o) => ["pagado", "enviado", "entregado"].includes(o.status));

  const dailySales = todayOrders.reduce((s, o) => s + Number(o.total), 0);
  const monthlySales = monthOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalOrders = allOrders.length;
  const totalProducts = allProducts.length;
  const pendingOrders = allOrders.filter((o) => o.status === "pendiente").length;
  const lowStockCount = allProducts.filter((p) => p.stock <= 5).length;

  const emails = new Set(allOrders.map((o) => o.email));
  const totalCustomers = emails.size;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const conversionRate = totalOrders > 0 ? (paidOrders.length / totalOrders) * 100 : 0;

  res.json({ dailySales, monthlySales, totalRevenue, totalOrders, totalProducts, totalCustomers, averageOrderValue, conversionRate, pendingOrders, lowStockCount });
});

router.get("/top-products", async (_req, res) => {
  const items = await db.select().from(orderItemsTable);
  const products = await db.select().from(productsTable);

  const map = new Map<number, { totalSold: number; revenue: number }>();
  for (const item of items) {
    const prev = map.get(item.productId) ?? { totalSold: 0, revenue: 0 };
    map.set(item.productId, {
      totalSold: prev.totalSold + item.quantity,
      revenue: prev.revenue + Number(item.price) * item.quantity,
    });
  }

  const result = Array.from(map.entries())
    .map(([productId, stats]) => {
      const p = products.find((x) => x.id === productId);
      return {
        productId,
        name: p?.name ?? "Producto",
        totalSold: stats.totalSold,
        revenue: stats.revenue,
        image: p?.images?.[0] ?? null,
      };
    })
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 10);

  res.json(result);
});

router.get("/low-stock", async (_req, res) => {
  const rows = await db.select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(gte(productsTable.stock, 0));

  const lowStock = rows
    .filter((r) => r.product.stock <= 5)
    .sort((a, b) => a.product.stock - b.product.stock)
    .map((r) => ({ ...r.product, price: Number(r.product.price), salePrice: r.product.salePrice != null ? Number(r.product.salePrice) : null, categoryName: r.categoryName ?? null }));

  res.json(lowStock);
});

router.get("/sales-by-day", async (_req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orders = await db.select().from(ordersTable).where(gte(ordersTable.createdAt, thirtyDaysAgo));

  const byDay = new Map<string, { total: number; orders: number }>();
  for (const order of orders) {
    const date = order.createdAt.toISOString().split("T")[0];
    const prev = byDay.get(date) ?? { total: 0, orders: 0 };
    byDay.set(date, { total: prev.total + Number(order.total), orders: prev.orders + 1 });
  }

  const result = Array.from(byDay.entries())
    .map(([date, stats]) => ({ date, total: stats.total, orders: stats.orders }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json(result);
});

router.delete("/orders", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ message: "No autorizado" });
  }
  const orders = await db.select({ id: ordersTable.id }).from(ordersTable);
  for (const o of orders) {
    await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, o.id));
    await db.delete(ordersTable).where(eq(ordersTable.id, o.id));
  }
  res.json({ deleted: orders.length, message: `Se eliminaron ${orders.length} pedidos` });
});

router.post("/bulk-price-update", async (req, res) => {
  const { type, value, categoryId } = req.body;
  const allProducts = categoryId
    ? await db.select().from(productsTable).where(eq(productsTable.categoryId, categoryId))
    : await db.select().from(productsTable);

  let updated = 0;
  for (const product of allProducts) {
    const current = Number(product.price);
    let newPrice = current;

    if (type === "increase_percentage") newPrice = current * (1 + value / 100);
    else if (type === "decrease_percentage") newPrice = current * (1 - value / 100);
    else if (type === "increase_fixed") newPrice = current + value;
    else if (type === "decrease_fixed") newPrice = Math.max(0, current - value);

    await db.update(productsTable).set({ price: String(Math.round(newPrice)) }).where(eq(productsTable.id, product.id));
    updated++;
  }

  res.json({ updated, message: `Se actualizaron ${updated} productos` });
});

export default router;
