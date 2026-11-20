// Checks the deliberately failing demos in demos/. Each demo must fail (or pass) exactly the way its
// demo.json says, and print exactly what its expected-output file says (timings and paths removed).
//   node scripts/verify-demos.mjs          (or: npm.cmd run verify:demos)
import { allDemoRuns, absolute } from "./lib/runs.mjs";
import { normalizeOutput, readExpected, runDescribed } from "./lib/steps.mjs";

const failures = [];

for (const { name, projectFolder, run, expectedExitCode, outputFile } of allDemoRuns()) {
  const label = `${projectFolder} [${name}]`;
  const { exitCode, output } = runDescribed(projectFolder, run);
  const expected = readExpected(absolute(outputFile));
  const actual = normalizeOutput(output);

  let problem;
  if (exitCode !== expectedExitCode) problem = `exit code ${exitCode}, expected ${expectedExitCode}`;
  else if (expected === undefined) problem = `${outputFile} is missing (run: node scripts/capture-outputs.mjs demos)`;
  else if (expected !== actual) problem = `output differs from ${outputFile}`;

  if (problem) {
    failures.push(`${label}: ${problem}`);
    console.log(`FAIL  ${label}: ${problem}`);
  } else {
    console.log(`PASS  ${label} (exit code ${exitCode}, as expected)`);
  }
}

if (failures.length > 0) {
  console.log(`\n${failures.length} demo(s) did not behave as expected.`);
  process.exit(1);
}
console.log("\nAll demos behave as described.");
