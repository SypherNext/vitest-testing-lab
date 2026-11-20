// Describes every captured run of the repo: the runs of a step (or of "app") and the runs of a demo.
//
//   steps/NN-name/step.json   (optional)  { "args": ["--coverage"], "extraRuns": [ { "name": "...", "args": [...] } ] }
//   demos/name/demo.json                  { "description": "...", "runs": [ { "name": "...", "args": [...], "exitCode": 1 } ] }
//
// The main run of a step is saved as expected-output.txt, its extra runs as extra-outputs/<name>.txt.
import path from "node:path";
import { listDemos, listSteps, readJsonIfPresent, repoRoot } from "./steps.mjs";

const absolute = (relative) => path.join(repoRoot, relative);

export function stepRuns(projectFolder) {
  const config = readJsonIfPresent(absolute(path.posix.join(projectFolder, "step.json"))) ?? {};
  const main = {
    name: "main",
    projectFolder,
    run: { args: config.args ?? [] },
    expectedExitCode: 0,
    outputFile: path.posix.join(projectFolder, "expected-output.txt"),
  };
  const extras = (config.extraRuns ?? []).map((extra) => ({
    name: extra.name,
    projectFolder,
    run: extra,
    expectedExitCode: extra.exitCode ?? 0,
    outputFile: path.posix.join(projectFolder, "extra-outputs", `${extra.name}.txt`),
  }));
  return [main, ...extras];
}

export function demoRuns(demoName) {
  const projectFolder = path.posix.join("demos", demoName);
  const config = readJsonIfPresent(absolute(path.posix.join(projectFolder, "demo.json")));
  if (!config) throw new Error(`demos/${demoName}/demo.json is missing`);
  return config.runs.map((run) => ({
    name: run.name,
    projectFolder,
    run,
    expectedExitCode: run.exitCode,
    outputFile: path.posix.join(projectFolder, run.output ?? "expected-output.txt"),
  }));
}

export const projectFolders = () => ["app", ...listSteps().map((step) => path.posix.join("steps", step))];

export function allStepRuns() {
  return projectFolders().flatMap(stepRuns);
}

export function allDemoRuns() {
  return listDemos().flatMap(demoRuns);
}

export { absolute };
