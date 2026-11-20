import { DatabaseSync } from "node:sqlite";

// SQLite is a small database that lives in one file, or in memory. node:sqlite comes with Node, nothing to install.

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    subtotal_cents INTEGER NOT NULL,
    discount_code TEXT,
    discount_cents INTEGER NOT NULL,
    shipping_cents INTEGER NOT NULL,
    total_cents INTEGER NOT NULL,
    placed_at TEXT NOT NULL,
    receipt_id TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_lines (
    order_id TEXT NOT NULL REFERENCES orders (id),
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    unit_price_cents INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    PRIMARY KEY (order_id, sku)
  );
`;

export function createSchema(database: DatabaseSync): void {
  database.exec("PRAGMA foreign_keys = ON");
  database.exec(SCHEMA);
}

// ":memory:" is a database that lives only as long as the connection. Perfect for a test: nothing is left behind.
export function openDatabase(location = ":memory:"): DatabaseSync {
  const database = new DatabaseSync(location);
  createSchema(database);
  return database;
}
