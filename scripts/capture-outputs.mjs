// Runs every step and demo for real and saves what they print, cleaned up, as the expected-output files.
//   node scripts/capture-outputs.mjs                    all steps, app and demos
//   node scripts/capture-outputs.mjs 04 07              only steps starting with those numbers
//   node scripts/capture-outputs.mjs app demo:float-sum only app, and one demo
//   node scripts/capture-outputs.mjs --summary file.json   also write a list of test counts per step
// Lesson text is copied from these files, so they must always come from a real run.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { absolute, demoRuns, projectFolders, stepRuns } from "./lib/runs.mjs";
import { listDemos, listTestFiles, normalizeOutput, parseTestCounts, runDescribed } from "./lib/steps.mjs";

const arguments_ = process.argv.slice(2);
const summaryIndex = arguments_.indexOf("--summary");
const summaryFile = summaryIndex === -1 ? undefined : arguments_[summaryIndex + 1];
const filters = arguments_.filter((_, index) => summaryIndex === -1 || (index !== summaryIndex && index !== summaryIndex + 1));

const wantsProject = (projectFolder) =>
  filters.length === 0 ||
  filters.some((filter) => {
    const folderName = path.posix.basename(projectFolder);
    return folderName === filter || (!projectFolder.startsWith("demos/") && folderName.startsWith(`${filter}-`));
  });
const wantsDemo = (demoName) => filters.length === 0 || filters.includes(`demo:${demoName}`) || filters.includes("demos");

function capture({ name, projectFolder, run, expectedExitCode, outputFile }) {
  const { exitCode, output } = runDescribed(projectFolder, run);
  const label = name === "main" ? projectFolder : `${projectFolder} [${name}]`;
  if (exitCode !== expectedExitCode) {
    console.log(`WARNING ${label}: exit code ${exitCode}, expected ${expectedExitCode}`);
  }
  mkdirSync(path.dirname(absolute(outputFile)), { recursive: true });
  const normalized = normalizeOutput(output);
  writeFileSync(absolute(outputFile), normalized, "utf8");
  console.log(`saved ${outputFile}`);
  return normalized;
}

const summary = {};
for (const projectFolder of projectFolders().filter(wantsProject)) {
  const runs = stepRuns(projectFolder);
  for (const run of runs) {
    const normalized = capture(run);
    if (run.name === "main") {
      const folderName = path.posix.basename(projectFolder);
      const counts = parseTestCounts(normalized);
      const argumentText = (run.run.args ?? []).join(" ");
      summary[folderName] = {
        tests: counts?.total,
        outcome: counts?.summary,
        command:
          projectFolder === "app"
            ? `npm test${argumentText ? ` -- ${argumentText}` : ""}`
            : `npm run test:step -- ${folderName}${argumentText ? ` ${argumentText}` : ""}`,
        files: listTestFiles(projectFolder),
      };
    }
  }
}

for (const demoName of listDemos().filter(wantsDemo)) {
  for (const run of demoRuns(demoName)) capture(run);
}

if (summaryFile) {
  writeFileSync(summaryFile, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  console.log(`saved ${summaryFile}`);
}
