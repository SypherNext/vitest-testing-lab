// Lists the slowest tests of a project. Vitest has no "--durations" flag, but its JSON reporter
// records how long every test took, so a few lines of code can rank them.
//
// Run it from the repo root:
//   node steps/27-running-tests-in-ci-and-making-them-fast/slowest-tests.mjs <project folder> [how many]
//   node steps/27-running-tests-in-ci-and-making-them-fast/slowest-tests.mjs steps/26-milestone-the-shop-tested 5
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const [projectFolder, howMany = "5"] = process.argv.slice(2);
if (!projectFolder) {
  console.error("Tell me which project folder to run, for example: steps/26-milestone-the-shop-tested");
  process.exit(2);
}

const reportFolder = mkdtempSync(path.join(tmpdir(), "slowest-tests-"));
const reportFile = path.join(reportFolder, "report.json");

try {
  // The test run itself prints nothing here (stdio is ignored): we only want the report file.
  spawnSync(
    process.execPath,
    ["node_modules/vitest/vitest.mjs", "run", "--root", projectFolder, "--reporter=json", `--outputFile=${reportFile}`],
    { stdio: "ignore" },
  );

  const report = JSON.parse(readFileSync(reportFile, "utf8"));
  const tests = report.testResults.flatMap((file) => file.assertionResults);
  const slowest = tests
    .filter((test) => test.status === "passed")
    .sort((first, second) => second.duration - first.duration)
    .slice(0, Number(howMany));

  console.log(`The ${slowest.length} slowest of ${tests.length} tests:`);
  for (const test of slowest) {
    console.log(`${test.fullName}  ${Math.round(test.duration)}ms`);
  }
} finally {
  rmSync(reportFolder, { recursive: true, force: true });
}
