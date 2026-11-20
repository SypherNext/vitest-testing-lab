/**
 * Every test in this file uses the database, so the whole file gets the "database" tag.
 * Run only these tests with:  --tags-filter=database
 * @module-tag database
 */
import { describe, expect } from "vitest";
import { createSchema } from "../src/database.ts";
import { DuplicateOrderError } from "../src/errors.ts";
import { test } from "./support/database-test.ts";
import { sampleOrder } from "./support/sample-orders.ts";

describe("the database schema", () => {
  test("starts with an empty orders table", ({ database }) => {
    const row = database.prepare("SELECT COUNT(*) AS total FROM orders").get();

    expect(row).toEqual({ total: 0 });
  });

  test("can be created twice without an error", ({ database }) => {
    expect(() => createSchema(database)).not.toThrow();
  });

  test("refuses a line for an order that does not exist", ({ database }) => {
    const insertLine = () =>
      database
        .prepare("INSERT INTO order_lines (order_id, sku, name, unit_price_cents, quantity) VALUES (?, ?, ?, ?, ?)")
        .run("ORD-0000", "PN-1", "Pen", 150, 1);

    expect(insertLine).toThrow(/FOREIGN KEY constraint failed/);
  });
});

describe("OrderRepository", () => {
  describe("save and findById", () => {
    test("gives back the order that was saved, lines and all", ({ repository }) => {
      const order = sampleOrder();

      repository.save(order);

      expect(repository.findById("ORD-1001")).toEqual(order);
    });

    test("keeps the lines in the order they were saved", ({ repository }) => {
      repository.save(sampleOrder());

      const names = repository.findById("ORD-1001")?.lines.map((line) => line.name);

      expect(names).toEqual(["Notebook", "Pen"]);
    });

    test("keeps an order without a discount code", ({ repository }) => {
      repository.save(sampleOrder({ discountCode: null, discountCents: 0 }));

      expect(repository.findById("ORD-1001")?.discountCode).toBeNull();
    });

    test("gives back undefined for an order that was never saved", ({ repository }) => {
      expect(repository.findById("ORD-9999")).toBeUndefined();
    });

    test("does not see the order from the test before, because every test has its own database", ({ repository }) => {
      expect(repository.findById("ORD-1001")).toBeUndefined();
    });
  });

  describe("a unique constraint", () => {
    test("refuses a second order with the same id", ({ repository }) => {
      repository.save(sampleOrder());

      expect(() => repository.save(sampleOrder({ email: "other@example.com" }))).toThrow(DuplicateOrderError);
      expect(() => repository.save(sampleOrder({ email: "other@example.com" }))).toThrow(
        "order ORD-1001 already exists",
      );
    });

    test("keeps the first order when the second is refused", ({ repository }) => {
      repository.save(sampleOrder());

      expect(() => repository.save(sampleOrder({ email: "other@example.com" }))).toThrow();

      expect(repository.findById("ORD-1001")?.email).toBe("sam@example.com");
    });
  });

  describe("a rollback", () => {
    // Two lines with the same sku break the lines table's primary key. The order row was already inserted by then.
    const orderWithTwoLinesForTheSameSku = () =>
      sampleOrder({
        lines: [
          { sku: "PN-1", name: "Pen", unitPriceCents: 150, quantity: 1, lineTotalCents: 150 },
          { sku: "PN-1", name: "Pen", unitPriceCents: 150, quantity: 2, lineTotalCents: 300 },
        ],
      });

    test("undoes the whole save when one line cannot be saved", ({ repository }) => {
      expect(() => repository.save(orderWithTwoLinesForTheSameSku())).toThrow(/UNIQUE constraint failed/);

      expect(repository.findById("ORD-1001")).toBeUndefined();
    });

    test("leaves no lines behind", ({ repository, database }) => {
      expect(() => repository.save(orderWithTwoLinesForTheSameSku())).toThrow();

      const row = database.prepare("SELECT COUNT(*) AS total FROM order_lines").get();
      expect(row).toEqual({ total: 0 });
    });

    test("lets the next save work normally", ({ repository }) => {
      expect(() => repository.save(orderWithTwoLinesForTheSameSku())).toThrow();

      repository.save(sampleOrder());

      expect(repository.findById("ORD-1001")).toBeDefined();
    });
  });

  describe("queries", () => {
    test("listByEmail gives only that customer's orders, oldest first", ({ repository }) => {
      repository.save(sampleOrder({ id: "ORD-1002", placedAt: new Date("2026-03-15T10:00:00Z") }));
      repository.save(sampleOrder({ id: "ORD-1001", placedAt: new Date("2026-03-14T09:30:00Z") }));
      repository.save(sampleOrder({ id: "ORD-1003", email: "ana@example.com" }));

      const ids = repository.listByEmail("sam@example.com").map((order) => order.id);

      expect(ids).toEqual(["ORD-1001", "ORD-1002"]);
    });

    test("listByEmail gives an empty list for a customer with no orders", ({ repository }) => {
      expect(repository.listByEmail("nobody@example.com")).toEqual([]);
    });

    test("totalSpentCents adds up the totals of one customer", ({ repository }) => {
      repository.save(sampleOrder({ id: "ORD-1001", totalCents: 1532 }));
      repository.save(sampleOrder({ id: "ORD-1002", totalCents: 2000 }));
      repository.save(sampleOrder({ id: "ORD-1003", email: "ana@example.com", totalCents: 9999 }));

      expect(repository.totalSpentCents("sam@example.com")).toBe(3532);
    });

    test("totalSpentCents is 0 for a customer with no orders", ({ repository }) => {
      expect(repository.totalSpentCents("nobody@example.com")).toBe(0);
    });
  });
});
