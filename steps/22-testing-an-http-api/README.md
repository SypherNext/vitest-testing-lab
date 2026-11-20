# Step 22: Testing an HTTP API

Adds the web API with Hono in `src/api/`, the product list in `src/catalogue.ts` and an order store. `tests/api.test.ts` calls the app with `app.request()`, so there is no server and no port. It checks the status code and the JSON for each case.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 22-testing-an-http-api
```

Result: 210 passed | 1 expected fail | 2 skipped | 2 todo (215). The output of a real run is saved in `expected-output.txt`.
