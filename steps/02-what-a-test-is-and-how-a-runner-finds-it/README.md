# Step 02: What a Test Is and How a Runner Finds It

Adds the first piece of the shop: `src/money.ts` with `formatPrice` and `percentOf`. `manual-check.ts` is a tiny test runner made by hand that prints PASS or FAIL. `tests/money.test.ts` holds the same three checks written as real Vitest tests.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 02-what-a-test-is-and-how-a-runner-finds-it
```

Result: 3 passed (3). The output of a real run is saved in `expected-output.txt`.

Run the hand-made check with Node (Node runs `.ts` files directly):

```powershell
node steps/02-what-a-test-is-and-how-a-runner-finds-it/manual-check.ts
```
