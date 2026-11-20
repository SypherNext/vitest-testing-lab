# Step 10: Fixtures in Depth

Adds `tests/support/test-with-carts.ts`, where `test.extend` makes fixtures (`cart`, `filledCart`, `makeCart` and `cartAtRest`). `tests/cart.test.ts` now asks for the fixtures it needs by name. It also uses `beforeAll` for data that tests only read.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 10-fixtures-in-depth
```

Result: 59 passed (59). The output of a real run is saved in `expected-output.txt`.
