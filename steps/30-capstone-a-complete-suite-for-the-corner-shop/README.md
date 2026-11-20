# Step 30: Capstone: A Complete Suite for the Corner Shop

The finished project, the same as `app/`. Adds `tests/shop-end-to-end.test.ts` (API, order service, SQLite, receipt and CSV export working together) and `tests/receipt-without-code.test.ts`, which closes the last coverage gap.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 30-capstone-a-complete-suite-for-the-corner-shop --coverage
```

Result: 249 passed | 1 expected fail | 2 skipped | 2 todo (254). The output of a real run is saved in `expected-output.txt`.
