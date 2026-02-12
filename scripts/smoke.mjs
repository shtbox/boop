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

const stripAnsi = (value) => {
  const esc = String.fromCharCode(27);
  return value.split(esc).join("");
};

const parsePackFileName = (rawOutput) => {
  const withoutAnsi = stripAnsi(rawOutput);
  const match = withoutAnsi.match(/(\[\s*\{[\s\S]*\}\s*\])\s*$/);

  if (!match) {
    throw new Error("Unable to parse npm pack output.");
  }

  const parsed = JSON.parse(match[1]);
  const filename = parsed?.[0]?.filename;
  if (!filename) {
    throw new Error("npm pack did not return a filename.");
  }
  return filename;
};

run("npm run build");
const packOutput = runCapture("npm pack --json --ignore-scripts");
const tarballFileName = parsePackFileName(packOutput);
const tarballPath = resolve(rootDir, tarballFileName);

try {
  for (const exampleName of targets) {
    const exampleDir = resolve(rootDir, "examples", exampleName);

    run("npm ci --no-audit --no-fund", exampleDir);

    if (reactVersion) {
      run(
        `npm install --no-audit --no-fund --no-save react@${reactVersion} react-dom@${reactVersion}`,
        exampleDir
      );
    }

    run(`npm install --no-audit --no-fund --no-save "${tarballPath}"`, exampleDir);
    run("npm run build", exampleDir);
  }
} finally {
  if (existsSync(tarballPath)) {
    rmSync(tarballPath);
  }
}
