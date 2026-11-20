import type { Order } from "../../src/order.ts";
import type { ChargeResult, Clock, Inventory, Notifier, Payments } from "../../src/ports.ts";

// Hand-written test doubles. Each one is a stand-in for something the OrderService talks to.

// A FAKE is a small working version of the real thing. This one really keeps stock numbers.
export class FakeInventory implements Inventory {
  private readonly stock: Map<string, number>;

  constructor(initialStock: Record<string, number>) {
    this.stock = new Map(Object.entries(initialStock));
  }

  available(sku: string): number {
    return this.stock.get(sku) ?? 0;
  }

  reserve(sku: string, quantity: number): void {
    this.stock.set(sku, this.available(sku) - quantity);
  }

  release(sku: string, quantity: number): void {
    this.stock.set(sku, this.available(sku) + quantity);
  }
}

// A STUB gives a ready-made answer, whatever it is asked.
// This one also remembers what it was asked (in `charges`), so it is a stub and a spy in one.
// charge is async, like the real payment company: the answer comes back as a Promise.
export class StubPayments implements Payments {
  readonly charges: { email: string; amountCents: number }[] = [];
  private readonly result: ChargeResult;

  constructor(result: ChargeResult = { ok: true, receiptId: "RCPT-1" }) {
    this.result = result;
  }

  async charge(email: string, amountCents: number): Promise<ChargeResult> {
    this.charges.push({ email, amountCents });
    return this.result;
  }
}

// A SPY records how it was used, so a test can check it afterwards.
export class SpyNotifier implements Notifier {
  readonly sent: { email: string; order: Order }[] = [];

  sendOrderConfirmation(email: string, order: Order): void {
    this.sent.push({ email, order });
  }
}

// A clock that always says the same time, so a test knows exactly what placedAt will be.
export class FixedClock implements Clock {
  private readonly time: Date;

  constructor(time: Date) {
    this.time = time;
  }

  now(): Date {
    return new Date(this.time);
  }
}
