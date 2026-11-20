# Step 24: Property-Based Tests

Adds property tests with fast-check in three files named `*.properties.test.ts`. A property is a rule that must hold for any input, and the library makes up the inputs. The failing run with shrinking is in `demos/property-shrinking`.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 24-property-based-tests
```

Result: 239 passed | 1 expected fail | 2 skipped | 2 todo (244). The output of a real run is saved in `expected-output.txt`.
