# Step 27: Running Tests in CI and Making Them Fast

Same code as step 26. Adds `example-ci.yml` (a workflow you can copy into your own project) and `slowest-tests.mjs`, a script that lists the slowest tests. The saved outputs in `extra-outputs/` show runs with and without parallel files, and the tests split into shards. The real workflow of this repo is `.github/workflows/ci.yml`; it could not be run while writing the course, so it was only checked with a YAML parser.

Run it from the top folder of the repo:

```powershell
npm.cmd run test:step -- 27-running-tests-in-ci-and-making-them-fast
```

Result: 239 passed | 1 expected fail | 2 skipped | 2 todo (244). The output of a real run is saved in `expected-output.txt`.

List the slowest tests of a project (the example project has two slow tests on purpose):

```powershell
node steps/27-running-tests-in-ci-and-making-them-fast/slowest-tests.mjs demos/slowest-tests 2
```

Run without parallel files, or split the run into three shards:

```powershell
npm.cmd run test:step -- 27 --no-file-parallelism
npm.cmd run test:step -- 27 --shard=1/3
```
