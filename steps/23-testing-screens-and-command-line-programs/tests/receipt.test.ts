import { describe, expect, test } from "vitest";
import { renderReceipt } from "../src/receipt.ts";
import { sampleOrder } from "./support/sample-orders.ts";

// A snapshot test saves the output the first time it runs, then compares every later run with the saved copy.
// It is good for long text that is boring to write out by hand. You still have to READ the saved copy
// and decide that it is right: a snapshot only says "same as before", never "correct".

describe("renderReceipt", () => {
  describe("with a snapshot stored in a file", () => {
    // The first run writes tests/__snapshots__/receipt.test.ts.snap. Later runs compare with it.
    test("prints the whole receipt for an order with a discount", () => {
      expect(renderReceipt(sampleOrder())).toMatchSnapshot();
    });
  });

  describe("with a snapshot written inside the test", () => {
    // An inline snapshot lives in the test file itself, so the expected text is right here to read.
    test("prints the whole receipt for an order without a discount", () => {
      const order = sampleOrder({
        discountCode: null,
        discountCents: 0,
        totalCents: 1647,
      });

      expect(renderReceipt(order)).toMatchInlineSnapshot(`
        "CORNER SHOP
        Order ORD-1001   2026-03-14 09:30 UTC
        ------------------------------
        2 x Notebook             $9.98
        1 x Pen                  $1.50
        ------------------------------
        Subtotal                $11.48
        Shipping                 $4.99
        Total                   $16.47"
      `);
    });
  });

  // Snapshots do not replace plain assertions. Rules that matter get their own small test.
  describe("the rules of the layout", () => {
    test("leaves out the discount line when there is no discount", () => {
      const receipt = renderReceipt(sampleOrder({ discountCode: null, discountCents: 0 }));

      expect(receipt).not.toContain("Discount");
    });

    test("shows the discount code and the amount as a negative price", () => {
      const receipt = renderReceipt(sampleOrder());

      expect(receipt).toContain("Discount (SAVE10)");
      expect(receipt).toContain("-$1.15");
    });

    test("makes every row under the header exactly 30 characters wide", () => {
      const rows = renderReceipt(sampleOrder()).split("\n").slice(2);

      expect(rows.every((line) => line.length === 30)).toBe(true);
    });

    test("puts the amounts on the right edge", () => {
      const totalRow = renderReceipt(sampleOrder()).split("\n").at(-1);

      expect(totalRow).toBe("Total                   $15.32");
      expect(totalRow?.endsWith("$15.32")).toBe(true);
    });

    test("keeps one space between a very long name and its price", () => {
      const longName = "Notebook with a very long leather cover";
      const order = sampleOrder({
        lines: [{ sku: "NB-9", name: longName, unitPriceCents: 1200, quantity: 1, lineTotalCents: 1200 }],
      });

      const itemRow = renderReceipt(order).split("\n")[3];

      expect(itemRow).toBe(`1 x ${longName} $12.00`);
    });

    test("shows the order id and the time in UTC", () => {
      const secondLine = renderReceipt(sampleOrder()).split("\n")[1];

      expect(secondLine).toBe("Order ORD-1001   2026-03-14 09:30 UTC");
    });
  });
});
