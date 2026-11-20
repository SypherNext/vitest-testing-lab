# Step 19: Testing a Database

Adds `database.ts` and `order-repository.ts`, which keep orders in SQLite through `node:sqlite` (built into Node, nothing to install). Each test gets its own empty in-memory database from a fixture.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 19-testing-a-database
```

Result: 172 passed (172). The output of a real run is saved in `expected-output.txt`.
