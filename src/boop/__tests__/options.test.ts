import { describe, expect, it } from "vitest";
import type { BoopOptions } from "../types";
import { DEFAULT_ENDPOINT } from "../constants";
import { combineBoopOptions, mergeBoopOptions } from "../options";

describe("mergeBoopOptions", () => {
  it("throws when projectId is missing for the default endpoint", () => {
    expect(() => mergeBoopOptions()).toThrow(/projectId/i);
  });

  it("trims projectId and appends it to the default endpoint", () => {
    const resolved = mergeBoopOptions({ projectId: "  project-42  " });

    expect(resolved.projectId).toBe("project-42");
    expect(resolved.endpoint).toBe(`${DEFAULT_ENDPOINT}/project-42`);
  });

  it("uses custom endpoints without requiring projectId", () => {
    const resolved = mergeBoopOptions({ endpoint: "https://custom.example/feedback" });

    expect(resolved.endpoint).toBe("https://custom.example/feedback");
    expect(resolved.projectId).toBe("");
  });
});

describe("combineBoopOptions", () => {
  it("merges nested option objects without losing base values", () => {
    const base: BoopOptions = {
      widgetOptions: {
        labels: { name: "Full Name" },
        button: { label: "Send feedback" }
      },
      style: {
        classNames: { root: "root-class" },
        theme: { "--boop-button": "#123456" }
      },
      fieldValues: { name: "Ada" },
      fieldValuesMode: "initial",
      metadata: { source: "base" }
    };
    const overrides: BoopOptions = {
      widgetOptions: {
        labels: { email: "Email address" }
      },
      style: {
        classNames: { button: "button-class" },
        theme: { "--boop-text": "#654321" }
      },
      fieldValues: { email: "ada@example.com" },
      fieldValuesMode: "controlled",
      metadata: { campaign: "spring" }
    };

    const combined = combineBoopOptions(base, overrides);

    expect(combined.widgetOptions?.labels).toEqual({
      name: "Full Name",
      email: "Email address"
    });
    expect(combined.style?.classNames).toEqual({
      root: "root-class",
      button: "button-class"
    });
    expect(combined.style?.theme).toEqual({
      "--boop-button": "#123456",
      "--boop-text": "#654321"
    });
    expect(combined.fieldValues).toEqual({
      name: "Ada",
      email: "ada@example.com"
    });
    expect(combined.fieldValuesMode).toBe("controlled");
    expect(combined.metadata).toEqual({
      source: "base",
      campaign: "spring"
    });
  });
});
