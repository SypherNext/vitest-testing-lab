# Step 09: Setup and Teardown

Adds `beforeEach` to `tests/cart.test.ts` so every test starts with a new cart, and a shared helper `tests/support/cart-builder.ts`. This is a refactor: the same set-up was typed in many tests, so it moved into one place.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 09-setup-and-teardown
```

Result: 58 passed (58). The output of a real run is saved in `expected-output.txt`.
