// One command that checks the whole repo:
//   node scripts/verify-all.mjs            (or: npm.cmd run verify)
//
// 1. runs the tests of "app" and of every step, and fails on any failing test
// 2. compares what each run printed with the saved expected-output files (timings and paths removed)
// 3. checks that app/ is the same code as the last step
// 4. type-checks all TypeScript files and parses the YAML files
// Deliberately failing demos are not part of this: node scripts/verify-demos.mjs checks those.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { absolute, allStepRuns } from "./lib/runs.mjs";
import {
  listSteps,
  normalizeOutput,
  parseTestCounts,
  readExpected,
  repoRoot,
  runCaptured,
  runDescribed,
} from "./lib/steps.mjs";

const failures = [];
let totalChecks = 0;

function report(label, problem) {
  totalChecks += 1;
  if (problem) {
    failures.push(`${label}: ${problem}`);
    console.log(`FAIL  ${label}\n        ${problem.split("\n").join("\n        ")}`);
  } else {
    console.log(`PASS  ${label}`);
  }
}

function firstDifference(expected, actual) {
  const expectedLines = expected.split("\n");
  const actualLines = actual.split("\n");
  for (let index = 0; index < Math.max(expectedLines.length, actualLines.length); index += 1) {
    if (expectedLines[index] !== actualLines[index]) {
      return `first difference at line ${index + 1}\n  expected: ${expectedLines[index] ?? "(nothing)"}\n  actual:   ${actualLines[index] ?? "(nothing)"}`;
    }
  }
  return "outputs differ";
}

// 1 and 2: run everything and compare.
let testsInMainRuns = 0;
for (const { name, projectFolder, run, expectedExitCode, outputFile } of allStepRuns()) {
  const label = name === "main" ? projectFolder : `${projectFolder} [${name}]`;
  const { exitCode, output } = runDescribed(projectFolder, run);
  const expected = readExpected(absolute(outputFile));
  const actual = normalizeOutput(output);

  let problem;
  if (exitCode !== expectedExitCode) problem = `exit code ${exitCode}, expected ${expectedExitCode}`;
  else if (expected === undefined) problem = `${outputFile} is missing (run: node scripts/capture-outputs.mjs)`;
  else if (expected !== actual) problem = `output differs from ${outputFile}\n${firstDifference(expected, actual)}`;

  report(label, problem);
  const counts = name === "main" ? parseTestCounts(actual) : undefined;
  if (counts?.total && projectFolder !== "app") testsInMainRuns += counts.total;
}

// 3: app/ and the last step must hold the same code.
function filesUnder(folder) {
  const found = [];
  const walk = (current) => {
    for (const entry of readdirSync(absolute(current), { withFileTypes: true })) {
      if (["node_modules", "coverage", "expected-output.txt", "extra-outputs", "README.md", "step.json"].includes(entry.name)) continue;
      const relative = path.posix.join(current, entry.name);
      if (entry.isDirectory()) walk(relative);
      else found.push(path.posix.relative(folder, relative));
    }
  };
  walk(folder);
  return found.sort();
}

const lastStep = path.posix.join("steps", listSteps().at(-1));
const appFiles = filesUnder("app");
const lastStepFiles = filesUnder(lastStep);
const sameList = JSON.stringify(appFiles) === JSON.stringify(lastStepFiles);
const sameContent =
  sameList &&
  appFiles.every(
    (file) =>
      readFileSync(absolute(`app/${file}`), "utf8").replaceAll("\r\n", "\n") ===
      readFileSync(absolute(`${lastStep}/${file}`), "utf8").replaceAll("\r\n", "\n"),
  );
report(`app matches ${lastStep}`, sameContent ? undefined : "the two folders hold different files");

// 4: type-check and parse YAML.
const typecheck = runCaptured(process.execPath, ["node_modules/typescript/bin/tsc", "--noEmit"]);
report("typescript type-check", typecheck.exitCode === 0 ? undefined : typecheck.output.trim().split("\n").slice(0, 10).join("\n"));

const yamlFiles = [".github/workflows/ci.yml", ...listSteps().map((step) => `steps/${step}/example-ci.yml`)].filter((file) =>
  existsSync(absolute(file)),
);
for (const file of yamlFiles) {
  let problem;
  try {
    parseYaml(readFileSync(absolute(file), "utf8"));
  } catch (error) {
    problem = error.message;
  }
  report(`yaml parses: ${file}`, problem);
}

console.log(`\n${totalChecks - failures.length} of ${totalChecks} checks passed. Tests run across all steps: ${testsInMainRuns}.`);
if (failures.length > 0) {
  console.log(`\n${failures.length} problem(s):\n${failures.map((failure) => `- ${failure.split("\n")[0]}`).join("\n")}`);
  process.exit(1);
}
console.log("Everything is green.");
