import type { Hono } from "hono";
import { test as baseTest } from "vitest";
import { createApp } from "../../src/api/app.ts";
import { InMemoryOrderStore } from "../../src/order-store.ts";
import { OrderService } from "../../src/order-service.ts";
import { FakeInventory, FixedClock, SpyNotifier, StubPayments } from "./fakes.ts";

export const PLACED_AT = new Date("2026-03-14T09:30:00Z");

// "shop": the web app plus the stand-ins behind it, built fresh for every test.
// The tote bag has only 2 in stock, so a test can ask for 3 and get an out-of-stock answer.
export const test = baseTest.extend("shop", () => {
  const inventory = new FakeInventory({ "NB-1": 10, "PN-1": 10, "BG-1": 2 });
  const payments = new StubPayments();
  const notifier = new SpyNotifier();
  const orders = new InMemoryOrderStore();
  const orderService = new OrderService(inventory, payments, notifier, new FixedClock(PLACED_AT));
  return { app: createApp({ orderService, orders }), inventory, payments, notifier, orders };
});

// Sends a POST /orders request to the app, the way a real client would, and returns the response.
export function postOrder(app: Hono, body: unknown): Promise<Response> {
  return Promise.resolve(
    app.request("/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}
