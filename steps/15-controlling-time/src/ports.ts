import type { Order } from "./order.ts";

// The OrderService talks to the outside world only through these four small interfaces.
// In the real shop they would be a warehouse system, a payment company, an email sender and the system clock.
// In tests we hand it simple stand-ins instead.

export interface Inventory {
  available(sku: string): number;
  reserve(sku: string, quantity: number): void;
  release(sku: string, quantity: number): void;
}

export type ChargeResult = { ok: true; receiptId: string } | { ok: false; reason: string };

// Talking to a payment company takes time, so charge returns a Promise: an answer that arrives later.
export interface Payments {
  charge(email: string, amountCents: number): Promise<ChargeResult>;
}

export interface Notifier {
  sendOrderConfirmation(email: string, order: Order): void;
}

export interface Clock {
  now(): Date;
}
