// Runs the tests of one project from the repo root.
//   npm.cmd run test:step -- 04-assertions-equality-collections-and-floats
//   npm.cmd run test:step -- 04 -t "adds"      (a number is enough; extra words go to Vitest)
//   npm.cmd test                               (the finished app)
import { spawnSync } from "node:child_process";
import { repoRoot, resolveProject, vitestArguments } from "./lib/steps.mjs";

const [name, ...vitestOptions] = process.argv.slice(2);
if (!name) {
  console.error('Tell me which project to test, for example: npm.cmd run test:step -- 04');
  process.exit(2);
}

let projectFolder;
try {
  projectFolder = resolveProject(name);
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

const result = spawnSync(process.execPath, vitestArguments(projectFolder, vitestOptions), {
  cwd: repoRoot,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
