import {Router} from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET ?? "aetheria-jwt-secret-change-in-production";
const JWT_EXPIRES_IN = "7d";

function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email y contraseña son requeridos" });
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing) {
      return res.status(409).json({ success: false, message: "El email ya está registrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db.insert(usersTable).values({
      email,
      passwordHash,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      phone: phone ?? null,
    }).returning();

    const token = generateToken(user.id);

    return res.status(201).json({
      success: true,
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email y contraseña son requeridos" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas" });
    }

    const token = generateToken(user.id);

    return res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Token requerido" });
    }

    const token = authHeader.slice(7);
    let payload: { userId: number };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    } catch {
      return res.status(401).json({ success: false, message: "Token inválido o expirado" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    return res.json({
      success: true,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone },
    });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

export default router;