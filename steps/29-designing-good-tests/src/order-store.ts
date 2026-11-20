import type { Order } from "./order.ts";

// Somewhere to keep placed orders so they can be looked up later. The API only knows this interface,
// so the store can be a plain Map (below) or a database table (OrderRepository fits the same shape).
export interface OrderStore {
  save(order: Order): void;
  findById(orderId: string): Order | undefined;
}

export class InMemoryOrderStore implements OrderStore {
  private readonly orders = new Map<string, Order>();

  save(order: Order): void {
    this.orders.set(order.id, order);
  }

  findById(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }
}
