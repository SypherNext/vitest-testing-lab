# Step 05: Testing Errors and Edge Cases

Adds `src/errors.ts` (a base `ShopError` and the cart errors), checks for bad input in the cart and in `money.ts`, and `Cart.removeItem`. The new files `cart-errors.test.ts` and `money-errors.test.ts` check errors with `toThrow` and test values right at the edge of what is allowed.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 05-testing-errors-and-edge-cases
```

Result: 42 passed (42). The output of a real run is saved in `expected-output.txt`.
