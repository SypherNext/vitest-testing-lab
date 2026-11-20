# Step 12: Test Doubles: Stubs, Fakes and Spies

Adds the `OrderService` (`order-service.ts`, `order.ts` and `ports.ts`). It gets its four helpers passed in, so the tests give it hand-written stand-ins from `tests/support/fakes.ts`: a fake inventory, a stub for payments, a spy for notifications and a fixed clock. In this step `charge` still answers straight away.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 12-test-doubles-stubs-fakes-and-spies
```

Result: 75 passed (75). The output of a real run is saved in `expected-output.txt`.
