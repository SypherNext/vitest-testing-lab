# Step 21: Snapshot and Golden-File Tests

Adds `src/receipt.ts` and `tests/receipt.test.ts` with a snapshot saved in a file (`tests/__snapshots__/`) and an inline snapshot. The test that fails on purpose is in `demos/snapshot-mismatch`.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 21-snapshot-and-golden-file-tests
```

Result: 183 passed | 1 expected fail | 2 skipped | 2 todo (188). The output of a real run is saved in `expected-output.txt`.

Update the saved snapshots after you have read the change and agree with it:

```powershell
npm.cmd run test:step -- 21 -u
```
