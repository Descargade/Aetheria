import type { ShipQuoteRequest, ShipQuoteResult } from "./types";

export interface ShippingProvider {
  readonly code: string;
  readonly name: string;

  quote(req: ShipQuoteRequest, config?: unknown): Promise<ShipQuoteResult>;

  validateConfig(config?: unknown): string | null;
}
