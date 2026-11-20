import { Hono } from "hono";
import { ValidationError } from "../errors.ts";
import type { OrderService } from "../order-service.ts";
import type { OrderStore } from "../order-store.ts";
import { answerForError } from "./error-status.ts";
import { fullOrderJson, placedOrderJson } from "./order-json.ts";
import { cartFromItems, parseOrderRequest } from "./order-request.ts";

export interface AppDependencies {
  orderService: OrderService;
  orders: OrderStore;
}

// Builds the web app. It gets what it needs passed in, so a test can give it stand-ins and call it
// with app.request(...) without starting a server or opening a port.
export function createApp({ orderService, orders }: AppDependencies): Hono {
  const app = new Hono();

  // The route handlers stay thin: read the request, call the shop code, shape the answer.
  app.post("/orders", async (context) => {
    const body = await context.req.json().catch(() => {
      throw new ValidationError("request body must be valid JSON");
    });
    const request = parseOrderRequest(body);
    const cart = cartFromItems(request.items);

    const order = await orderService.placeOrder(cart, request.email, request.discountCode);
    orders.save(order);

    return context.json(placedOrderJson(order), 201);
  });

  app.get("/orders/:id", (context) => {
    const order = orders.findById(context.req.param("id"));
    if (!order) {
      return context.json({ error: "order not found" }, 404);
    }
    return context.json(fullOrderJson(order));
  });

  // Every error from every route ends up here, so the error answers all look the same: {"error": "..."}.
  app.onError((error, context) => {
    const { status, message } = answerForError(error);
    return context.json({ error: message }, status);
  });

  app.notFound((context) => context.json({ error: "not found" }, 404));

  return app;
}
