# Step 14: Testing Async Code and Network Calls

`payments.charge` and `placeOrder` now return Promises, so the order tests use `async` and `await`. The service also puts the stock back if the payment service breaks. Adds `RateClient`, which asks a web service for exchange rates; its tests replace `fetch` with `vi.stubGlobal`, so no test touches the network.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 14-testing-async-code-and-network-calls
```

Result: 98 passed (98). The output of a real run is saved in `expected-output.txt`.
