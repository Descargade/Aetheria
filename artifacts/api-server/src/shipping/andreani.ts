import type { ShippingProvider } from "./base";
import type { ShipQuoteRequest, ShipQuoteResult } from "./types";

const ZONES: Record<string, number> = {
  "CABA": 1, "Buenos Aires": 1,
  "Córdoba": 1, "Santa Fe": 1, "Entre Ríos": 1,
  "Mendoza": 2, "San Luis": 2, "San Juan": 2, "La Pampa": 2,
  "Corrientes": 2, "Chaco": 2, "Santiago del Estero": 2, "Tucumán": 2, "Salta": 2, "Jujuy": 2, "Catamarca": 2, "La Rioja": 2, "Misiones": 2, "Formosa": 2,
  "Chubut": 3, "Río Negro": 3, "Neuquén": 3, "Santa Cruz": 4, "Tierra del Fuego": 4,
};

const ZONE_MULTIPLIER = [1, 1.4, 1.9, 2.5];
const ZONE_DAYS = ["1-2", "2-3", "3-6", "5-10"];

export class AndreaniProvider implements ShippingProvider {
  readonly code = "andreani";
  readonly name = "Andreani";

  async quote(req: ShipQuoteRequest, _config?: unknown): Promise<ShipQuoteResult> {
    const zone = ZONES[req.province] ?? 2;
    const zoneIdx = zone - 1;
    const weight = req.weight ?? 1;
    const base = 2200;
    const weightCost = weight * 900;
    const zoneCost = base * ZONE_MULTIPLIER[zoneIdx];
    const price = Math.round((base + weightCost + zoneCost) * (1 + zoneIdx * 0.08));

    return {
      price,
      estimatedDays: ZONE_DAYS[zoneIdx] + " días hábiles",
      provider: this.code,
      methodName: "Andreani",
    };
  }

  validateConfig(_config?: unknown): string | null {
    return null;
  }
}
