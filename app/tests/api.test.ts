import { describe, expect } from "vitest";
import { buildApp, postOrder, test } from "./support/api-test.ts";

// These tests call the app with app.request(), which is a pretend HTTP request: no server, no port, no network.
// They check what a client sees: the status code and the JSON body.

const NOTEBOOKS_AND_A_PEN = {
  email: "sam@example.com",
  items: [
    { sku: "NB-1", quantity: 2 },
    { sku: "PN-1", quantity: 1 },
  ],
};

describe("POST /orders", () => {
  describe("when the order is placed", () => {
    test("answers 201 with the id, the total and the time", async ({ shop }) => {
      const response = await postOrder(shop.app, NOTEBOOKS_AND_A_PEN);

      expect(response.status).toBe(201);
      expect(await response.json()).toEqual({ id: "ORD-1001", totalCents: 1647, placedAt: "2026-03-14T09:30:00Z" });
    });

    test("answers with JSON", async ({ shop }) => {
      const response = await postOrder(shop.app, NOTEBOOKS_AND_A_PEN);

      expect(response.headers.get("content-type")).toContain("application/json");
    });

    test("applies a discount code", async ({ shop }) => {
      const response = await postOrder(shop.app, { ...NOTEBOOKS_AND_A_PEN, discountCode: "SAVE10" });

      expect(await response.json()).toMatchObject({ totalCents: 1532 });
    });

    test("ships a big order for free", async ({ shop }) => {
      const response = await postOrder(shop.app, { email: "sam@example.com", items: [{ sku: "BG-1", quantity: 2 }] });

      expect(await response.json()).toMatchObject({ totalCents: 5000 });
    });

    test("takes the prices from the catalogue, not from the request", async ({ shop }) => {
      const body = { email: "sam@example.com", items: [{ sku: "PN-1", quantity: 1, unitPriceCents: 1 }] };

      const response = await postOrder(shop.app, body);

      expect(await response.json()).toMatchObject({ totalCents: 150 + 499 });
    });

    test("reserves the stock and sends one confirmation", async ({ shop }) => {
      await postOrder(shop.app, NOTEBOOKS_AND_A_PEN);

      expect(shop.inventory.available("NB-1")).toBe(8);
      expect(shop.notifier.sent).toHaveLength(1);
    });
  });

  describe("when the request is not valid (422)", () => {
    test.for([
      { why: "the body is not JSON", body: "{not json", message: "request body must be valid JSON" },
      { why: "the body is a list", body: [], message: "request body must be a JSON object" },
      { why: "there is no email", body: { items: [{ sku: "PN-1", quantity: 1 }] }, message: "email must be a valid email address" },
      {
        why: "the email has no @",
        body: { email: "sam.example.com", items: [{ sku: "PN-1", quantity: 1 }] },
        message: "email must be a valid email address",
      },
      { why: "there are no items", body: { email: "sam@example.com" }, message: "items must be a non-empty list" },
      { why: "the item list is empty", body: { email: "sam@example.com", items: [] }, message: "items must be a non-empty list" },
      { why: "an item has no sku", body: { email: "sam@example.com", items: [{ quantity: 1 }] }, message: "each item needs a sku" },
      { why: "an item has an empty sku", body: { email: "sam@example.com", items: [{ sku: "", quantity: 1 }] }, message: "each item needs a sku" },
      { why: "an item has no quantity", body: { email: "sam@example.com", items: [{ sku: "PN-1" }] }, message: "each item needs a quantity" },
      {
        why: "the sku is not in the catalogue",
        body: { email: "sam@example.com", items: [{ sku: "ZZ-9", quantity: 1 }] },
        message: "unknown sku: ZZ-9",
      },
      {
        why: "the quantity is zero",
        body: { email: "sam@example.com", items: [{ sku: "PN-1", quantity: 0 }] },
        message: "quantity must be a positive whole number",
      },
      {
        why: "the discount code is not text",
        body: { ...NOTEBOOKS_AND_A_PEN, discountCode: 10 },
        message: "discountCode must be text",
      },
      {
        why: "the discount code is unknown",
        body: { ...NOTEBOOKS_AND_A_PEN, discountCode: "Summer" },
        message: "unknown discount code: Summer",
      },
      {
        why: "SAVE25 is used on a small order",
        body: { ...NOTEBOOKS_AND_A_PEN, discountCode: "SAVE25" },
        message: "SAVE25 needs a subtotal of at least $50.00",
      },
    ])("answers 422 when $why", async ({ body, message }, { shop }) => {
      const response = await postOrder(shop.app, body);

      expect(response.status).toBe(422);
      expect(await response.json()).toEqual({ error: message });
    });
  });

  describe("when there is not enough stock (409)", () => {
    test("answers 409 and names the sku", async ({ shop }) => {
      const response = await postOrder(shop.app, { email: "sam@example.com", items: [{ sku: "BG-1", quantity: 3 }] });

      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({ error: "not enough stock for BG-1" });
    });
  });

  describe("when the payment is declined (402)", () => {
    test("answers 402 with the reason", async () => {
      const declined = { charge: async () => ({ ok: false, reason: "card expired" }) as const };
      const { app } = buildApp({ payments: declined });

      const response = await postOrder(app, NOTEBOOKS_AND_A_PEN);

      expect(response.status).toBe(402);
      expect(await response.json()).toEqual({ error: "payment declined: card expired" });
    });
  });

  describe("when something breaks inside the shop (500)", () => {
    test("answers 500 and keeps the details private", async () => {
      const broken = {
        charge: async () => {
          throw new Error("database password is hunter2");
        },
      };
      const { app } = buildApp({ payments: broken });

      const response = await postOrder(app, NOTEBOOKS_AND_A_PEN);

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: "something went wrong" });
    });
  });
});

describe("GET /orders/:id", () => {
  test("answers 200 with the whole order after it was placed", async ({ shop }) => {
    await postOrder(shop.app, { ...NOTEBOOKS_AND_A_PEN, discountCode: "save10" });

    const response = await shop.app.request("/orders/ORD-1001");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
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
      placedAt: "2026-03-14T09:30:00Z",
      receiptId: "RCPT-1",
    });
  });

  test("answers 404 when there is no such order", async ({ shop }) => {
    const response = await shop.app.request("/orders/ORD-9999");

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "order not found" });
  });

  test("does not keep an order that was refused", async ({ shop }) => {
    await postOrder(shop.app, { email: "sam@example.com", items: [{ sku: "BG-1", quantity: 3 }] });

    const response = await shop.app.request("/orders/ORD-1001");

    expect(response.status).toBe(404);
  });
});

describe("an unknown route", () => {
  test("answers 404 with the same JSON shape", async ({ shop }) => {
    const response = await shop.app.request("/nothing-here");

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "not found" });
  });
});
