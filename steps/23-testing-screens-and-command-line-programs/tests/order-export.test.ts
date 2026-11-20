import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createLogger } from "../src/logger.ts";
import { exportOrdersToFile, ordersToCsv } from "../src/order-export.ts";
import { sampleOrder } from "./support/sample-orders.ts";

describe("ordersToCsv", () => {
  test("starts with a header line", () => {
    const csv = ordersToCsv([]);

    expect(csv).toBe("id,email,placedAt,subtotalCents,discountCents,shippingCents,totalCents\n");
  });

  test("writes one line per order", () => {
    const csv = ordersToCsv([sampleOrder(), sampleOrder({ id: "ORD-1002", totalCents: 2000 })]);

    expect(csv.split("\n")).toEqual([
      "id,email,placedAt,subtotalCents,discountCents,shippingCents,totalCents",
      "ORD-1001,sam@example.com,2026-03-14T09:30:00Z,1148,115,499,1532",
      "ORD-1002,sam@example.com,2026-03-14T09:30:00Z,1148,115,499,2000",
      "",
    ]);
  });

  test("wraps a field that contains a comma in quotes", () => {
    const csv = ordersToCsv([sampleOrder({ email: "sam,the.man@example.com" })]);

    expect(csv).toContain('"sam,the.man@example.com"');
  });

  test("writes a quote inside a field twice", () => {
    const csv = ordersToCsv([sampleOrder({ email: 'a"b@example.com' })]);

    expect(csv).toContain('"a""b@example.com"');
  });
});

describe("exportOrdersToFile", () => {
  let folder: string;

  // Every test gets its own new folder in the computer's temp area, and it is deleted afterwards.
  beforeEach(async () => {
    folder = await mkdtemp(path.join(os.tmpdir(), "corner-shop-export-"));
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(folder, { recursive: true, force: true });
  });

  test("writes the CSV to the file", async () => {
    const file = path.join(folder, "orders.csv");

    await exportOrdersToFile([sampleOrder()], file, createLogger("info"));

    expect(await readFile(file, "utf8")).toBe(ordersToCsv([sampleOrder()]));
  });

  test("creates the folder when it does not exist yet", async () => {
    const file = path.join(folder, "reports", "march", "orders.csv");

    await exportOrdersToFile([sampleOrder()], file, createLogger("info"));

    expect(await readFile(file, "utf8")).toContain("ORD-1001");
  });

  test("replaces a file that is already there", async () => {
    const file = path.join(folder, "orders.csv");
    await exportOrdersToFile([sampleOrder(), sampleOrder({ id: "ORD-1002" })], file, createLogger("info"));

    await exportOrdersToFile([sampleOrder({ id: "ORD-1003" })], file, createLogger("info"));

    const text = await readFile(file, "utf8");
    expect(text).toContain("ORD-1003");
    expect(text).not.toContain("ORD-1001");
  });

  test("logs one summary line at the info level", async () => {
    const file = path.join(folder, "orders.csv");

    await exportOrdersToFile([sampleOrder(), sampleOrder({ id: "ORD-1002" })], file, createLogger("info"));

    expect(console.log).toHaveBeenCalledExactlyOnceWith(`[info] exported 2 orders to ${file}`);
  });

  test("also logs each order at the debug level", async () => {
    const file = path.join(folder, "orders.csv");

    await exportOrdersToFile([sampleOrder(), sampleOrder({ id: "ORD-1002" })], file, createLogger("debug"));

    expect(console.log).toHaveBeenCalledWith("[debug] exported ORD-1001");
    expect(console.log).toHaveBeenCalledWith("[debug] exported ORD-1002");
    expect(console.log).toHaveBeenCalledTimes(3);
  });
});
