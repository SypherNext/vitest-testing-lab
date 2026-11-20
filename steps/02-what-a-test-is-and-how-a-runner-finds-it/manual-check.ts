// A hand-made "test runner": it calls our code and prints PASS or FAIL.
// Run it from the repo root with:
//   node steps/02-what-a-test-is-and-how-a-runner-finds-it/manual-check.ts
import { formatPrice, percentOf } from "./src/money.ts";

function check(description: string, actual: unknown, expected: unknown): void {
  if (actual === expected) {
    console.log(`PASS  ${description}`);
    return;
  }
  console.log(`FAIL  ${description}`);
  console.log(`      expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
}

check("formatPrice turns 1250 cents into $12.50", formatPrice(1250), "$12.50");
check("formatPrice turns 0 cents into $0.00", formatPrice(0), "$0.00");
check("percentOf finds 10% of 1999 cents", percentOf(1999, 10), 200);
