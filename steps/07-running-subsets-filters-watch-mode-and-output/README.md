# Step 07: Running Subsets: Filters, Watch Mode and Output

Same code as step 06. Only the way of running changes. The saved outputs in `extra-outputs/` show how to run one test by name, one file, a list of tests and the `verbose` and `dot` reporters. Watch mode (`npx vitest`) needs a terminal you can type into, so it has no saved output.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 07-running-subsets-filters-watch-mode-and-output
```

Result: 42 passed (42). The output of a real run is saved in `expected-output.txt`.

Try some of the filters:

```powershell
npm.cmd run test:step -- 07 -t "formatPrice"
npm.cmd run test:step -- 07 cart
npm.cmd run test:step -- 07 --reporter=verbose tests/money.test.ts
```
