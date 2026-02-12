import { afterEach, describe, expect, it, vi } from "vitest";
import { isValidEmail, mergeClassNames } from "../utils";

describe("mergeClassNames", () => {
  it("joins base and custom class names", () => {
    expect(mergeClassNames("base", "custom")).toBe("base custom");
  });

  it("drops empty values", () => {
    expect(mergeClassNames("base", undefined)).toBe("base");
  });
});

describe("isValidEmail", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns true for empty values", () => {
    expect(isValidEmail("")).toBe(true);
  });

  it("returns false for invalid email formats", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
  });

  it("returns true for valid email formats", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("returns true when document is unavailable", () => {
    vi.stubGlobal("document", undefined);

    expect(isValidEmail("still@valid.com")).toBe(true);
  });
});
