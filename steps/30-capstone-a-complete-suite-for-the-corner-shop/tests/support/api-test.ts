import type { Hono } from "hono";
import { test as baseTest } from "vitest";
import { createApp } from "../../src/api/app.ts";
import { InMemoryOrderStore, type OrderStore } from "../../src/order-store.ts";
import type { Payments } from "../../src/ports.ts";
import { buildOrderService } from "./order-service-builder.ts";

// Builds the web app on top of the shared order service builder. Pass the same options (stock, payments)
// to change what stands behind the app. Pass your own `orders` store to keep the orders somewhere else,
// for example in a database.
export function buildApp(options: { stock?: Record<string, number>; payments?: Payments; orders?: OrderStore } = {}) {
  const orders = options.orders ?? new InMemoryOrderStore();
  const { service, ...standIns } = buildOrderService(options);
  return { app: createApp({ orderService: service, orders }), orders, ...standIns };
}

// "shop": the web app plus the stand-ins behind it, built fresh for every test.
// The tote bag has only 2 in stock, so a test can ask for 3 and get an out-of-stock answer.
export const test = baseTest.extend("shop", () => buildApp({ stock: { "NB-1": 10, "PN-1": 10, "BG-1": 2 } }));

// Sends a POST /orders request to the app, the way a real client would, and returns the response.
export async function postOrder(app: Hono, body: unknown): Promise<Response> {
  return app.request("/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
