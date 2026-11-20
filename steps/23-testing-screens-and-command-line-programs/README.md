# Step 23: Testing Screens and Command-Line Programs

Adds the cart widget in `src/ui/cart-widget.ts`. Its tests run in happy-dom (a pretend web page) and find things with `@testing-library/dom`, the way a person looks at the screen. This repo has no command-line program: the Python repo tests one with `capsys` and `subprocess`.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 23-testing-screens-and-command-line-programs
```

Result: 221 passed | 1 expected fail | 2 skipped | 2 todo (226). The output of a real run is saved in `expected-output.txt`.
