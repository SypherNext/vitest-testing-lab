# Step 25: Measuring Coverage

Adds the coverage settings to `vitest.config.ts` (`@vitest/coverage-v8`, a report in the terminal and thresholds). Run with `--coverage` to see the report. One branch of `receipt.ts` is not covered yet, and the next steps close that gap. Demos: `demos/coverage-threshold` and `demos/coverage-without-assertions`.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 25-measuring-coverage --coverage
```

Result: 239 passed | 1 expected fail | 2 skipped | 2 todo (244). The output of a real run is saved in `expected-output.txt`.

Coverage is only measured when you ask for it with `--coverage`.
