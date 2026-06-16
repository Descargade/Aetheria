import type { ShippingProvider } from "./base";
import { CorreoArgentinoProvider } from "./correo-argentino";
import { AndreaniProvider } from "./andreani";
import { OCAProvider } from "./oca";
import { PickupProvider } from "./pickup";

const providers: ShippingProvider[] = [
  new CorreoArgentinoProvider(),
  new AndreaniProvider(),
  new OCAProvider(),
  new PickupProvider(),
];

const providerMap = new Map<string, ShippingProvider>();

for (const p of providers) {
  providerMap.set(p.code, p);
}

export function getProvider(code: string): ShippingProvider | undefined {
  return providerMap.get(code);
}

export function getAllProviders(): ShippingProvider[] {
  return providers;
}

export type { ShippingProvider } from "./base";
export type { ShipQuoteRequest, ShipQuoteResult } from "./types";
