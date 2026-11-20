import { expect, test } from "vitest";
import { renderReceipt } from "../src/receipt.ts";
import { sampleOrder } from "./sample-orders.ts";

// Every test passes. The run still fails, because the coverage threshold is not met.
test("prints the shop name on the first line", () => {
  expect(renderReceipt(sampleOrder()).split("\n")[0]).toBe("CORNER SHOP");
});

test("leaves out the discount line when there is no discount", () => {
  expect(renderReceipt(sampleOrder({ discountCode: null, discountCents: 0 }))).not.toContain("Discount");
});

test("shows the discount code", () => {
  expect(renderReceipt(sampleOrder())).toContain("Discount (SAVE10)");
});
