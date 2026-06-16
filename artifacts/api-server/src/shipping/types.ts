export interface ShipQuoteRequest {
  shippingMethodId: number;
  postalCode: string;
  province: string;
  city?: string;
  weight?: number;
  subtotal?: number;
}

export interface ShipQuoteResult {
  price: number;
  estimatedDays: string;
  provider: string;
  methodName: string;
}
