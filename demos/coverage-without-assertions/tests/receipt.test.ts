import { test } from "vitest";
import { renderReceipt } from "../src/receipt.ts";
import { sampleOrder } from "./sample-orders.ts";

// These tests run every line and every branch of the receipt code, so coverage is 100%.
// But they check NOTHING: there is no expect. If renderReceipt printed rubbish, they would still pass.
// Coverage says what code ran. It cannot say whether the code is right.
test("runs the receipt code with a discount", () => {
  renderReceipt(sampleOrder());
});

test("runs the receipt code without a discount", () => {
  renderReceipt(sampleOrder({ discountCode: null, discountCents: 0 }));
});

test("runs the receipt code with a discount that has no code", () => {
  renderReceipt(sampleOrder({ discountCode: null }));
});
