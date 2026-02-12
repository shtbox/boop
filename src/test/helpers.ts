import { vi } from "vitest";

export const createMockFetch = () => {
  const mock = vi.fn();
  globalThis.fetch = mock as unknown as typeof fetch;
  return mock;
};

export const mockFetchResponse = (
  mock: ReturnType<typeof vi.fn>,
  response: Partial<Response>
) => {
  mock.mockResolvedValue({ ok: true, status: 200, ...response } as Response);
};

export const mockFetchError = (
  mock: ReturnType<typeof vi.fn>,
  status = 500
) => {
  mock.mockResolvedValue({ ok: false, status } as Response);
};
