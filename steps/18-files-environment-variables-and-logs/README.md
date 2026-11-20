# Step 18: Files, Environment Variables and Logs

Adds `config.ts` (settings from environment variables), `logger.ts`, `timestamps.ts` and `order-export.ts` (a CSV file of orders). The tests use a temporary folder that is deleted afterwards, `vi.stubEnv`, and a spy on `console.log`.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 18-files-environment-variables-and-logs
```

Result: 155 passed (155). The output of a real run is saved in `expected-output.txt`.
