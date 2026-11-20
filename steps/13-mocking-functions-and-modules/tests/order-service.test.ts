import { describe, expect, test } from "vitest";
import { Cart } from "../src/cart.ts";
import { EmptyCartError, OutOfStockError, PaymentDeclinedError } from "../src/errors.ts";
import { OrderService } from "../src/order-service.ts";
import { FakeInventory, FixedClock, SpyNotifier, StubPayments } from "./support/fakes.ts";
import { buildCartWithNotebooksAndAPen } from "./support/cart-builder.ts";

const CUSTOMER = "sam@example.com";
const PLACED_AT = new Date("2026-03-14T09:30:00Z");

// Every test builds its own service from its own stand-ins. The stand-ins are the "arrange" step.
function buildService(options: { stock?: Record<string, number>; payments?: StubPayments } = {}) {
  const inventory = new FakeInventory(options.stock ?? { "NB-1": 10, "PN-1": 10 });
  const payments = options.payments ?? new StubPayments();
  const notifier = new SpyNotifier();
  const service = new OrderService(inventory, payments, notifier, new FixedClock(PLACED_AT));
  return { service, inventory, payments, notifier };
}

describe("OrderService.placeOrder", () => {
  describe("when everything works", () => {
    test("returns an order with the discount, shipping and total worked out", () => {
      const { service } = buildService();
      const cart = buildCartWithNotebooksAndAPen();

      const order = service.placeOrder(cart, CUSTOMER, "SAVE10");

      expect(order).toMatchObject({
        id: "ORD-1001",
        email: CUSTOMER,
        subtotalCents: 1148,
        discountCode: "SAVE10",
        discountCents: 115,
        shippingCents: 499,
        totalCents: 1532,
        receiptId: "RCPT-1",
      });
    });

    test("stamps the order with the time from the clock", () => {
      const { service } = buildService();

      const order = service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

      expect(order.placedAt).toEqual(PLACED_AT);
    });

    test("reserves the stock for every line", () => {
      const { service, inventory } = buildService();

      service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

      expect(inventory.available("NB-1")).toBe(8);
      expect(inventory.available("PN-1")).toBe(9);
    });

    test("charges the customer the total", () => {
      const { service, payments } = buildService();

      service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER, "SAVE10");

      expect(payments.charges).toEqual([{ email: CUSTOMER, amountCents: 1532 }]);
    });

    test("sends one confirmation to the customer", () => {
      const { service, notifier } = buildService();

      const order = service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

      expect(notifier.sent).toHaveLength(1);
      expect(notifier.sent[0].email).toBe(CUSTOMER);
      expect(notifier.sent[0].order).toBe(order);
    });

    test("gives each new order the next id, starting at ORD-1001", () => {
      const { service } = buildService();

      const first = service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);
      const second = service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

      expect([first.id, second.id]).toEqual(["ORD-1001", "ORD-1002"]);
    });
  });

  describe("when the cart is empty", () => {
    test("throws EmptyCartError", () => {
      const { service } = buildService();

      expect(() => service.placeOrder(new Cart(), CUSTOMER)).toThrow(EmptyCartError);
      expect(() => service.placeOrder(new Cart(), CUSTOMER)).toThrow("cart is empty");
    });
  });

  describe("when there is not enough stock", () => {
    test("throws OutOfStockError naming the sku", () => {
      const { service } = buildService({ stock: { "NB-1": 1, "PN-1": 10 } });

      expect(() => service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER)).toThrow(OutOfStockError);
      expect(() => service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER)).toThrow(
        "not enough stock for NB-1",
      );
    });

    test("reserves nothing and charges nothing", () => {
      const { service, inventory, payments } = buildService({ stock: { "NB-1": 10, "PN-1": 0 } });

      expect(() => service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER)).toThrow(OutOfStockError);

      expect(inventory.available("NB-1")).toBe(10);
      expect(payments.charges).toEqual([]);
    });
  });

  describe("when the payment is declined", () => {
    const declined = () => new StubPayments({ ok: false, reason: "card expired" });

    test("throws PaymentDeclinedError with the reason", () => {
      const { service } = buildService({ payments: declined() });

      expect(() => service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER)).toThrow(PaymentDeclinedError);
      expect(() => service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER)).toThrow(
        "payment declined: card expired",
      );
    });

    test("puts the reserved stock back", () => {
      const { service, inventory } = buildService({ payments: declined() });

      expect(() => service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER)).toThrow();

      expect(inventory.available("NB-1")).toBe(10);
      expect(inventory.available("PN-1")).toBe(10);
    });

    test("sends no confirmation", () => {
      const { service, notifier } = buildService({ payments: declined() });

      expect(() => service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER)).toThrow();

      expect(notifier.sent).toEqual([]);
    });
  });
});
