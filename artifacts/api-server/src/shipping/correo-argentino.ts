import type { ShippingProvider } from "./base";
import type { ShipQuoteRequest, ShipQuoteResult } from "./types";

const ZONES: Record<string, number> = {
  "CABA": 1, "Buenos Aires": 1,
  "Córdoba": 2, "Santa Fe": 2, "Entre Ríos": 2,
  "Mendoza": 3, "San Luis": 3, "San Juan": 3, "La Pampa": 3,
  "Corrientes": 3, "Chaco": 3, "Santiago del Estero": 3, "Tucumán": 3, "Salta": 3, "Jujuy": 3, "Catamarca": 3, "La Rioja": 3, "Misiones": 3, "Formosa": 3,
  "Chubut": 4, "Río Negro": 4, "Neuquén": 4, "Santa Cruz": 4, "Tierra del Fuego": 4,
};

const ZONE_MULTIPLIER = [0, 1, 1.3, 1.7, 2.3];
const ZONE_DAYS = ["1-2", "2-4", "3-6", "4-8", "6-12"];

export class CorreoArgentinoProvider implements ShippingProvider {
  readonly code = "correo-argentino";
  readonly name = "Correo Argentino";

  async quote(req: ShipQuoteRequest, _config?: unknown): Promise<ShipQuoteResult> {
    const zone = ZONES[req.province] ?? 3;
    const zoneIdx = zone - 1;
    const weight = req.weight ?? 1;
    const base = 1500;
    const weightCost = weight * 800;
    const zoneCost = base * ZONE_MULTIPLIER[zoneIdx];
    const price = Math.round((base + weightCost + zoneCost) * (1 + zoneIdx * 0.1));

    return {
      price,
      estimatedDays: ZONE_DAYS[zoneIdx] + " días hábiles",
      provider: this.code,
      methodName: "Correo Argentino",
    };
  }

  validateConfig(_config?: unknown): string | null {
    return null;
  }
}
