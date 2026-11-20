import type { DatabaseSync } from "node:sqlite";
import { DuplicateOrderError } from "./errors.ts";
import type { Order } from "./order.ts";
import { toIsoSeconds } from "./timestamps.ts";

interface OrderRow {
  id: string;
  email: string;
  subtotal_cents: number;
  discount_code: string | null;
  discount_cents: number;
  shipping_cents: number;
  total_cents: number;
  placed_at: string;
  receipt_id: string;
}

interface LineRow {
  sku: string;
  name: string;
  unit_price_cents: number;
  quantity: number;
}

// The text SQLite uses when a second order is saved with an id that is already taken.
const DUPLICATE_ORDER_ID_MESSAGE = "UNIQUE constraint failed: orders.id";

// Saves orders to a database and reads them back.
export class OrderRepository {
  private readonly database: DatabaseSync;

  constructor(database: DatabaseSync) {
    this.database = database;
  }

  // The order and all its lines are saved together, or not at all.
  save(order: Order): void {
    this.database.exec("BEGIN");
    try {
      this.insertOrder(order);
      this.insertLines(order);
      this.database.exec("COMMIT");
    } catch (error) {
      this.database.exec("ROLLBACK");
      if (error instanceof Error && error.message.includes(DUPLICATE_ORDER_ID_MESSAGE)) {
        throw new DuplicateOrderError(order.id);
      }
      throw error;
    }
  }

  findById(orderId: string): Order | undefined {
    const row = this.database.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as OrderRow | undefined;
    return row ? this.toOrder(row) : undefined;
  }

  // The orders of one customer, oldest first.
  listByEmail(email: string): Order[] {
    const rows = this.database
      .prepare("SELECT * FROM orders WHERE email = ? ORDER BY placed_at, id")
      .all(email) as unknown as OrderRow[];
    return rows.map((row) => this.toOrder(row));
  }

  totalSpentCents(email: string): number {
    const row = this.database
      .prepare("SELECT COALESCE(SUM(total_cents), 0) AS total FROM orders WHERE email = ?")
      .get(email) as { total: number };
    return row.total;
  }

  private insertOrder(order: Order): void {
    this.database
      .prepare(
        `INSERT INTO orders
           (id, email, subtotal_cents, discount_code, discount_cents, shipping_cents, total_cents, placed_at, receipt_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        order.id,
        order.email,
        order.subtotalCents,
        order.discountCode,
        order.discountCents,
        order.shippingCents,
        order.totalCents,
        toIsoSeconds(order.placedAt),
        order.receiptId,
      );
  }

  private insertLines(order: Order): void {
    const insertLine = this.database.prepare(
      "INSERT INTO order_lines (order_id, sku, name, unit_price_cents, quantity) VALUES (?, ?, ?, ?, ?)",
    );
    for (const line of order.lines) {
      insertLine.run(order.id, line.sku, line.name, line.unitPriceCents, line.quantity);
    }
  }

  private toOrder(row: OrderRow): Order {
    const lineRows = this.database
      .prepare("SELECT sku, name, unit_price_cents, quantity FROM order_lines WHERE order_id = ? ORDER BY rowid")
      .all(row.id) as unknown as LineRow[];

    return {
      id: row.id,
      email: row.email,
      lines: lineRows.map((line) => ({
        sku: line.sku,
        name: line.name,
        unitPriceCents: line.unit_price_cents,
        quantity: line.quantity,
        lineTotalCents: line.unit_price_cents * line.quantity,
      })),
      subtotalCents: row.subtotal_cents,
      discountCode: row.discount_code,
      discountCents: row.discount_cents,
      shippingCents: row.shipping_cents,
      totalCents: row.total_cents,
      placedAt: new Date(row.placed_at),
      receiptId: row.receipt_id,
    };
  }
}
