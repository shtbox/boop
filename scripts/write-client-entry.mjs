import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const distDir = resolve("dist");

await Promise.all([
  writeFile(
    resolve(distDir, "client.js"),
    `"use client";\n\nexport { Boop, BoopProvider, defaultUrlResolver, resolveUrlFromLocation, useBoop } from "./index.js";\n`,
    "utf8"
  ),
  writeFile(
    resolve(distDir, "client.cjs"),
    `"use client";\n\nmodule.exports = require("./index.cjs");\n`,
    "utf8"
  ),
  writeFile(resolve(distDir, "client.d.ts"), `export * from "./index";\n`, "utf8"),
  writeFile(resolve(distDir, "client.d.cts"), `export * from "./index";\n`, "utf8")
]);
