# Demos: tests that fail on purpose

Some lessons show a test that fails, so you can learn to read the message. Those tests live here, apart from `app/` and `steps/`, so the normal green run (`npm.cmd run verify`) is never red.

Each folder is a tiny project with its own `src/` and `tests/`. Each has a `demo.json` that says what the lesson shows and what exit code the run must end with, and an `expected-output.txt` with what the run prints (saved from a real run, timings and paths removed).

Run one demo yourself from the top folder of the repo:

```powershell
node node_modules/vitest/vitest.mjs run --root demos/failing-assertion
```

Check that every demo still behaves as described:

```powershell
npm.cmd run verify:demos
```

| Demo | Lesson | What it shows |
| --- | --- | --- |
| `failing-assertion` | 03 | A failing `toBe`: a rounding bug gives 2 instead of 3 |
| `failing-object-equality` | 04 | A failing `toEqual`, with the difference marked in the diff |
| `float-sum` | 04 | Why floats are not compared with `toBe` |
| `error-expectations` | 05 | An error nobody expected, an error that never came and a wrong message |
| `hook-order` | 09 | A passing run that prints from every hook, in the order they run |
| `async-traps` | 14 | Two missing-`await` mistakes |
| `tdd-1-red`, `tdd-2-green`, `tdd-3-red` | 16 | The red and green steps of test-driven development |
| `unknown-tag` | 20 | A mistyped tag is an error, so it cannot hide a test |
| `snapshot-mismatch` | 21 | A snapshot that no longer matches the output |
| `property-shrinking` | 24 | fast-check shrinking a failing input to the smallest one |
| `coverage-threshold` | 25 | All tests pass but the coverage threshold fails the run |
| `coverage-without-assertions` | 25 | 100% coverage from tests that check nothing |
| `slowest-tests` | 27 | A project with two slow tests, used by the `slowest-tests.mjs` script of step 27 |
| `flaky-shuffle` | 28 | Tests that share one cart: they pass in order and fail when shuffled |
