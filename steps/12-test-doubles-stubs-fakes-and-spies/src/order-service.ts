import type { Cart, CartLine } from "./cart.ts";
import { applyDiscountCode } from "./discounts.ts";
import { EmptyCartError, OutOfStockError, PaymentDeclinedError } from "./errors.ts";
import type { Order } from "./order.ts";
import type { Clock, Inventory, Notifier, Payments } from "./ports.ts";
import { shippingCost } from "./shipping.ts";

const FIRST_ORDER_NUMBER = 1001;

export class OrderService {
  private readonly inventory: Inventory;
  private readonly payments: Payments;
  private readonly notifier: Notifier;
  private readonly clock: Clock;
  private nextOrderNumber = FIRST_ORDER_NUMBER;

  // The four helpers are passed in (not created here), so a test can pass in stand-ins.
  constructor(inventory: Inventory, payments: Payments, notifier: Notifier, clock: Clock) {
    this.inventory = inventory;
    this.payments = payments;
    this.notifier = notifier;
    this.clock = clock;
  }

  placeOrder(cart: Cart, customerEmail: string, discountCode?: string | null): Order {
    const lines = cart.lines();
    if (lines.length === 0) {
      throw new EmptyCartError();
    }
    this.assertEverythingInStock(lines);

    const subtotalCents = cart.subtotal;
    const discount = applyDiscountCode(subtotalCents, discountCode);
    const shippingCents = shippingCost(subtotalCents - discount.discountCents);
    const totalCents = subtotalCents - discount.discountCents + shippingCents;

    this.reserveAll(lines);
    const payment = this.payments.charge(customerEmail, totalCents);
    if (!payment.ok) {
      this.releaseAll(lines);
      throw new PaymentDeclinedError(payment.reason);
    }

    const order: Order = {
      id: this.takeNextOrderId(),
      email: customerEmail,
      lines,
      subtotalCents,
      discountCode: discount.code,
      discountCents: discount.discountCents,
      shippingCents,
      totalCents,
      placedAt: this.clock.now(),
      receiptId: payment.receiptId,
    };
    this.notifier.sendOrderConfirmation(customerEmail, order);
    return order;
  }

  private assertEverythingInStock(lines: CartLine[]): void {
    for (const line of lines) {
      if (this.inventory.available(line.sku) < line.quantity) {
        throw new OutOfStockError(line.sku);
      }
    }
  }

  private reserveAll(lines: CartLine[]): void {
    for (const line of lines) {
      this.inventory.reserve(line.sku, line.quantity);
    }
  }

  private releaseAll(lines: CartLine[]): void {
    for (const line of lines) {
      this.inventory.release(line.sku, line.quantity);
    }
  }

  // Ids are only used up by orders that went through, so a declined payment leaves no gap.
  private takeNextOrderId(): string {
    const id = `ORD-${this.nextOrderNumber}`;
    this.nextOrderNumber += 1;
    return id;
  }
}
