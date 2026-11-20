import type { Order } from "../src/order.ts";

// A finished order to use in tests: 2 notebooks and a pen, with the SAVE10 code.
// 1148 subtotal - 115 discount + 499 shipping = 1532 total. Pass overrides to change what a test cares about.
export function sampleOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "ORD-1001",
    email: "sam@example.com",
    lines: [
      { sku: "NB-1", name: "Notebook", unitPriceCents: 499, quantity: 2, lineTotalCents: 998 },
      { sku: "PN-1", name: "Pen", unitPriceCents: 150, quantity: 1, lineTotalCents: 150 },
    ],
    subtotalCents: 1148,
    discountCode: "SAVE10",
    discountCents: 115,
    shippingCents: 499,
    totalCents: 1532,
    placedAt: new Date("2026-03-14T09:30:00Z"),
    receiptId: "RCPT-1",
    ...overrides,
  };
}
