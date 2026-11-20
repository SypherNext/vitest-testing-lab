import { describe, expect, test } from "vitest";
import { Cart } from "../src/cart.ts";
import { EmptyCartError, OutOfStockError, PaymentDeclinedError } from "../src/errors.ts";
import type { Payments } from "../src/ports.ts";
import { buildCartWithNotebooksAndAPen } from "./support/cart-builder.ts";
import { StubPayments } from "./support/fakes.ts";
import { buildOrderService as buildService, CUSTOMER_EMAIL as CUSTOMER, PLACED_AT } from "./support/order-service-builder.ts";

// The service and its stand-ins come from the shared builder (tests/support/order-service-builder.ts).
// Before this lesson, three test files each had their own copy of this wiring.

// placeOrder returns a Promise now, so every test is `async` and waits with `await`.
// Without the await, the test would end before the order is placed and the expectations would run too early.
describe("OrderService.placeOrder", () => {
  describe("when everything works", () => {
    test("returns an order with the discount, shipping and total worked out", async () => {
      const { service } = buildService();

      const order = await service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER, "SAVE10");

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

    test("stamps the order with the time from the clock", async () => {
      const { service } = buildService();

      const order = await service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

      expect(order.placedAt).toEqual(PLACED_AT);
    });

    test("reserves the stock for every line", async () => {
      const { service, inventory } = buildService();

      await service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

      expect(inventory.available("NB-1")).toBe(8);
      expect(inventory.available("PN-1")).toBe(9);
    });

    test("charges the customer the total", async () => {
      const payments = new StubPayments();
      const { service } = buildService({ payments });

      await service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER, "SAVE10");

      expect(payments.charges).toEqual([{ email: CUSTOMER, amountCents: 1532 }]);
    });

    test("sends one confirmation to the customer", async () => {
      const { service, notifier } = buildService();

      const order = await service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

      expect(notifier.sent).toHaveLength(1);
      expect(notifier.sent[0].email).toBe(CUSTOMER);
      expect(notifier.sent[0].order).toBe(order);
    });

    test("gives each new order the next id, starting at ORD-1001", async () => {
      const { service } = buildService();

      const first = await service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);
      const second = await service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

      expect([first.id, second.id]).toEqual(["ORD-1001", "ORD-1002"]);
    });
  });

  // For a promise that fails, use `await expect(promise).rejects`. Remember the await in front of expect.
  describe("when the cart is empty", () => {
    test("rejects with EmptyCartError", async () => {
      const { service } = buildService();

      await expect(service.placeOrder(new Cart(), CUSTOMER)).rejects.toThrow(EmptyCartError);
      await expect(service.placeOrder(new Cart(), CUSTOMER)).rejects.toThrow("cart is empty");
    });
  });

  describe("when there is not enough stock", () => {
    test("rejects with OutOfStockError naming the sku", async () => {
      const { service } = buildService({ stock: { "NB-1": 1, "PN-1": 10 } });
      const cart = buildCartWithNotebooksAndAPen();

      await expect(service.placeOrder(cart, CUSTOMER)).rejects.toThrow(OutOfStockError);
      await expect(service.placeOrder(cart, CUSTOMER)).rejects.toThrow("not enough stock for NB-1");
    });

    test("reserves nothing and charges nothing", async () => {
      const payments = new StubPayments();
      const { service, inventory } = buildService({ stock: { "NB-1": 10, "PN-1": 0 }, payments });

      await expect(service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER)).rejects.toThrow(OutOfStockError);

      expect(inventory.available("NB-1")).toBe(10);
      expect(payments.charges).toEqual([]);
    });
  });

  describe("when the payment is declined", () => {
    const declined = () => new StubPayments({ ok: false, reason: "card expired" });

    test("rejects with PaymentDeclinedError and the reason", async () => {
      const { service } = buildService({ payments: declined() });
      const cart = buildCartWithNotebooksAndAPen();

      await expect(service.placeOrder(cart, CUSTOMER)).rejects.toThrow(PaymentDeclinedError);
      await expect(service.placeOrder(cart, CUSTOMER)).rejects.toThrow("payment declined: card expired");
    });

    test("puts the reserved stock back", async () => {
      const { service, inventory } = buildService({ payments: declined() });

      await expect(service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER)).rejects.toThrow();

      expect(inventory.available("NB-1")).toBe(10);
      expect(inventory.available("PN-1")).toBe(10);
    });

    test("sends no confirmation", async () => {
      const { service, notifier } = buildService({ payments: declined() });

      await expect(service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER)).rejects.toThrow();

      expect(notifier.sent).toEqual([]);
    });
  });

  describe("when the payment service breaks", () => {
    const broken: Payments = {
      charge: async () => {
        throw new Error("payment service is down");
      },
    };

    test("passes the problem on to the caller", async () => {
      const { service } = buildService({ payments: broken });

      await expect(service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER)).rejects.toThrow(
        "payment service is down",
      );
    });

    test("still puts the reserved stock back", async () => {
      const { service, inventory } = buildService({ payments: broken });

      await expect(service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER)).rejects.toThrow();

      expect(inventory.available("NB-1")).toBe(10);
    });
  });
});
