# Step 29: Designing Good Tests

A refactor of the tests. Three test files each built their own order service from stand-ins, so that code moved into `tests/support/order-service-builder.ts`, and the API tests use it too. The number of tests stays the same as in step 28.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 29-designing-good-tests
```

Result: 243 passed | 1 expected fail | 2 skipped | 2 todo (248). The output of a real run is saved in `expected-output.txt`.
