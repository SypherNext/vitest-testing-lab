# Step 11: Parametrized Tests

The tests in `money.test.ts`, `discounts.test.ts` and `shipping.test.ts` that only differ in their numbers are now tables run with `test.each`. This is a refactor: the same checks with much less repeated code.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 11-parametrized-tests
```

Result: 63 passed (63). The output of a real run is saved in `expected-output.txt`.
