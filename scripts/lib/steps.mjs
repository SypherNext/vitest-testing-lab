// Shared helpers for the scripts in this folder: finding projects, running Vitest the same way every time,
// and cleaning up its output so it can be compared with a saved copy.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const vitestEntry = path.join(repoRoot, "node_modules", "vitest", "vitest.mjs");

function listFolders(folder) {
  const fullPath = path.join(repoRoot, folder);
  if (!existsSync(fullPath)) return [];
  return readdirSync(fullPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export const listSteps = () => listFolders("steps");
export const listDemos = () => listFolders("demos");

// "app", "04" or "04-assertions-equality-collections-and-floats" all work.
export function resolveProject(name) {
  if (name === "app") return "app";
  const match = listSteps().find((step) => step === name || step.startsWith(`${name}-`));
  if (!match) {
    throw new Error(`No step called "${name}". Try "app", a number such as "04", or a full folder name.`);
  }
  return path.posix.join("steps", match);
}

export function readJsonIfPresent(file) {
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : undefined;
}

// Vitest changes its output when it detects a CI service, a coding assistant or a colour terminal.
// A short list of variables to keep makes the captured output the same on every machine.
const environmentNamesToKeep = [
  "PATH", "Path", "PATHEXT", "SystemRoot", "SYSTEMROOT", "windir", "COMSPEC", "ComSpec",
  "TEMP", "TMP", "TMPDIR", "HOME", "USERPROFILE", "APPDATA", "LOCALAPPDATA", "HOMEDRIVE",
  "HOMEPATH", "USERNAME", "LANG", "LC_ALL", "ProgramFiles", "ProgramData", "NUMBER_OF_PROCESSORS",
];

export function cleanEnvironment(extra = {}) {
  const env = {};
  for (const name of environmentNamesToKeep) {
    if (process.env[name] !== undefined) env[name] = process.env[name];
  }
  return { ...env, NO_COLOR: "1", CI: "true", ...extra };
}

// Arguments for "node vitest.mjs <subcommand> --root <folder> ...".
export function vitestArguments(projectFolder, extraArguments, subcommand = "run") {
  return [vitestEntry, subcommand, "--root", projectFolder, ...extraArguments];
}

export function runCaptured(command, args, { cwd = repoRoot, env = {} } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: cleanEnvironment(env),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  return { exitCode: result.status ?? 1, output: `${result.stdout}${result.stderr}` };
}

// Runs Vitest on a project folder and returns everything it printed (stdout and stderr together) plus the exit code.
export function runVitestCaptured(projectFolder, extraArguments = [], { subcommand = "run", env = {} } = {}) {
  return runCaptured(process.execPath, vitestArguments(projectFolder, extraArguments, subcommand), { env });
}

// One run described in a step.json or demo.json file:
//   { "args": [...], "env": {...}, "subcommand": "list" }                  -> Vitest on the project folder
//   { "command": ["node", "steps/02-.../manual-check.ts"] }                -> any command, run from the repo root
export function runDescribed(projectFolder, run) {
  if (run.command) {
    const [program, ...rest] = run.command;
    return runCaptured(program === "node" ? process.execPath : program, rest, { env: run.env });
  }
  return runVitestCaptured(projectFolder, run.args ?? [], { subcommand: run.subcommand, env: run.env });
}

const ANSI_PATTERN = /\u001B\[[0-9;]*[A-Za-z]/g;
const FILE_LINE = /^ ?(?:✓|❯|×|↓|□|✗) +(\S+\.(?:test|spec)\.[cm]?[jt]sx?)(?: |$)/;

// Makes real Vitest output comparable between runs, machines and operating systems:
// no colours, no timings, no absolute paths, and the file results in alphabetical order
// (Vitest prints a file as soon as it finishes, and that order changes from run to run).
export function normalizeOutput(rawOutput) {
  const rootWithSlashes = repoRoot.split(path.sep).join("/");
  let text = rawOutput.replace(ANSI_PATTERN, "").replaceAll("\r\n", "\n");
  text = text.replaceAll(rootWithSlashes, "<repo>").replaceAll(repoRoot, "<repo>");

  const lines = text
    .split("\n")
    .filter((line) => !/^\s*(Start at|Duration|Isolate)\s/.test(line) && !/^\s+at least ~/.test(line))
    .map((line) =>
      line
        .replace(/ \d+(?:\.\d+)?ms\b/g, "")
        .replace(/ \d+(?:\.\d+)?s$/, "")
        .trimEnd(),
    );

  // "vitest list --filesOnly" prints bare file paths in the order the disk returns them: sort those too.
  const nonEmptyLines = lines.filter((line) => line !== "");
  if (nonEmptyLines.length > 0 && nonEmptyLines.every((line) => /^[\w./-]+\.(test|spec)\.[cm]?[jt]sx?$/.test(line))) {
    return `${[...nonEmptyLines].sort().join("\n")}\n`;
  }

  return `${sortFileResults(lines).join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

// Puts the first run of per-file result lines in alphabetical order, keeping each line's indented details with it.
function sortFileResults(lines) {
  const start = lines.findIndex((line) => FILE_LINE.test(line));
  if (start === -1) return lines;
  let end = start;
  while (end < lines.length && lines[end] !== "") end += 1;

  const blocks = [];
  for (const line of lines.slice(start, end)) {
    const match = FILE_LINE.exec(line);
    if (match) blocks.push({ key: match[1], lines: [line] });
    else blocks[blocks.length - 1].lines.push(line);
  }
  blocks.sort((first, second) => (first.key < second.key ? -1 : first.key > second.key ? 1 : 0));
  return [...lines.slice(0, start), ...blocks.flatMap((block) => block.lines), ...lines.slice(end)];
}

// Reads a saved expected-output file and puts it through the same clean-up, so line endings cannot cause a mismatch.
export function readExpected(file) {
  return existsSync(file) ? normalizeOutput(readFileSync(file, "utf8")) : undefined;
}

// "Tests  235 passed | 1 expected fail | 2 skipped | 2 todo (240)" -> the numbers.
export function parseTestCounts(output) {
  const line = output.split("\n").find((candidate) => /^\s*Tests\s/.test(candidate));
  if (!line) return undefined;
  const total = /\((\d+)\)\s*$/.exec(line.trim());
  return { summary: line.trim().replace(/^Tests\s+/, ""), total: total ? Number(total[1]) : undefined };
}

// The test files of a project folder, relative to that folder.
export function listTestFiles(projectFolder) {
  const found = [];
  const walk = (folder) => {
    for (const entry of readdirSync(path.join(repoRoot, folder), { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === "coverage") continue;
      const relative = path.posix.join(folder, entry.name);
      if (entry.isDirectory()) walk(relative);
      else if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(entry.name)) found.push(path.posix.relative(projectFolder, relative));
    }
  };
  walk(projectFolder);
  return found.sort();
}
