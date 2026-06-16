import type { ShippingProvider } from "./base";
import type { ShipQuoteRequest, ShipQuoteResult } from "./types";

const ZONES: Record<string, number> = {
  "CABA": 1, "Buenos Aires": 1,
  "Córdoba": 1, "Santa Fe": 1, "Entre Ríos": 2,
  "Mendoza": 2, "San Luis": 2, "San Juan": 2, "La Pampa": 2,
  "Corrientes": 2, "Chaco": 2, "Santiago del Estero": 2, "Tucumán": 2, "Salta": 2, "Jujuy": 2, "Catamarca": 2, "La Rioja": 2, "Misiones": 3, "Formosa": 3,
  "Chubut": 3, "Río Negro": 3, "Neuquén": 3, "Santa Cruz": 4, "Tierra del Fuego": 4,
};

const ZONE_MULTIPLIER = [1, 1.2, 1.6, 2.2];
const ZONE_DAYS = ["1-3", "2-4", "3-7", "5-12"];

export class OCAProvider implements ShippingProvider {
  readonly code = "oca";
  readonly name = "OCA";

  async quote(req: ShipQuoteRequest, _config?: unknown): Promise<ShipQuoteResult> {
    const zone = ZONES[req.province] ?? 2;
    const zoneIdx = zone - 1;
    const weight = req.weight ?? 1;
    const base = 1800;
    const weightCost = weight * 750;
    const zoneCost = base * ZONE_MULTIPLIER[zoneIdx];
    const price = Math.round((base + weightCost + zoneCost) * (1 + zoneIdx * 0.09));

    return {
      price,
      estimatedDays: ZONE_DAYS[zoneIdx] + " días hábiles",
      provider: this.code,
      methodName: "OCA",
    };
  }

  validateConfig(_config?: unknown): string | null {
    return null;
  }
}
