import type { ShippingProvider } from "./base";
import type { ShipQuoteRequest, ShipQuoteResult } from "./types";

export class PickupProvider implements ShippingProvider {
  readonly code = "pickup";
  readonly name = "Retiro en local";

  async quote(_req: ShipQuoteRequest, _config?: unknown): Promise<ShipQuoteResult> {
    return {
      price: 0,
      estimatedDays: "Disponible inmediatamente",
      provider: this.code,
      methodName: "Retiro en local",
    };
  }

  validateConfig(_config?: unknown): string | null {
    return null;
  }
}
