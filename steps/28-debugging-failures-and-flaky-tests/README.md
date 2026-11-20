# Step 28: Debugging Failures and Flaky Tests

Adds `tests/cart-isolation.test.ts`, the fixed version of tests that failed at random. The broken version is in `demos/flaky-shuffle`. The saved outputs in `extra-outputs/` run the suite in random order with a fixed seed, run one file, run one test and stop after the first failure.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 28-debugging-failures-and-flaky-tests
```

Result: 243 passed | 1 expected fail | 2 skipped | 2 todo (248). The output of a real run is saved in `expected-output.txt`.

Run the suite in a random order with a fixed seed, so a failure can be repeated:

```powershell
npm.cmd run test:step -- 28 --sequence.shuffle --sequence.seed=1
```
