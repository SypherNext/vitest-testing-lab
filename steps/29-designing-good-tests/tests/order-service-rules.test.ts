import { describe, expect, test } from "vitest";
import { Cart } from "../src/cart.ts";
import { DiscountError } from "../src/errors.ts";
import type { Payments } from "../src/ports.ts";
import { buildCartWithNotebooksAndAPen } from "./support/cart-builder.ts";
import { StubPayments } from "./support/fakes.ts";
import { buildOrderService, CUSTOMER_EMAIL as CUSTOMER } from "./support/order-service-builder.ts";

// The first order-service file checks the main road. This file checks the rules around the edges:
// discounts, shipping, ids, and what must NOT happen when an order fails.

// A short name for the common case "only the payments differ".
function buildService(payments: Payments = new StubPayments()) {
  return buildOrderService({ payments });
}

function buildCartWorthMoreThanFiftyDollars(): Cart {
  const cart = new Cart();
  cart.addItem("BG-1", "Tote bag", 2500, 2); // exactly $50.00
  return cart;
}

describe("OrderService: discounts and shipping", () => {
  test("charges shipping on a small order", async () => {
    const { service } = buildService();

    const order = await service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

    expect(order.shippingCents).toBe(499);
    expect(order.totalCents).toBe(1148 + 499);
  });

  test("ships a $50.00 order for free", async () => {
    const { service } = buildService();

    const order = await service.placeOrder(buildCartWorthMoreThanFiftyDollars(), CUSTOMER);

    expect(order.shippingCents).toBe(0);
    expect(order.totalCents).toBe(5000);
  });

  test("works out shipping after the discount, so a discount can bring back the shipping fee", async () => {
    const { service } = buildService();

    const order = await service.placeOrder(buildCartWorthMoreThanFiftyDollars(), CUSTOMER, "SAVE10");

    expect(order.discountCents).toBe(500);
    expect(order.shippingCents).toBe(499); // 4500 is below 5000
    expect(order.totalCents).toBe(5000 - 500 + 499);
  });

  test("applies SAVE25 when the subtotal is high enough", async () => {
    const { service } = buildService();

    const order = await service.placeOrder(buildCartWorthMoreThanFiftyDollars(), CUSTOMER, "save25");

    expect(order.discountCode).toBe("SAVE25");
    expect(order.discountCents).toBe(1250);
    expect(order.totalCents).toBe(5000 - 1250 + 499);
  });

  test("records no discount code when none is given", async () => {
    const { service } = buildService();

    const order = await service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

    expect(order.discountCode).toBeNull();
    expect(order.discountCents).toBe(0);
  });

  test("keeps the cart lines on the order", async () => {
    const { service } = buildService();
    const cart = buildCartWithNotebooksAndAPen();

    const order = await service.placeOrder(cart, CUSTOMER);

    expect(order.lines).toEqual(cart.lines());
  });
});

describe("OrderService: what must not happen when an order fails", () => {
  test("a refused discount code stops the order before anything is reserved or charged", async () => {
    const payments = new StubPayments();
    const { service, inventory, notifier } = buildService(payments);

    await expect(service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER, "SAVE25")).rejects.toThrow(
      DiscountError,
    );

    expect(inventory.available("NB-1")).toBe(10);
    expect(payments.charges).toEqual([]);
    expect(notifier.sent).toEqual([]);
  });

  test("an unknown discount code names the code as it was typed", async () => {
    const { service } = buildService();

    await expect(service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER, " Summer ")).rejects.toThrow(
      "unknown discount code: Summer",
    );
  });

  test("a declined payment does not use up an order id", async () => {
    const declinedThenAccepted = declineTheFirstChargeOnly();
    const { service } = buildService(declinedThenAccepted);

    await expect(service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER)).rejects.toThrow("payment declined");
    const order = await service.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

    expect(order.id).toBe("ORD-1001");
  });

  test("a second service starts counting again at ORD-1001", async () => {
    const first = buildService().service;
    const second = buildService().service;

    await first.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);
    const orderFromSecondService = await second.placeOrder(buildCartWithNotebooksAndAPen(), CUSTOMER);

    expect(orderFromSecondService.id).toBe("ORD-1001");
  });

  test("stock that was reserved by one order is not available to the next", async () => {
    const { service } = buildService();
    const bigCart = new Cart();
    bigCart.addItem("NB-1", "Notebook", 499, 8);

    await service.placeOrder(bigCart, CUSTOMER);

    const secondBigCart = new Cart();
    secondBigCart.addItem("NB-1", "Notebook", 499, 3);
    await expect(service.placeOrder(secondBigCart, CUSTOMER)).rejects.toThrow("not enough stock for NB-1");
  });
});

function declineTheFirstChargeOnly(): Payments {
  let calls = 0;
  return {
    charge: async () => {
      calls += 1;
      return calls === 1 ? { ok: false, reason: "card expired" } : { ok: true, receiptId: "RCPT-2" };
    },
  };
}
