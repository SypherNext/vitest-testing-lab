# Step 20: Markers, Skips and Expected Failures

Adds `vitest.config.ts` with a list of tags, and `tests/markers.test.ts` with `test.skip`, `test.todo`, `test.fails`, `test.skipIf` and tags. The file `large-cart.slow.test.ts` shows marking tests by file name. The saved outputs in `extra-outputs/` show how to pick tests by tag.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 20-markers-skips-and-expected-failures
```

Result: 175 passed | 1 expected fail | 2 skipped | 2 todo (180). The output of a real run is saved in `expected-output.txt`.

Pick tests by tag, by file name, or turn on the skipped slow check:

```powershell
npm.cmd run test:step -- 20 --tags-filter=slow
npm.cmd run test:step -- 20 --tags-filter="not slow"
npm.cmd run test:step -- 20 slow
$env:RUN_SLOW_CHECKS = "1"
npm.cmd run test:step -- 20 tests/markers.test.ts
Remove-Item Env:RUN_SLOW_CHECKS
```

The variable only lives in this PowerShell window. The last line removes it again.
