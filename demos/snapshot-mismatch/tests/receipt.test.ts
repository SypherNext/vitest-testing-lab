import { expect, test } from "vitest";
import { renderReceipt } from "../src/receipt.ts";
import { sampleOrder } from "./sample-orders.ts";

// The saved copy of this receipt (tests/__snapshots__/receipt.test.ts.snap) has a line that says "Shipping".
// Someone has since changed the code to print "Delivery" there. The snapshot test notices.
test("prints the whole receipt for an order with a discount", () => {
  expect(renderReceipt(sampleOrder())).toMatchSnapshot();
});
