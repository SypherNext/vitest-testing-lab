# Step 13: Mocking Functions and Modules

Adds `tests/order-service-mocks.test.ts`, which tests the same service with `vi.fn`, `vi.spyOn` and `vi.mock` instead of hand-written stand-ins. No new code in `src/`.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 13-mocking-functions-and-modules
```

Result: 84 passed (84). The output of a real run is saved in `expected-output.txt`.
