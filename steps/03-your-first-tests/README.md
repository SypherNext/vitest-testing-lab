# Step 03: Your First Tests

`tests/money.test.ts` now has nine tests for `formatPrice` and `percentOf`, including the rounding case where 50% of 5 cents is 3. Each test has three parts: arrange, act, assert. There is no new code in `src/`.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 03-your-first-tests
```

Result: 9 passed (9). The output of a real run is saved in `expected-output.txt`.
