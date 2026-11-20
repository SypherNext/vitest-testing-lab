# vitest-testing-lab

**This course is for Windows.** Every command below is for PowerShell on Windows 10 or Windows 11.

This repository is the companion code for the Sypher course "Testing with Vitest": the tests are written with Vitest, in TypeScript.

You test a small shop called the Corner Shop. It has money helpers, a shopping cart, discount codes, shipping, an order service, a database for orders, a small web API and a cart widget for a web page. The `app/` folder is the finished project. The `steps/` folder holds the project as it stands at the end of each lesson that changes code, so you can compare your work with a working copy at any point.

## Set up your computer

You need Git and Node.js 26 (the current long-term-support version). Open PowerShell (press the Windows key, type `PowerShell`, press Enter). Install both tools with winget, which comes with Windows:

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
```

Close PowerShell and open it again, so it can find the new tools. Then check them:

```powershell
git --version
node --version
npm.cmd --version
```

`node --version` must print `v26.` or higher. Now get the code and install the packages:

```powershell
git clone <vitest-testing-lab repository URL> vitest-testing-lab
cd vitest-testing-lab
npm.cmd ci
```

**Always type `npm.cmd`, not `npm`.** In PowerShell, plain `npm` runs a script file, and Windows PowerShell removes the `--` from the command. Then options such as `-t` and `--coverage` do not reach Vitest. Your Windows may also block scripts. `npm.cmd` has neither problem.

`npm.cmd ci` installs exactly the versions in `package-lock.json`, so your copy behaves the same as everyone else's. Everything installs into one `node_modules` folder at the top of the repo. The steps and the demos share it, so you install once.

## Run the tests

Every command runs from the top folder of the repo, in PowerShell.

Run the finished project in `app/`:

```powershell
npm.cmd test
```

Run the tests of one step. Use the number, or the full folder name:

```powershell
npm.cmd run test:step -- 04
npm.cmd run test:step -- 04-assertions-equality-collections-and-floats
```

Anything you write after the step name goes to Vitest. For example, to run only the tests whose name contains "formatPrice":

```powershell
npm.cmd run test:step -- 07 -t "formatPrice"
```

Measure coverage (the coverage lessons use this):

```powershell
npm.cmd run test:step -- 25 --coverage
npm.cmd run coverage
```

Check that the whole repo is healthy. This runs every step, compares what each one prints with the saved `expected-output.txt` (ignoring timings), type-checks the code and parses the YAML files:

```powershell
npm.cmd run verify
```

The lessons also show tests that fail on purpose. They live in `demos/` so they never turn the green run red. To check that each demo fails the way it should:

```powershell
npm.cmd run verify:demos
```

To run one demo yourself, for example the failing assertion from lesson 03:

```powershell
node node_modules/vitest/vitest.mjs run --root demos/failing-assertion
```

## Project layout

```text
vitest-testing-lab/
  app/                    the finished project: src/ (the shop) and tests/
  steps/
    01-setup-and-environment/       the project at the end of each lesson that has code
    ...
    30-capstone-a-complete-suite-for-the-corner-shop/
      README.md           what changed in this step and how to run it
      src/                the shop code at this point in the course
      tests/              the tests at this point in the course
      expected-output.txt what the test run prints (saved from a real run, timings removed)
      step.json           extra runs saved for the lessons (optional)
  demos/                  tests that fail on purpose, each with the output it should print
  scripts/
    run-step.mjs          npm.cmd test and npm.cmd run test:step
    verify-all.mjs        npm.cmd run verify
    verify-demos.mjs      npm.cmd run verify:demos
    capture-outputs.mjs   saves new expected-output files from real runs
  .github/workflows/ci.yml  runs verify-all and verify-demos on GitHub (Windows)
  package.json            exact versions of Vitest, Hono and the other tools
  package-lock.json       the exact versions of every package
  tsconfig.json           lets the editor and `npm.cmd run typecheck` check the TypeScript
```

Inside `src/` the shop code is split into small files with one job each: `money.ts`, `cart.ts`, `discounts.ts`, `shipping.ts`, `order-service.ts` (with its helpers described in `ports.ts`), `reservations.ts`, `receipt.ts`, `order-repository.ts` (SQLite), `api/` (the Hono web app) and `ui/` (the cart widget). In `tests/`, files in `tests/support/` are helpers shared by several test files: fakes, builders and fixtures.

Lessons 00 and 31 have no code, so they have no step folder. Step 02 also has a hand-made check you can run with Node: `node steps/02-what-a-test-is-and-how-a-runner-finds-it/manual-check.ts`.

## Troubleshooting

- **`node` or `git` is not recognized.** Close PowerShell and open it again after installing. If it still does not work, sign out of Windows and in again, then check `node --version`.
- **`npm.cmd ci` says the lock file and `package.json` do not match.** Do not edit `package.json` by hand. Run `git status` to see what changed and undo it, then run `npm.cmd ci` again.
- **`Cannot find module` or `vitest` is not found.** You are probably not in the top folder of the repo, or you have not run `npm.cmd ci` yet. Run `Get-Location` to see where you are.
- **`No step called ...`.** The step name is a number such as `04`, or the full folder name from `steps\`. List them with `Get-ChildItem steps`.
- **An error that mentions `node:sqlite`.** Your Node is probably too old. `node:sqlite` is built into Node 26 and needs no flag. Check `node --version`.
- **Snapshot tests fail after you changed the receipt.** That is what they are for. If the new text is right, update the saved copy with `npm.cmd run test:step -- 21 -u` and read the change before you keep it.
- **PowerShell says running scripts is disabled.** That happens when you type `npm` (PowerShell starts a `.ps1` file) and your Windows blocks scripts. This repo always writes `npm.cmd`, which is not a script, so you should not see it. Do not type plain `npm` for the commands here.
- **The output on your screen has colours and times, the saved `expected-output.txt` does not.** The saved files have the timings, colours and your folder paths removed so they are the same on every computer. `npm.cmd run verify` does the same clean-up before it compares.

## License

Copyright (C) 2026 SypherNext

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). You may
use, study and change it. If you share a modified version, or run one as a website or service
that other people use, you must make your full modified source code available under the same
license. See [LICENSE](LICENSE) for the full terms.
