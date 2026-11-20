import { expect, test } from "vitest";

// Decimal fractions such as 0.1 and 0.2 cannot be stored exactly in a float, so this comparison fails.
test("0.1 + 0.2 is 0.3", () => {
  expect(0.1 + 0.2).toBe(0.3);
});
