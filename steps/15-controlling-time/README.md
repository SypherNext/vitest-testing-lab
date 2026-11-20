# Step 15: Controlling Time

Adds the real clock in `src/clock.ts` and the `ReservationBook` in `src/reservations.ts`. The tests control time in two ways: by passing in a clock, and by using `vi.useFakeTimers` and `vi.setSystemTime`.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 15-controlling-time
```

Result: 110 passed (110). The output of a real run is saved in `expected-output.txt`.
