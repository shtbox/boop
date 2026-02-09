import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Boop } from "../Boop";

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  globalThis.fetch = mockFetch;
});

describe("Boop", () => {
  it("throws when projectId is missing and default endpoint is used", () => {
    expect(() => render(<Boop />)).toThrow(/projectId/i);
  });

  it("does not require projectId when endpoint is overridden", () => {
    expect(() =>
      render(<Boop options={{ endpoint: "https://example.com/feedback" }} />)
    ).not.toThrow();
  });

  it("opens the feedback panel when the button is clicked", () => {
    render(<Boop options={{ projectId: "project-123" }} />);

    fireEvent.click(screen.getByRole("button", { name: /feedback/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("validates the message before submit", () => {
    render(<Boop options={{ projectId: "project-123" }} />);

    fireEvent.click(screen.getByRole("button", { name: /feedback/i }));
    fireEvent.click(screen.getByRole("button", { name: /send feedback/i }));

    expect(screen.getByText(/please add a feedback message/i)).toBeInTheDocument();
  });

  it("submits the feedback payload to the endpoint", async () => {
    mockFetch.mockResolvedValue({ ok: true });

    render(
      <Boop
        options={{
          projectId: "project-123",
          endpoint: "https://example.com/feedback"
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /feedback/i }));
    fireEvent.change(screen.getByPlaceholderText(/what would you like to share/i), {
      target: { value: "Hello there" }
    });
    fireEvent.click(screen.getByRole("button", { name: /send feedback/i }));

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];

    expect(url).toBe("https://example.com/feedback");
    expect(options?.method).toBe("POST");
    expect(options?.headers).toEqual({ "Content-Type": "application/json" });

    const payload = JSON.parse(options?.body as string);
    expect(payload.message).toBe("Hello there");
    expect(payload.url).toContain("http");
  });
});
