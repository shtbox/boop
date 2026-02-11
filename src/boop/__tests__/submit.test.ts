import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockFetch, mockFetchError, mockFetchResponse } from "../../test/helpers";

vi.mock("../stack", () => ({
  ensureConsoleCapture: vi.fn(),
  getStackSnapshot: vi.fn()
}));

import { submitBoopFeedback } from "../submit";
import { ensureConsoleCapture, getStackSnapshot } from "../stack";

const endpoint = "https://example.com/feedback";

describe("submitBoopFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects empty messages and triggers validation callback", async () => {
    const mockFetch = createMockFetch();
    const onValidationError = vi.fn();

    await expect(
      submitBoopFeedback({
        endpoint,
        payload: { message: "   " },
        callbacks: { onValidationError }
      })
    ).rejects.toThrow(/feedback message/i);

    expect(onValidationError).toHaveBeenCalledWith(
      "message",
      "Please add a feedback message."
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("rejects invalid emails and triggers validation callback", async () => {
    const mockFetch = createMockFetch();
    const onValidationError = vi.fn();

    await expect(
      submitBoopFeedback({
        endpoint,
        payload: { message: "Hello", email: "not-an-email" },
        callbacks: { onValidationError }
      })
    ).rejects.toThrow(/valid email/i);

    expect(onValidationError).toHaveBeenCalledWith(
      "email",
      "Please provide a valid email address."
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("submits trimmed payload and merges metadata with stack snapshots", async () => {
    const mockFetch = createMockFetch();
    const onSubmitStart = vi.fn();
    const onSubmitSuccess = vi.fn();
    const stackSnapshot = { trace: "trace-value" };

    vi.mocked(getStackSnapshot).mockReturnValue(stackSnapshot);
    mockFetchResponse(mockFetch, { ok: true, status: 201 });

    await submitBoopFeedback({
      endpoint,
      payload: {
        name: " Ada ",
        email: " ada@example.com ",
        message: " Hello ",
        metadata: { page: "home" }
      },
      callbacks: { onSubmitStart, onSubmitSuccess },
      metadata: { source: "widget" },
      urlResolver: () => "https://site.test/page",
      includeStackTrace: true
    });

    expect(onSubmitStart).toHaveBeenCalledTimes(1);
    expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
    expect(ensureConsoleCapture).toHaveBeenCalledTimes(1);

    const [, options] = mockFetch.mock.calls[0];
    const payload = JSON.parse(options?.body as string);

    expect(payload).toEqual({
      url: "https://site.test/page",
      name: "Ada",
      email: "ada@example.com",
      message: "Hello",
      metadata: {
        source: "widget",
        page: "home",
        stack: stackSnapshot
      }
    });
  });

  it("does not override existing stack metadata", async () => {
    const mockFetch = createMockFetch();
    const existingStack = { trace: "existing" };

    vi.mocked(getStackSnapshot).mockReturnValue({ trace: "new" });
    mockFetchResponse(mockFetch, { ok: true });

    await submitBoopFeedback({
      endpoint,
      payload: {
        message: "Hello",
        metadata: { stack: existingStack }
      },
      includeStackTrace: true
    });

    const [, options] = mockFetch.mock.calls[0];
    const payload = JSON.parse(options?.body as string);

    expect(payload.metadata.stack).toEqual(existingStack);
  });

  it("prefers payload url over resolver", async () => {
    const mockFetch = createMockFetch();
    mockFetchResponse(mockFetch, { ok: true });

    await submitBoopFeedback({
      endpoint,
      payload: { message: "Hello", url: "https://explicit.example/test" },
      urlResolver: () => "https://resolver.example/fallback"
    });

    const [, options] = mockFetch.mock.calls[0];
    const payload = JSON.parse(options?.body as string);

    expect(payload.url).toBe("https://explicit.example/test");
  });

  it("rejects non-ok responses and calls submit error callback", async () => {
    const mockFetch = createMockFetch();
    const onSubmitError = vi.fn();

    mockFetchError(mockFetch, 400);

    await expect(
      submitBoopFeedback({
        endpoint,
        payload: { message: "Hello" },
        callbacks: { onSubmitError }
      })
    ).rejects.toThrow(/status 400/);

    expect(onSubmitError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("propagates fetch failures to submit error callback", async () => {
    const mockFetch = createMockFetch();
    const onSubmitError = vi.fn();

    mockFetch.mockRejectedValue(new Error("Network down"));

    await expect(
      submitBoopFeedback({
        endpoint,
        payload: { message: "Hello" },
        callbacks: { onSubmitError }
      })
    ).rejects.toThrow(/Network down/i);

    expect(onSubmitError).toHaveBeenCalledWith(expect.any(Error));
  });
});
