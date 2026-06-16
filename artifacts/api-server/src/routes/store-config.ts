import { Router } from "express";
import { db, storeConfigTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

let tableEnsured = false;

async function ensureTable() {
  if (tableEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS store_config (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    tableEnsured = true;
  } catch (e) {
    console.error("Failed to ensure store_config table:", e);
  }
}

// Helper to get a config value
async function getConfig(key: string): Promise<string | null> {
  const [row] = await db.select().from(storeConfigTable).where(eq(storeConfigTable.key, key));
  return row?.value ?? null;
}

// Helper to set a config value
async function setConfig(key: string, value: string): Promise<void> {
  const existing = await db.select().from(storeConfigTable).where(eq(storeConfigTable.key, key));
  if (existing.length > 0) {
    await db.update(storeConfigTable).set({ value, updatedAt: new Date() }).where(eq(storeConfigTable.key, key));
  } else {
    await db.insert(storeConfigTable).values({ key, value });
  }
}

// GET /api/store-config - Get all config or specific keys
router.get("/", async (req, res) => {
  await ensureTable();
  const { keys } = req.query;
  if (keys && typeof keys === "string") {
    const keyList = keys.split(",");
    const result: Record<string, string | null> = {};
    for (const key of keyList) {
      result[key.trim()] = await getConfig(key.trim());
    }
    return res.json(result);
  }
  const rows = await db.select().from(storeConfigTable);
  const config: Record<string, string | null> = {};
  for (const row of rows) {
    config[row.key] = row.value;
  }
  res.json(config);
});

// PUT /api/store-config - Update config values
router.put("/", async (req, res) => {
  await ensureTable();
  const updates = req.body as Record<string, string>;
  for (const [key, value] of Object.entries(updates)) {
    await setConfig(key, value);
  }
  res.json({ success: true });
});

// GET /api/store-config/bank-data - Get bank transfer details
router.get("/bank-data", async (_req, res) => {
  await ensureTable();
  const alias = await getConfig("bank_alias");
  const cvu = await getConfig("bank_cvu");
  const titular = await getConfig("bank_titular");
  const cuit = await getConfig("bank_cuit");
  res.json({ alias, cvu, titular, cuit });
});

export default router;
