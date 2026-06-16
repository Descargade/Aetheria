import { Router } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { cancellationsTable } from "@workspace/db/schema";

const router = Router();

async function ensureTable() {
  try {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS cancellations (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL,
      telefono TEXT,
      numero_pedido TEXT NOT NULL,
      motivo TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  } catch (e) {
    console.error("ensureTable cancellations error", e);
  }
}

router.post("/", async (req, res) => {
  await ensureTable();
  const { nombre, email, telefono, numeroPedido, motivo } = req.body;
  if (!nombre || !email || !numeroPedido || !motivo) {
    return res.status(400).json({ error: "nombre, email, numeroPedido, motivo are required" });
  }
  const [cancellation] = await db.insert(cancellationsTable).values({
    nombre,
    email,
    telefono: telefono || null,
    numeroPedido,
    motivo,
  }).returning();
  res.status(201).json(cancellation);
});

router.get("/", async (_req, res) => {
  await ensureTable();
  const items = await db.execute(sql`SELECT * FROM cancellations ORDER BY created_at DESC`);
  res.json(items.rows);
});

router.patch("/:id", async (req, res) => {
  await ensureTable();
  const { id } = req.params;
  const { estado } = req.body;
  if (!estado) return res.status(400).json({ error: "estado is required" });
  await db.execute(sql`UPDATE cancellations SET estado = ${estado} WHERE id = ${Number(id)}`);
  res.json({ success: true });
});

export default router;
