import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const targetArg = process.argv[2] ?? "all";
const reactFlagIndex = process.argv.indexOf("--react");
const reactVersion = reactFlagIndex >= 0 ? process.argv[reactFlagIndex + 1] : undefined;

const targetMap = {
  vite: "vite-react",
  next: "next-app"
};

const targets =
  targetArg === "all"
    ? [targetMap.vite, targetMap.next]
    : targetMap[targetArg]
      ? [targetMap[targetArg]]
      : [];

if (targets.length === 0) {
  throw new Error(`Unknown smoke target: ${targetArg}`);
}

const rootDir = process.cwd();

const run = (command, cwd = rootDir) => {
  console.log(`\n$ ${command}\n  cwd: ${cwd}`);
  execSync(command, { cwd, stdio: "inherit" });
};

const runCapture = (command, cwd = rootDir) => {
  console.log(`\n$ ${command}\n  cwd: ${cwd}`);
  return execSync(command, { cwd, encoding: "utf8" });
};

const parsePackFileName = (rawOutput) => {
  const start = rawOutput.indexOf("[");
  if (start === -1) {
    throw new Error("Unable to parse npm pack output.");
  }
  const parsed = JSON.parse(rawOutput.slice(start));
  const filename = parsed?.[0]?.filename;
  if (!filename) {
    throw new Error("npm pack did not return a filename.");
  }
  return filename;
};

run("npm run build");
const packOutput = runCapture("npm pack --json");
const tarballFileName = parsePackFileName(packOutput);
const tarballPath = resolve(rootDir, tarballFileName);

try {
  for (const exampleName of targets) {
    const exampleDir = resolve(rootDir, "examples", exampleName);

    run("npm install --no-audit --no-fund", exampleDir);

    if (reactVersion) {
      run(
        `npm install --no-audit --no-fund react@${reactVersion} react-dom@${reactVersion}`,
        exampleDir
      );
    }

    run(`npm install --no-audit --no-fund "${tarballPath}"`, exampleDir);
    run("npm run build", exampleDir);
  }
} finally {
  if (existsSync(tarballPath)) {
    rmSync(tarballPath);
  }
}
