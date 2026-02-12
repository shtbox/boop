import React, { createRef } from "react";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { BoopHandle } from "../boop/types";
import { Boop } from "../Boop";
import { createMockFetch, mockFetchError, mockFetchResponse } from "../test/helpers";

const baseOptions = {
  projectId: "project-123",
  endpoint: "https://example.com/feedback",
  animation: { enabled: false }
};

const openPanel = () => {
  fireEvent.click(screen.getByRole("button", { name: /feedback/i }));
};

const fillMessage = (value: string) => {
  fireEvent.change(screen.getByPlaceholderText(/what would you like to share/i), {
    target: { value }
  });
};

describe("Boop", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    consoleError.mockRestore();
  });

  beforeEach(() => {
    mockFetch = createMockFetch();
  });

  it("throws when projectId is missing and default endpoint is used", () => {
    expect(() => render(<Boop />)).toThrow(/projectId/i);
  });

  it("does not require projectId when endpoint is overridden", () => {
    expect(() =>
      render(<Boop options={{ endpoint: "https://example.com/feedback" }} />)
    ).not.toThrow();
  });

  it("auto-opens the panel when configured", async () => {
    render(<Boop options={{ ...baseOptions, behavior: { autoOpen: true } }} />);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("opens the feedback panel when the button is clicked", () => {
    render(<Boop options={baseOptions} />);

    openPanel();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("validates the message before submit", async () => {
    render(<Boop options={baseOptions} />);

    openPanel();
    fillMessage("   ");
    fireEvent.click(screen.getByRole("button", { name: /send feedback/i }));

    expect(
      await screen.findByText(/please add a feedback message/i)
    ).toBeInTheDocument();
  });

  it("submits the feedback payload to the endpoint", async () => {
    mockFetchResponse(mockFetch, { ok: true });

    render(<Boop options={baseOptions} />);

    openPanel();
    fillMessage("Hello there");
    fireEvent.click(screen.getByRole("button", { name: /send feedback/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    const [url, options] = mockFetch.mock.calls[0];

    expect(url).toBe("https://example.com/feedback");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toEqual({ "Content-Type": "application/json" });

    const payload = JSON.parse(options?.body as string);
    expect(payload.message).toBe("Hello there");
    expect(payload.url).toContain("http");
  });

  it("shows a success message after submitting feedback", async () => {
    mockFetchResponse(mockFetch, { ok: true });

    render(<Boop options={baseOptions} />);

    openPanel();
    fillMessage("Hello there");
    fireEvent.click(screen.getByRole("button", { name: /send feedback/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByText(/submitted successfully/i)
    ).toBeInTheDocument();
  });

  it("closes the panel when closeOnSubmit is enabled", async () => {
    mockFetchResponse(mockFetch, { ok: true });

    render(
      <Boop
        options={{
          ...baseOptions,
          behavior: { closeOnSubmit: true }
        }}
      />
    );

    openPanel();
    fillMessage("Hello there");
    fireEvent.click(screen.getByRole("button", { name: /send feedback/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("shows error feedback when submit fails", async () => {
    mockFetchError(mockFetch, 500);

    render(<Boop options={baseOptions} />);

    openPanel();
    fillMessage("Hello there");
    fireEvent.click(screen.getByRole("button", { name: /send feedback/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByText(/request failed with status 500/i)
    ).toBeInTheDocument();
  });

  it("notifies when fields change", () => {
    const onFieldChange = vi.fn();

    render(<Boop options={{ ...baseOptions, callbacks: { onFieldChange } }} />);

    openPanel();
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Ada" }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "ada@example.com" }
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "Hello" }
    });

    expect(onFieldChange).toHaveBeenCalledWith("name", "Ada");
    expect(onFieldChange).toHaveBeenCalledWith("email", "ada@example.com");
    expect(onFieldChange).toHaveBeenCalledWith("message", "Hello");
  });

  it("respects initial vs controlled field values", async () => {
    const { rerender } = render(
      <Boop
        options={{
          ...baseOptions,
          behavior: { autoOpen: true },
          fieldValues: { name: "Ada" },
          fieldValuesMode: "initial"
        }}
      />
    );

    await screen.findByRole("dialog");
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Ada");

    fireEvent.change(nameInput, { target: { value: "Jane" } });

    rerender(
      <Boop
        options={{
          ...baseOptions,
          behavior: { autoOpen: true },
          fieldValues: { name: "Grace" },
          fieldValuesMode: "initial"
        }}
      />
    );

    expect((screen.getByLabelText(/name/i) as HTMLInputElement).value).toBe("Jane");

    rerender(
      <Boop
        options={{
          ...baseOptions,
          behavior: { autoOpen: true },
          fieldValues: { name: "Grace" },
          fieldValuesMode: "controlled"
        }}
      />
    );

    expect((screen.getByLabelText(/name/i) as HTMLInputElement).value).toBe(
      "Grace"
    );
  });

  it("supports ref-based field updates", async () => {
    const ref = createRef<BoopHandle>();

    render(<Boop ref={ref} options={{ ...baseOptions, behavior: { autoOpen: true } }} />);

    await screen.findByRole("dialog");

    act(() => {
      ref.current?.setFieldValue("name", "Ada");
      ref.current?.setFieldValues({ email: "ada@example.com", message: "Hi" });
    });

    expect((screen.getByLabelText(/name/i) as HTMLInputElement).value).toBe("Ada");
    expect((screen.getByLabelText(/email/i) as HTMLInputElement).value).toBe(
      "ada@example.com"
    );
    expect((screen.getByLabelText(/message/i) as HTMLTextAreaElement).value).toBe(
      "Hi"
    );
  });

  it("renders custom success UI and allows reset", async () => {
    const onSuccessRenderer = vi.fn((payload, helpers) => (
      <button type="button" onClick={helpers.reset}>
        Start over
      </button>
    ));

    mockFetchResponse(mockFetch, { ok: true });

    render(<Boop options={{ ...baseOptions, onSuccessRenderer }} />);

    openPanel();
    fillMessage("Hello there");
    fireEvent.click(screen.getByRole("button", { name: /send feedback/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    const resetButton = await screen.findByRole("button", { name: /start over/i });

    expect(onSuccessRenderer).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Hello there" }),
      expect.any(Object)
    );

    fireEvent.click(resetButton);

    expect(
      await screen.findByRole("textbox", { name: /message/i })
    ).toBeInTheDocument();
  });

  it("renders footer slots and hides attribution when disabled", async () => {
    render(
      <Boop
        options={{
          ...baseOptions,
          behavior: { autoOpen: true },
          slots: { footer: <span>Footer content</span> },
          attribution: false
        }}
      />
    );

    await screen.findByRole("dialog");

    expect(screen.getByText("Footer content")).toBeInTheDocument();
    expect(screen.queryByText(/powered by/i)).not.toBeInTheDocument();
  });
});
