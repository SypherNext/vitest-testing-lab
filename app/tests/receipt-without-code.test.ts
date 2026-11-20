import { expect, test } from "vitest";
import { renderReceipt } from "../src/receipt.ts";
import { sampleOrder } from "./support/sample-orders.ts";

// The coverage report in step 25 showed that one branch of renderReceipt was never run:
// a discount with no code name. This test runs it and closes the gap.
test("renderReceipt labels a discount that has no code simply as Discount", () => {
  const receipt = renderReceipt(sampleOrder({ discountCode: null }));

  expect(receipt).toContain("Discount                -$1.15");
});
