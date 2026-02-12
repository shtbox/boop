import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ensureConsoleCapture, getStackSnapshot } from "../stack";

describe("stack capture", () => {
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  };

  beforeAll(() => {
    console.log = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterAll(() => {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  it("returns undefined when there are no entries", () => {
    expect(getStackSnapshot()).toBeUndefined();
  });

  it("captures console entries and error stacks", () => {
    ensureConsoleCapture();

    console.error(new Error("Boom"));
    console.log("hello");

    const snapshot = getStackSnapshot();

    expect(snapshot?.trace).toMatch(/Boom/);
    expect(snapshot?.console?.some((entry) => entry.level === "error")).toBe(true);
    expect(snapshot?.console?.some((entry) => entry.message.includes("hello"))).toBe(
      true
    );
  });
});
