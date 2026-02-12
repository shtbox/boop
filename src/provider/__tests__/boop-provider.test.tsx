import React, { useEffect } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import type { BoopContextValue } from "../boop-provider";
import { BoopProvider, useBoop } from "../boop-provider";
import { DEFAULT_ENDPOINT } from "../../boop/constants";
import { submitBoopFeedback } from "../../boop/submit";

vi.mock("../../boop/submit", () => ({
  submitBoopFeedback: vi.fn()
}));

type ContextProbeProps = {
  onChange: (value: BoopContextValue) => void;
};

const ContextProbe = ({ onChange }: ContextProbeProps) => {
  const context = useBoop();

  useEffect(() => {
    onChange(context);
  }, [context, onChange]);

  return null;
};

describe("BoopProvider", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleError.mockRestore();
  });

  it("throws when useBoop is called outside the provider", () => {
    const Consumer = () => {
      useBoop();
      return null;
    };

    expect(() => render(<Consumer />)).toThrow(/BoopProvider/i);
  });

  it("updates and resets options", async () => {
    let latest: BoopContextValue | undefined;

    render(
      <BoopProvider
        defaultOptions={{ style: { classNames: { root: "root-class" } } }}
      >
        <ContextProbe onChange={(value) => { latest = value; }} />
      </BoopProvider>
    );

    await waitFor(() => expect(latest).toBeDefined());

    act(() => {
      latest?.updateOptions({ style: { classNames: { button: "button-class" } } });
    });

    await waitFor(() =>
      expect(latest?.options.style?.classNames?.button).toBe("button-class")
    );
    expect(latest?.options.style?.classNames?.root).toBe("root-class");

    act(() => {
      latest?.resetOptions();
    });

    await waitFor(() =>
      expect(latest?.options.style?.classNames?.button).toBeUndefined()
    );
    expect(latest?.options.style?.classNames?.root).toBe("root-class");
  });

  it("updates field values through helpers", async () => {
    let latest: BoopContextValue | undefined;

    render(
      <BoopProvider>
        <ContextProbe onChange={(value) => { latest = value; }} />
      </BoopProvider>
    );

    await waitFor(() => expect(latest).toBeDefined());

    act(() => {
      latest?.setFieldValue("name", "Ada");
      latest?.setFieldValues({ email: "ada@example.com" });
    });

    await waitFor(() =>
      expect(latest?.options.fieldValues?.name).toBe("Ada")
    );
    expect(latest?.options.fieldValues?.email).toBe("ada@example.com");
  });

  it("submits feedback using merged options", async () => {
    let latest: BoopContextValue | undefined;
    vi.mocked(submitBoopFeedback).mockResolvedValue({ ok: true } as Response);

    render(
      <BoopProvider
        defaultOptions={{
          projectId: "project-123",
          metadata: { source: "base" },
          includeStackTrace: true,
          urlResolver: () => "https://example.com/current"
        }}
      >
        <ContextProbe onChange={(value) => { latest = value; }} />
      </BoopProvider>
    );

    await waitFor(() => expect(latest).toBeDefined());

    await act(async () => {
      await latest?.submitFeedback(
        { message: "Hello" },
        { endpoint: "https://custom.example/feedback", metadata: { tag: "override" } }
      );
    });

    expect(submitBoopFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: "https://custom.example/feedback",
        includeStackTrace: true,
        metadata: { source: "base", tag: "override" },
        payload: { message: "Hello" },
        urlResolver: expect.any(Function)
      })
    );

    expect(submitBoopFeedback).not.toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: `${DEFAULT_ENDPOINT}/project-123` })
    );
  });
});
