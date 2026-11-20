import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, vi } from "vitest";
import { createLogger } from "../src/logger.ts";
import { exportOrdersToFile } from "../src/order-export.ts";
import { renderReceipt } from "../src/receipt.ts";
import { buildApp, postOrder } from "./support/api-test.ts";
import { test } from "./support/database-test.ts";

// The capstone test: the pieces that were tested one by one now work together.
// A request goes in through the web app, the order service places it, the order is saved in a real (in-memory)
// SQLite database, and then it is read back, printed on a receipt and exported to a file.
// There are only a few of these tests. The many small tests above find the bugs; these confirm the wiring.

describe("the whole shop", () => {
  let folder: string;

  beforeEach(async () => {
    folder = await mkdtemp(path.join(os.tmpdir(), "corner-shop-capstone-"));
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(folder, { recursive: true, force: true });
  });

  test("saves an order placed through the API in the database", async ({ repository }) => {
    const { app } = buildApp({ orders: repository });

    const response = await postOrder(app, {
      email: "sam@example.com",
      discountCode: "SAVE10",
      items: [
        { sku: "NB-1", quantity: 2 },
        { sku: "PN-1", quantity: 1 },
      ],
    });

    expect(response.status).toBe(201);
    expect(repository.findById("ORD-1001")).toMatchObject({ email: "sam@example.com", totalCents: 1532 });
  });

  test("reads the saved order back through the API", async ({ repository }) => {
    const { app } = buildApp({ orders: repository });
    await postOrder(app, { email: "sam@example.com", items: [{ sku: "PN-1", quantity: 2 }] });

    const response = await app.request("/orders/ORD-1001");

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ id: "ORD-1001", subtotalCents: 300, totalCents: 799 });
  });

  test("prints a receipt for a saved order", async ({ repository }) => {
    const { app } = buildApp({ orders: repository });
    await postOrder(app, { email: "sam@example.com", discountCode: "SAVE10", items: [{ sku: "NB-1", quantity: 2 }] });

    const order = repository.findById("ORD-1001");

    expect(order && renderReceipt(order)).toContain("Discount (SAVE10)");
  });

  test("prints a receipt without a discount line for an order without a code", async ({ repository }) => {
    const { app } = buildApp({ orders: repository });
    await postOrder(app, { email: "sam@example.com", items: [{ sku: "NB-1", quantity: 2 }] });

    const order = repository.findById("ORD-1001");

    expect(order && renderReceipt(order)).not.toContain("Discount");
  });

  test("exports the saved orders of a customer to a CSV file", async ({ repository }) => {
    const { app } = buildApp({ orders: repository });
    await postOrder(app, { email: "sam@example.com", items: [{ sku: "PN-1", quantity: 1 }] });
    await postOrder(app, { email: "sam@example.com", items: [{ sku: "NB-1", quantity: 1 }] });
    const file = path.join(folder, "sam.csv");

    await exportOrdersToFile(repository.listByEmail("sam@example.com"), file, createLogger("info"));

    const lines = (await readFile(file, "utf8")).trim().split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain("ORD-1001");
    expect(lines[2]).toContain("ORD-1002");
  });
});
