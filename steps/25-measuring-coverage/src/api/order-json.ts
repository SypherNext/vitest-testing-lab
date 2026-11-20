import type { Order } from "../order.ts";
import { toIsoSeconds } from "../timestamps.ts";

// What the caller gets after placing an order.
export function placedOrderJson(order: Order) {
  return { id: order.id, totalCents: order.totalCents, placedAt: toIsoSeconds(order.placedAt) };
}

// The full order, for GET /orders/:id.
export function fullOrderJson(order: Order) {
  return {
    id: order.id,
    email: order.email,
    lines: order.lines,
    subtotalCents: order.subtotalCents,
    discountCode: order.discountCode,
    discountCents: order.discountCents,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    placedAt: toIsoSeconds(order.placedAt),
    receiptId: order.receiptId,
  };
}
