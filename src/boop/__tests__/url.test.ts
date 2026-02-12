import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultUrlResolver, resolveUrlFromLocation } from "../url";

describe("resolveUrlFromLocation", () => {
  it("prefers href when available", () => {
    expect(
      resolveUrlFromLocation({ href: "https://example.com/full" })
    ).toBe("https://example.com/full");
  });

  it("builds a URL from origin and pathname details", () => {
    expect(
      resolveUrlFromLocation({
        origin: "https://example.com",
        pathname: "/path",
        search: "?q=1",
        hash: "#top"
      })
    ).toBe("https://example.com/path?q=1#top");
  });

  it("returns undefined when location is incomplete", () => {
    expect(resolveUrlFromLocation({ origin: "https://example.com" })).toBeUndefined();
  });
});

describe("defaultUrlResolver", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads the URL from window.location when available", () => {
    expect(defaultUrlResolver()).toBe(window.location.href);
  });

  it("falls back to globalThis.location when window is unavailable", () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("location", {
      origin: "https://fallback.example",
      pathname: "/path"
    });

    expect(defaultUrlResolver()).toBe("https://fallback.example/path");
  });
});
