/**
 * @vitest-environment node
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("SSR safety", () => {
  it("imports the server entry in Node without throwing", async () => {
    const mod = await import("../server");

    expect(typeof mod.defaultUrlResolver).toBe("function");
    expect(typeof mod.resolveUrlFromLocation).toBe("function");
  });

  it("imports the root entry in Node without throwing", async () => {
    const mod = await import("../index");

    expect(typeof mod.Boop).toBe("object");
  });

  it("routes package root exports to the client wrapper", async () => {
    const packageJsonRaw = await readFile(resolve(process.cwd(), "package.json"), "utf8");
    const packageJson = JSON.parse(packageJsonRaw);

    expect(packageJson.exports["."].import).toBe("./dist/client.js");
    expect(packageJson.exports["."].require).toBe("./dist/client.cjs");
  });
});
