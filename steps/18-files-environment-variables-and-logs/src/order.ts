import type { CartLine } from "./cart.ts";

export interface Order {
  id: string;
  email: string;
  lines: CartLine[];
  subtotalCents: number;
  discountCode: string | null;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  placedAt: Date;
  receiptId: string;
}
